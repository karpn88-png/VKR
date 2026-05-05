from pathlib import Path
import os
import re

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

app = FastAPI()


class TextIn(BaseModel):
    text: str


def clean_text(t: str) -> str:
    t = t.lower()
    t = re.sub(r"[^a-zA-Zа-яА-Я0-9\s]", "", t)
    return t.strip()


def load_embedding_model() -> tuple[SentenceTransformer | None, str]:
    """Load embedding model with safe fallbacks.

    Priority:
    1) Local mounted model folder `/app/model` (offline mode)
    2) HuggingFace model id from env `SENTENCE_MODEL_ID`
    3) No model (service still works, returns embedding_dim=0)
    """
    local_model = Path("/app/model")
    if local_model.exists() and local_model.is_dir():
        try:
            return SentenceTransformer(str(local_model)), f"local:{local_model}"
        except Exception as e:
            print(f"[AI] Failed to load local model {local_model}: {e}")

    model_id = os.getenv("SENTENCE_MODEL_ID", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    try:
        return SentenceTransformer(model_id), f"hf:{model_id}"
    except Exception as e:
        print(f"[AI] Failed to load HF model {model_id}: {e}")

    return None, "none"


model, model_source = load_embedding_model()
print(f"[AI] Embedding model source: {model_source}")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_source": model_source,
        "embedding_enabled": model is not None,
    }


@app.post("/analyze")
async def analyze(data: TextIn):
    text = data.text or ""
    cleaned = clean_text(text)
    words = cleaned.split()

    total_words = len(words)
    unique_words = len(set(words))
    uniqueness = round(unique_words / total_words * 100, 2) if total_words else 0

    embedding_dim = 0
    if model is not None:
        embedding = model.encode([text])[0].tolist()
        embedding_dim = len(embedding)

    return {
        "cleaned": cleaned,
        "total_words": total_words,
        "unique_words": unique_words,
        "uniqueness": uniqueness,
        "embedding_dim": embedding_dim,
    }
