from pathlib import Path
import hashlib
import json
import math
import os
import re
import threading
import time

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()


class TextIn(BaseModel):
    text: str


def clean_text(t: str) -> str:
    t = t.lower()
    t = re.sub(r"[^a-zA-Zа-яА-Я0-9\s]", "", t)
    return t.strip()


def build_fallback_vector(words: list[str]) -> list[float]:
    """Build a deterministic numeric text vector when no embedding model is available."""
    dim = int(os.getenv("FALLBACK_VECTOR_DIM", "128"))
    vector = [0.0] * dim

    for word in words:
        digest = hashlib.sha256(word.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dim
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vector[index] += sign

    norm = math.sqrt(sum(value * value for value in vector))
    if norm:
        vector = [value / norm for value in vector]

    return [round(value, 6) for value in vector]


model = None
model_source = "not_loaded"
model_display_name = None
model_error = None
model_loading = False
model_lock = threading.Lock()


def _env_enabled(name: str, default: str = "0") -> bool:
    return os.getenv(name, default).lower() in {"1", "true", "yes", "on"}


def local_embedding_required() -> bool:
    return _env_enabled("REQUIRE_LOCAL_EMBEDDING_MODEL", "1")


def detect_local_model_name(model_path: Path) -> str | None:
    readme = model_path / "README.md"
    if readme.exists():
        for line in readme.read_text(encoding="utf-8", errors="ignore").splitlines():
            if line.startswith("# "):
                title = line.lstrip("#").strip()
                if title:
                    if "/" in title:
                        return title
                    return f"sentence-transformers/{title}"

    config = model_path / "config.json"
    if config.exists():
        try:
            return json.loads(config.read_text(encoding="utf-8")).get("_name_or_path")
        except json.JSONDecodeError:
            return None

    return None


def load_embedding_model():
    """Load embedding model with safe fallbacks.

    Priority:
    1) Local mounted model folder from `SENTENCE_MODEL_PATH`, default `/app/model`
    2) HuggingFace model id from env `SENTENCE_MODEL_ID`, only when enabled
    3) No model (service still works with deterministic fallback vectors)
    """
    try:
        from sentence_transformers import SentenceTransformer
    except Exception as e:
        return None, "none", f"sentence-transformers import failed: {e}", None

    local_model = Path(os.getenv("SENTENCE_MODEL_PATH", "/app/model"))
    if local_model.exists() and local_model.is_dir():
        display_name = os.getenv("SENTENCE_MODEL_NAME") or detect_local_model_name(local_model)
        try:
            return SentenceTransformer(str(local_model)), f"local:{local_model}", None, display_name
        except Exception as e:
            return None, f"local_failed:{local_model}", str(e), display_name

    if not _env_enabled("ENABLE_REMOTE_MODEL_DOWNLOAD"):
        return None, "disabled", "Set ENABLE_REMOTE_MODEL_DOWNLOAD=1 to load a HuggingFace model at runtime", None

    model_id = os.getenv("SENTENCE_MODEL_ID", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    try:
        return SentenceTransformer(model_id), f"hf:{model_id}", None, model_id
    except Exception as e:
        return None, f"hf_failed:{model_id}", str(e), model_id


def ensure_embedding_model_loaded():
    global model, model_source, model_display_name, model_error, model_loading

    with model_lock:
        if model_source != "not_loaded" or model_loading:
            return
        model_loading = True

    loaded_model, loaded_source, loaded_error, loaded_display_name = load_embedding_model()

    with model_lock:
        model = loaded_model
        model_source = loaded_source
        model_display_name = loaded_display_name
        model_error = loaded_error
        model_loading = False

    if model_error:
        print(f"[AI] Embedding model source: {model_source}; error: {model_error}")
    else:
        print(f"[AI] Embedding model source: {model_source}; model: {model_display_name}")


def wait_for_embedding_model():
    ensure_embedding_model_loaded()
    deadline = time.time() + float(os.getenv("EMBEDDING_MODEL_WAIT_SECONDS", "60"))

    while time.time() < deadline:
        with model_lock:
            if not model_loading:
                return
        time.sleep(0.2)


@app.on_event("startup")
def startup():
    threading.Thread(target=ensure_embedding_model_loaded, daemon=True).start()


@app.get("/health")
def health():
    with model_lock:
        source = model_source
        display_name = model_display_name
        error = model_error
        loading = model_loading
        embedding_enabled = model is not None

    return {
        "status": "ok",
        "model_source": source,
        "model_name": display_name,
        "model_path": os.getenv("SENTENCE_MODEL_PATH", "/app/model"),
        "model_loading": loading,
        "embedding_enabled": embedding_enabled,
        "model_error": error,
        "fallback_vector_dim": int(os.getenv("FALLBACK_VECTOR_DIM", "128")),
    }


@app.post("/analyze")
async def analyze(data: TextIn):
    text = data.text or ""
    cleaned = clean_text(text)
    words = cleaned.split()

    total_words = len(words)
    unique_words = len(set(words))
    uniqueness = round(unique_words / total_words * 100, 2) if total_words else 0

    wait_for_embedding_model()

    with model_lock:
        active_model = model
        active_model_source = model_source
        active_model_name = model_display_name
        active_model_error = model_error

    if local_embedding_required() and active_model is None:
        raise HTTPException(
            status_code=503,
            detail=(
                "Local embedding model is not loaded. "
                f"source={active_model_source}; error={active_model_error}"
            ),
        )

    embedding = []
    embedding_source = active_model_source
    embedding_model = active_model_name
    embedding_error = active_model_error

    if active_model is not None:
        try:
            embedding = active_model.encode([text])[0].tolist()
            embedding = [round(float(value), 6) for value in embedding]
        except Exception as e:
            if local_embedding_required():
                raise HTTPException(status_code=500, detail=f"Embedding model encode failed: {e}") from e
            embedding = build_fallback_vector(words)
            embedding_source = "fallback:hashed-word-vector"
            embedding_model = None
            embedding_error = f"embedding model encode failed: {e}"
    else:
        embedding = build_fallback_vector(words)
        embedding_source = "fallback:hashed-word-vector"
        embedding_model = None

    embedding_dim = len(embedding)

    return {
        "cleaned": cleaned,
        "total_words": total_words,
        "unique_words": unique_words,
        "uniqueness": uniqueness,
        "embedding_dim": embedding_dim,
        "embedding": embedding,
        "embedding_source": embedding_source,
        "embedding_model": embedding_model,
        "embedding_error": embedding_error,
    }
