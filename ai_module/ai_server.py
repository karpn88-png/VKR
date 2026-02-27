from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import re

app = FastAPI()

class TextIn(BaseModel):
    text: str

def clean_text(t: str) -> str:
    t = t.lower()
    t = re.sub(r"[^a-zA-Zа-яА-Я0-9\s]", "", t)
    return t.strip()

# Загружаем модель ИЗ ЛОКАЛЬНОЙ ПАПКИ — без доступа в интернет
model = SentenceTransformer("./model")

@app.post("/analyze")
async def analyze(data: TextIn):
    text = data.text or ""
    cleaned = clean_text(text)
    words = cleaned.split()

    total_words = len(words)
    unique_words = len(set(words))
    uniqueness = round(unique_words / total_words * 100, 2) if total_words else 0

    embedding = model.encode([text])[0].tolist()

    return {
        "cleaned": cleaned,
        "total_words": total_words,
        "unique_words": unique_words,
        "uniqueness": uniqueness,
        "embedding_dim": len(embedding)
    }
