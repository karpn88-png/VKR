import { useMemo, useState } from "react";
import "./StudentWork.css";

const API_BASE = `${window.location.protocol}//${window.location.hostname}/api`;

export default function StudentWork() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [actionStatus, setActionStatus] = useState("");
  const [docId, setDocId] = useState("");
  const [docs, setDocs] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [llmReport, setLlmReport] = useState("—");

  const currentDoc = useMemo(
    () => docs.find((d) => String(d.id) === String(docId)),
    [docs, docId],
  );

  const loadDocuments = async () => {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    setDocs(Array.isArray(data) ? data : []);
  };

  const uploadFile = async () => {
    if (!file) return setUploadStatus("Выберите файл");
    setUploadStatus("Загрузка...");
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
    if (!res.ok) return setUploadStatus(`Ошибка загрузки (HTTP ${res.status})`);
    const data = await res.json();
    setUploadStatus(`Файл загружен. ID: ${data.id}`);
    setDocId(data.id);
    await loadDocuments();
  };

  const analyzeDocument = async () => {
    if (!docId) return setActionStatus("Укажите ID документа");
    setActionStatus("Анализируем...");
    setLlmReport("Генерируем отчёт...");
    const res = await fetch(`${API_BASE}/analyze_document/${docId}`, { method: "POST" });
    if (!res.ok) return setActionStatus(`Ошибка анализа (HTTP ${res.status})`);
    const data = await res.json();
    setAnalysis(data.analysis ?? null);
    setLlmReport(data.llm_report ?? "Отчёт отсутствует");
    setActionStatus("Готово");
  };

  const downloadReport = () => {
    if (!docId) return setActionStatus("Укажите ID документа");
    window.open(`${API_BASE}/report_word/${docId}`, "_blank");
  };

  return (
    <div className="work-page">
      <h1>Моя работа</h1>
      <section className="card">
        <h2>Загрузить документ</h2>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button onClick={uploadFile}>Загрузить</button>
        <p>{uploadStatus}</p>
      </section>

      <section className="card">
        <h2>Документы</h2>
        <button onClick={loadDocuments}>Обновить список</button>
        <ul>
          {docs.map((d) => (
            <li key={d.id}>
              <button onClick={() => setDocId(d.id)}>{d.id}: {d.filename}</button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Анализ</h2>
        <input value={docId} onChange={(e) => setDocId(e.target.value)} placeholder="ID документа" />
        <button onClick={analyzeDocument}>Анализировать</button>
        <button onClick={downloadReport}>Скачать Word-отчёт</button>
        <p>{actionStatus}</p>
        {currentDoc && <p>Текущий документ: <b>{currentDoc.filename}</b></p>}
        <pre>{JSON.stringify(analysis, null, 2) || "—"}</pre>
        <pre>{llmReport}</pre>
      </section>
    </div>
  );
}
