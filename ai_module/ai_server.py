from pathlib import Path
import os
import re
import threading

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class TextIn(BaseModel):
    text: str


def clean_text(t: str) -> str:
    t = t.lower()
    t = re.sub(r"[^a-zA-Zа-яА-Я0-9\s]", "", t)
    return t.strip()


model = None
model_source = "not_loaded"
model_error = None
model_loading = False
model_lock = threading.Lock()


def _env_enabled(name: str, default: str = "0") -> bool:
    return os.getenv(name, default).lower() in {"1", "true", "yes", "on"}


def load_embedding_model():
    """Load embedding model with safe fallbacks.

    Priority:
    1) Local mounted model folder `/app/model` (offline mode)
    2) HuggingFace model id from env `SENTENCE_MODEL_ID`, only when enabled
    3) No model (service still works, returns embedding_dim=0)
    """
    try:
        from sentence_transformers import SentenceTransformer
    except Exception as e:
        return None, "none", f"sentence-transformers import failed: {e}"

    local_model = Path("/app/model")
    if local_model.exists() and local_model.is_dir():
        try:
            return SentenceTransformer(str(local_model)), f"local:{local_model}", None
        except Exception as e:
            return None, f"local_failed:{local_model}", str(e)

    if not _env_enabled("ENABLE_REMOTE_MODEL_DOWNLOAD"):
        return None, "disabled", "Set ENABLE_REMOTE_MODEL_DOWNLOAD=1 to load a HuggingFace model at runtime"

    model_id = os.getenv("SENTENCE_MODEL_ID", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    try:
        return SentenceTransformer(model_id), f"hf:{model_id}", None
    except Exception as e:
        return None, f"hf_failed:{model_id}", str(e)


def ensure_embedding_model_loaded():
    global model, model_source, model_error, model_loading

    with model_lock:
        if model_source != "not_loaded" or model_loading:
            return
        model_loading = True

    loaded_model, loaded_source, loaded_error = load_embedding_model()

    with model_lock:
        model = loaded_model
        model_source = loaded_source
        model_error = loaded_error
        model_loading = False

    if model_error:
        print(f"[AI] Embedding model source: {model_source}; error: {model_error}")
    else:
        print(f"[AI] Embedding model source: {model_source}")


@app.on_event("startup")
def startup():
    threading.Thread(target=ensure_embedding_model_loaded, daemon=True).start()


@app.get("/health")
def health():
    with model_lock:
        source = model_source
        error = model_error
        loading = model_loading
        embedding_enabled = model is not None

    return {
        "status": "ok",
        "model_source": source,
        "model_loading": loading,
        "embedding_enabled": embedding_enabled,
        "model_error": error,
    }


@app.post("/analyze")
async def analyze(data: TextIn):
    text = data.text or ""
    cleaned = clean_text(text)
    words = cleaned.split()

    total_words = len(words)
    unique_words = len(set(words))
    uniqueness = round(unique_words / total_words * 100, 2) if total_words else 0

    with model_lock:
        active_model = model

    embedding_dim = 0
    if active_model is not None:
        embedding = active_model.encode([text])[0].tolist()
        embedding_dim = len(embedding)

    return {
        "cleaned": cleaned,
        "total_words": total_words,
        "unique_words": unique_words,
        "uniqueness": uniqueness,
        "embedding_dim": embedding_dim,
    }
