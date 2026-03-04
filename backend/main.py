import os
import io
import datetime
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import requests

import json
from io import BytesIO
from fastapi.responses import StreamingResponse
from docx import Document as DocxDocument

from sqlalchemy import Text
from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
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

class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)

    analysis_json = Column(JSONB, nullable=True)
    llm_report = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

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

    db = SessionLocal()
    db.add(AnalysisResult(
        doc_id=doc_id,
        analysis_json=analysis,
        llm_report=llm_report
    ))
    db.commit()
    db.close()

    return {
        "filename": filename,
        "analysis": analysis,
        "llm_report": llm_report
    }

@app.get("/report_word/{doc_id}")
def report_word(doc_id: int):
    db = SessionLocal()

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        db.close()
        return {"error": "Document not found"}

    result = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.doc_id == doc_id)
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )
    db.close()

    if not result:
        return {"error": "No analysis found for this document yet. Run analyze first."}

    # Формируем DOCX
    d = DocxDocument()
    d.add_heading("Отчёт анализа ВКР", level=1)
    d.add_paragraph(f"Файл: {doc.filename}")
    d.add_paragraph(f"Дата: {result.created_at}")

    d.add_heading("Отчёт LLM", level=2)
    d.add_paragraph(result.llm_report or "—")

    d.add_heading("Технический анализ (JSON)", level=2)
    d.add_paragraph(json.dumps(result.analysis_json or {}, ensure_ascii=False, indent=2))

    buf = BytesIO()
    d.save(buf)
    buf.seek(0)

    safe_name = doc.filename.replace("/", "_").replace("\\", "_")
    out_name = f"report_{doc_id}_{safe_name}.docx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{out_name}"'}
    )
