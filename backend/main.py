import os
import io
import json
import datetime
import re
import time
from io import BytesIO
from urllib.parse import quote

import requests
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from docx import Document as DocxDocument

from sqlalchemy import create_engine, Column, Integer, String, LargeBinary, DateTime, ForeignKey, Text
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


def attachment_content_disposition(filename: str) -> str:
    safe_name = (filename or "attachment").replace("/", "_").replace("\\", "_").replace('"', "_")
    ascii_name = re.sub(r"[^A-Za-z0-9._ -]", "_", safe_name).strip() or "attachment"
    encoded_name = quote(safe_name, safe="")
    return f'attachment; filename="{ascii_name}"; filename*=UTF-8\'\'{encoded_name}'


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content = Column(LargeBinary, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)


class AnalysisResult(Base):
    """
    Храним:
    - llm_report (текстовый отчёт)
    - analysis_json (НО: только 4 метрики, не весь JSON)
    """
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), index=True, nullable=False)

    # Здесь сохраняем ТОЛЬКО:
    # total_words, unique_words, uniqueness, embedding_dim
    analysis_json = Column(JSONB, nullable=True)

    # Здесь сохраняем полный отчёт LLM
    llm_report = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class WorkThreadState(Base):
    __tablename__ = "work_thread_state"

    student_id = Column(Integer, primary_key=True, index=True)
    status = Column(String, default="Не проверено", nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    checked_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class WorkMessage(Base):
    __tablename__ = "work_messages"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, index=True, nullable=False)
    sender_role = Column(String, nullable=False)
    sender_name = Column(String, nullable=False)
    recipient_name = Column(String, nullable=True)
    text = Column(Text, nullable=True)
    message_type = Column(String, default="message", nullable=False)
    file_name = Column(String, nullable=True)
    file_content = Column(LargeBinary, nullable=True)
    file_content_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


Base.metadata.create_all(bind=engine)

STUDENT_PROFILE = {
    "id": 1,
    "fio": "Иванов Иван Иванович",
    "short_name": "Иванов И. И.",
    "group": "АТ-23",
    "topic": "Разработка информационной системы",
    "teacher": "Бакаев Максим Александрович",
}

TEACHER_PROFILE = {
    "short_name": "Бакаев М. А.",
    "full_name": "Бакаев Максим Александрович",
}


def extract_rtf_text(content: bytes) -> str:
    """Best-effort RTF to plain text extraction without external binaries."""
    raw = content.decode("utf-8", errors="ignore")
    if not raw.strip():
        raw = content.decode("cp1251", errors="ignore")

    def hex_to_char(match):
        return bytes.fromhex(match.group(1)).decode("cp1251", errors="ignore")

    def unicode_to_char(match):
        code = int(match.group(1))
        if code < 0:
            code += 65536
        return chr(code)

    text = re.sub(r"\\'([0-9a-fA-F]{2})", hex_to_char, raw)
    text = re.sub(r"\\u(-?\d+).", unicode_to_char, text)
    text = re.sub(r"\\par[d]?", "\n", text)
    text = re.sub(r"\\[a-zA-Z]+-?\d* ?", " ", text)
    text = re.sub(r"\\[^a-zA-Z0-9]", " ", text)
    text = text.replace("{", " ").replace("}", " ")
    return re.sub(r"\s+", " ", text).strip()


def extract_legacy_doc_text(content: bytes) -> str:
    """Best-effort extraction for legacy .doc when no office converter exists."""
    decoded = content.decode("cp1251", errors="ignore")
    decoded = re.sub(r"[^\w\s.,:;!?()\-—«»\"'№%/\\]+", " ", decoded, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", decoded).strip()

    if len(text) < 100:
        raise HTTPException(
            status_code=400,
            detail="Не удалось извлечь текст из .doc. Сохраните работу как .docx или .pdf и повторите проверку.",
        )

    return text


def run_ai_analysis(text: str) -> dict:
    if not AI_URL:
        raise HTTPException(status_code=503, detail="AI_URL is not configured")

    attempts = int(os.getenv("AI_REQUEST_ATTEMPTS", "6"))
    last_error = None

    for attempt in range(1, attempts + 1):
        try:
            response = requests.post(f"{AI_URL}/analyze", json={"text": text}, timeout=(5, 120))
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            last_error = e
            if attempt < attempts:
                time.sleep(min(2 * attempt, 10))

    raise HTTPException(
        status_code=503,
        detail=f"AI module unavailable after {attempts} attempts: {last_error}",
    )


def get_or_create_work_state(db, student_id: int) -> WorkThreadState:
    state = db.query(WorkThreadState).filter(WorkThreadState.student_id == student_id).first()
    if state:
        return state

    state = WorkThreadState(student_id=student_id, status="Не проверено")
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


def serialize_work_message(message: WorkMessage) -> dict:
    return {
        "id": message.id,
        "student_id": message.student_id,
        "sender_role": message.sender_role,
        "sender_name": message.sender_name,
        "recipient_name": message.recipient_name,
        "text": message.text,
        "message_type": message.message_type,
        "file_name": message.file_name,
        "has_file": bool(message.file_content),
        "file_content_type": message.file_content_type,
        "download_url": f"/work_thread/{message.student_id}/attachments/{message.id}" if message.file_content else None,
        "created_at": message.created_at.isoformat(),
    }


def serialize_work_thread(db, student_id: int) -> dict:
    state = get_or_create_work_state(db, student_id)
    messages = (
        db.query(WorkMessage)
        .filter(WorkMessage.student_id == student_id)
        .order_by(WorkMessage.created_at.asc(), WorkMessage.id.asc())
        .all()
    )

    return {
        "student": STUDENT_PROFILE,
        "teacher": TEACHER_PROFILE,
        "status": state.status,
        "submitted_at": state.submitted_at.isoformat() if state.submitted_at else None,
        "checked_at": state.checked_at.isoformat() if state.checked_at else None,
        "messages": [serialize_work_message(message) for message in messages],
    }

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


@app.get("/teacher_students")
def list_teacher_students():
    db = SessionLocal()
    state = get_or_create_work_state(db, STUDENT_PROFILE["id"])
    db.close()

    return [
        {
            "id": STUDENT_PROFILE["id"],
            "fio": STUDENT_PROFILE["fio"],
            "group": STUDENT_PROFILE["group"],
            "topic": STUDENT_PROFILE["topic"],
            "status": state.status,
        }
    ]


@app.get("/work_thread/{student_id}")
def get_work_thread(student_id: int):
    db = SessionLocal()
    try:
        return serialize_work_thread(db, student_id)
    finally:
        db.close()


@app.post("/work_thread/{student_id}/messages")
async def create_work_message(
    student_id: int,
    sender_role: str = Form(...),
    sender_name: str = Form(...),
    recipient_name: str = Form(default=""),
    text: str = Form(default=""),
    message_type: str = Form(default="message"),
    file: UploadFile | None = File(default=None),
):
    sender_role = sender_role.strip().lower()
    if sender_role not in {"student", "teacher"}:
        raise HTTPException(status_code=400, detail="sender_role must be student or teacher")

    text = text.strip()
    file_content = None
    file_name = None
    file_content_type = None

    if file and file.filename:
        file_content = await file.read()
        file_name = file.filename
        file_content_type = file.content_type

    if not text and not file_content:
        raise HTTPException(status_code=400, detail="Message text or file is required")

    db = SessionLocal()
    try:
        get_or_create_work_state(db, student_id)
        message = WorkMessage(
            student_id=student_id,
            sender_role=sender_role,
            sender_name=sender_name.strip(),
            recipient_name=recipient_name.strip() or None,
            text=text or None,
            message_type=message_type.strip() or "message",
            file_name=file_name,
            file_content=file_content,
            file_content_type=file_content_type,
        )
        db.add(message)
        db.commit()
        db.refresh(message)
        return serialize_work_message(message)
    finally:
        db.close()


@app.get("/work_thread/{student_id}/attachments/{message_id}")
def download_work_attachment(student_id: int, message_id: int):
    db = SessionLocal()
    message = (
        db.query(WorkMessage)
        .filter(WorkMessage.student_id == student_id, WorkMessage.id == message_id)
        .first()
    )
    db.close()

    if not message or not message.file_content:
        raise HTTPException(status_code=404, detail="Attachment not found")

    safe_name = (message.file_name or f"attachment_{message_id}").replace("/", "_").replace("\\", "_")
    return StreamingResponse(
        BytesIO(message.file_content),
        media_type=message.file_content_type or "application/octet-stream",
        headers={"Content-Disposition": attachment_content_disposition(safe_name)},
    )


@app.post("/work_thread/{student_id}/submit")
async def submit_work(
    student_id: int,
    sender_name: str = Form(default=STUDENT_PROFILE["short_name"]),
    text: str = Form(default="Работа отправлена на проверку."),
    file: UploadFile | None = File(default=None),
):
    db = SessionLocal()
    try:
        state = get_or_create_work_state(db, student_id)
        state.status = "На проверке"
        state.submitted_at = datetime.datetime.utcnow()
        state.checked_at = None

        file_content = None
        file_name = None
        file_content_type = None
        if file and file.filename:
            file_content = await file.read()
            file_name = file.filename
            file_content_type = file.content_type

        message = WorkMessage(
            student_id=student_id,
            sender_role="student",
            sender_name=sender_name.strip() or STUDENT_PROFILE["short_name"],
            recipient_name=TEACHER_PROFILE["full_name"],
            text=text.strip() or "Работа отправлена на проверку.",
            message_type="submission",
            file_name=file_name,
            file_content=file_content,
            file_content_type=file_content_type,
        )
        db.add(message)
        db.commit()
        return serialize_work_thread(db, student_id)
    finally:
        db.close()


@app.post("/work_thread/{student_id}/mark_checked")
def mark_work_checked(student_id: int):
    db = SessionLocal()
    try:
        state = get_or_create_work_state(db, student_id)
        state.status = "Проверено"
        state.checked_at = datetime.datetime.utcnow()

        message = WorkMessage(
            student_id=student_id,
            sender_role="teacher",
            sender_name=TEACHER_PROFILE["short_name"],
            recipient_name=STUDENT_PROFILE["fio"],
            text='Работа отмечена как "Проверено".',
            message_type="status",
        )
        db.add(message)
        db.commit()
        return serialize_work_thread(db, student_id)
    finally:
        db.close()


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
            "size": len(d.content),
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
        raise HTTPException(status_code=404, detail="Document not found")

    return {
        "id": doc.id,
        "filename": doc.filename,
        "uploaded_at": doc.uploaded_at.isoformat(),
        "size": len(doc.content),
    }


@app.post("/analyze_document/{doc_id}")
def analyze_document(doc_id: int):
    """Извлечь текст из файла, отправить в AI-модуль, сгенерировать LLM-отчёт и сохранить его в БД"""
    db = SessionLocal()
    doc = db.query(Document).filter(Document.id == doc_id).first()
    db.close()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    filename = doc.filename.lower()

    # ============================================================
    # ИЗВЛЕЧЕНИЕ ТЕКСТА
    # ============================================================

    if filename.endswith(".txt"):
        text = doc.content.decode("utf-8", errors="ignore")

    elif filename.endswith(".docx"):
        f = DocxDocument(io.BytesIO(doc.content))
        text = "\n".join(p.text for p in f.paragraphs)

    elif filename.endswith(".pdf"):
        import PyPDF2
        pdf = PyPDF2.PdfReader(io.BytesIO(doc.content))
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    elif filename.endswith(".rtf"):
        text = extract_rtf_text(doc.content)

    elif filename.endswith(".doc"):
        text = extract_legacy_doc_text(doc.content)

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format: {filename}. Use .docx, .doc, .pdf, .rtf or .txt.",
        )

    if not text.strip():
        raise HTTPException(status_code=400, detail="Не удалось извлечь текст из файла.")

    # ============================================================
    # ОТПРАВКА В AI-МОДУЛЬ
    # ============================================================

    analysis = run_ai_analysis(text)

    # Оставляем только нужные метрики (не возвращаем/не сохраняем полный JSON)
    brief = {
        "total_words": analysis.get("total_words"),
        "unique_words": analysis.get("unique_words"),
        "uniqueness": analysis.get("uniqueness"),
        "embedding_dim": analysis.get("embedding_dim"),
    }

    # ============================================================
    # GigaChat — отдельно, чтобы не ломать основной анализ
    # ============================================================

    try:
        llm_report = generate_report(
            text,
            local_signals={"local_analysis_summary": brief}
        )
    except Exception as e:
        llm_report = f"[GigaChat error] {e}"

    # ============================================================
    # СОХРАНЯЕМ В БД (ТОЛЬКО brief + llm_report)
    # ============================================================

    db = SessionLocal()
    db.add(AnalysisResult(
        doc_id=doc_id,
        analysis_json=brief,
        llm_report=llm_report
    ))
    db.commit()
    db.close()

    return {
        "filename": filename,
        "analysis": brief,
        "llm_report": llm_report
    }


@app.get("/report_word/{doc_id}")
def report_word(doc_id: int):
    """Скачать последний LLM-отчёт в Word + 4 метрики"""
    db = SessionLocal()

    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        db.close()
        raise HTTPException(status_code=404, detail="Document not found")

    result = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.doc_id == doc_id)
        .order_by(AnalysisResult.created_at.desc())
        .first()
    )
    db.close()

    if not result:
        raise HTTPException(status_code=404, detail="No analysis found for this document yet. Run analyze first.")

    d = DocxDocument()
    d.add_heading("Отчёт анализа ВКР", level=1)
    d.add_paragraph(f"Файл: {doc.filename}")
    d.add_paragraph(f"Дата: {result.created_at}")

    d.add_heading("Метрики текста", level=2)
    a = result.analysis_json or {}
    d.add_paragraph(f"total_words: {a.get('total_words')}")
    d.add_paragraph(f"unique_words: {a.get('unique_words')}")
    d.add_paragraph(f"uniqueness: {a.get('uniqueness')}")
    d.add_paragraph(f"embedding_dim: {a.get('embedding_dim')}")

    d.add_heading("Отчёт LLM", level=2)
    d.add_paragraph(result.llm_report or "—")

    buf = BytesIO()
    d.save(buf)
    buf.seek(0)

    safe_name = doc.filename.replace("/", "_").replace("\\", "_")
    out_name = f"report_{doc_id}_{safe_name}.docx"

    return StreamingResponse(
        buf,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": attachment_content_disposition(out_name)}
    )
@app.get("/analysis_reports/{doc_id}")
def get_reports(doc_id: int):
    """Получить все сохранённые отчёты по документу"""

    db = SessionLocal()

    results = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.doc_id == doc_id)
        .order_by(AnalysisResult.created_at.desc())
        .all()
    )

    db.close()

    return [
        {
            "id": r.id,
            "created_at": r.created_at.isoformat(),
            "llm_report": r.llm_report,
            "analysis": {
                "total_words": r.analysis_json.get("total_words") if r.analysis_json else None,
                "unique_words": r.analysis_json.get("unique_words") if r.analysis_json else None,
                "uniqueness": r.analysis_json.get("uniqueness") if r.analysis_json else None,
                "embedding_dim": r.analysis_json.get("embedding_dim") if r.analysis_json else None
            }
        }
        for r in results
    ]
