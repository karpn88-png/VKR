import os
import io
import datetime
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import requests

from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from gigachat_client import generate_report

# ============================================================
# DATABASE SETUP
# ============================================================

DATABASE_URL = os.getenv("DATABASE_URL")
AI_URL = os.getenv("AI_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content = Column(LargeBinary, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)


Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Загрузка файла в базу данных"""
    data = await file.read()

    db = SessionLocal()
    doc = Document(filename=file.filename, content=data)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    db.close()

    return {"status": "ok", "id": doc.id, "filename": file.filename}


@app.get("/documents")
def list_documents():
    """Вернуть список всех документов"""
    db = SessionLocal()
    docs = db.query(Document).order_by(Document.uploaded_at.desc()).all()
    db.close()

    return [
        {
            "id": d.id,
            "filename": d.filename,
            "uploaded_at": d.uploaded_at.isoformat(),
            "size": len(d.content)
        }
        for d in docs
    ]


@app.get("/document/{doc_id}")
def get_document(doc_id: int):
    """Получить информацию о документе"""
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    db.close()

    if not doc:
        return {"error": "not found"}

    return {
        "id": doc.id,
        "filename": doc.filename,
        "uploaded_at": doc.uploaded_at,
        "size": len(doc.content)
    }


@app.post("/analyze_document/{doc_id}")
def analyze_document(doc_id: int):
    """Извлечь текст из файла и отправить в AI-модуль для анализа"""
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    db.close()

    if not doc:
        return {"error": "Document not found"}

    filename = doc.filename.lower()

    # ============================================================
    # ИЗВЛЕЧЕНИЕ ТЕКСТА
    # ============================================================

    if filename.endswith(".txt"):
        text = doc.content.decode("utf-8", errors="ignore")

    elif filename.endswith(".docx"):
        from docx import Document as DocxDocument
        f = DocxDocument(io.BytesIO(doc.content))
        text = "\n".join(p.text for p in f.paragraphs)

    elif filename.endswith(".pdf"):
        import PyPDF2
        pdf = PyPDF2.PdfReader(io.BytesIO(doc.content))
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    else:
        return {"error": f"Unsupported file format: {filename}"}

    # ============================================================
    # ОТПРАВКА В AI-МОДУЛЬ
    # ===========================================================

    try:
        r = requests.post(f"{AI_URL}/analyze", json={"text": text})
        analysis = r.json()
    except Exception as e:
        return {
            "error": "AI module unavailable",
            "details": str(e)
        }

# GigaChat — отдельно, чтобы не ломать основной анализ
    try:
        llm_report = generate_report(text, local_signals={
            "local_analysis_summary": analysis
        })
    except Exception as e:
        llm_report = f"[GigaChat error] {e}"

    return {
        "filename": filename,
        "analysis": analysis,
        "llm_report": llm_report
    }
