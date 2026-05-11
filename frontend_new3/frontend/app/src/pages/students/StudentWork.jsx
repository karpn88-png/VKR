import { useCallback, useEffect, useState } from "react";
import "./StudentWork.css";
import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import send from "../../assets/send.png";


import { Link } from "react-router-dom";
import {
  getAttachmentUrl,
  getWorkThread,
  sendWorkMessage,
  STUDENT_ID,
  submitStudentWork,
} from "../../api/workThread";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const SUPPORTED_WORK_EXTENSIONS = [".docx", ".doc", ".pdf", ".rtf", ".txt"];

async function readApiResponse(response) {
  const text = await response.text();
  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.error ||
      (typeof data === "string" && data) ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  if (data?.error) {
    throw new Error(data.details ? `${data.error}: ${data.details}` : data.error);
  }

  return data;
}

function isSupportedWorkFile(file) {
  const name = file?.name?.toLowerCase() ?? "";
  return SUPPORTED_WORK_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export default function StudentWork() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageFile, setMessageFile] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [workStatus, setWorkStatus] = useState("Не проверено");
  const [chatStatus, setChatStatus] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [recipientOpen, setRecipientOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [workFile, setWorkFile] = useState(null);
  const [workDocId, setWorkDocId] = useState(null);
  const [aiStatus, setAiStatus] = useState("Выберите файл работы для проверки.");
  const [aiStatusKind, setAiStatusKind] = useState("muted");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiReportReady, setAiReportReady] = useState(false);
  const [isUploadingWork, setIsUploadingWork] = useState(false);
  const [isCheckingWork, setIsCheckingWork] = useState(false);
  const [isDraggingWork, setIsDraggingWork] = useState(false);

  const recipients = [
    { id: 1, name: "Бакаев Максим Александрович", role: "Руководитель ВКР" },
  ];

  const aiBusy = isUploadingWork || isCheckingWork;
  const canDownloadReport = Boolean(workDocId && aiReportReady && !aiBusy);

  const syncWorkThread = useCallback((thread) => {
    setMessages(thread.messages ?? []);
    setWorkStatus(thread.status ?? "Не проверено");
  }, []);

  const loadWorkThread = useCallback(async () => {
    try {
      syncWorkThread(await getWorkThread(STUDENT_ID));
    } catch (error) {
      setChatStatus(`Не удалось загрузить переписку: ${error.message}`);
    }
  }, [syncWorkThread]);

  useEffect(() => {
    const refresh = () => {
      void loadWorkThread();
    };
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadWorkThread]);

  const sendMessage = async () => {
    if (isSendingMessage) return;

    if (!selectedRecipient) {
      setChatStatus("Сначала выберите получателя.");
      return;
    }

    if (!message.trim() && !messageFile) {
      setChatStatus("Введите сообщение или прикрепите файл.");
      return;
    }

    setIsSendingMessage(true);
    setChatStatus("Отправляем сообщение...");

    try {
      await sendWorkMessage(STUDENT_ID, {
        senderRole: "student",
        senderName: "Иванов И. И.",
        recipientName: selectedRecipient.name,
        text: message,
        file: messageFile,
      });
      setMessage("");
      setMessageFile(null);
      setChatStatus("");
      await loadWorkThread();
    } catch (error) {
      setChatStatus(`Не удалось отправить сообщение: ${error.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

const submitWork = async () => {
  if (isSubmittingWork) return;

  setIsSubmittingWork(true);
  setChatStatus("Отправляем работу преподавателю...");

  try {
    const thread = await submitStudentWork(STUDENT_ID, {
      senderName: "Иванов И. И.",
      text: "Работа отправлена на проверку.",
      file: submissionFile,
    });
    syncWorkThread(thread);
    setSubmissionFile(null);
    setSubmitModalOpen(false);
    setChatStatus("Работа отправлена на проверку.");
  } catch (error) {
    setChatStatus(`Не удалось сдать работу: ${error.message}`);
  } finally {
    setIsSubmittingWork(false);
  }
};

const uploadWorkFile = async (file) => {
  if (!file) {
    setAiStatus("Выберите файл работы.");
    setAiStatusKind("error");
    return null;
  }

  if (!isSupportedWorkFile(file)) {
    setAiStatus("Поддерживаются файлы .docx, .doc, .pdf, .rtf и .txt.");
    setAiStatusKind("error");
    return null;
  }

  setIsUploadingWork(true);
  setAiReportReady(false);
  setAiAnalysis(null);
  setAiStatus("Загружаем файл работы...");
  setAiStatusKind("info");

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await readApiResponse(response);

    setWorkDocId(data.id);
    setAiStatus(`Файл "${data.filename}" загружен. Можно запускать проверку.`);
    setAiStatusKind("success");
    return data.id;
  } catch (error) {
    setWorkDocId(null);
    setAiStatus(`Не удалось загрузить файл: ${error.message}`);
    setAiStatusKind("error");
    return null;
  } finally {
    setIsUploadingWork(false);
  }
};

const handleWorkFile = async (file) => {
  if (!file) return;
  setWorkFile(file);
  await uploadWorkFile(file);
};

const startAiCheck = async () => {
  if (aiBusy) return;

  let docId = workDocId;
  if (!docId) {
    docId = await uploadWorkFile(workFile);
  }

  if (!docId) return;

  setIsCheckingWork(true);
  setAiReportReady(false);
  setAiStatus("Проверяем работу AI-модулем и формируем LLM-отчёт...");
  setAiStatusKind("info");

  try {
    const response = await fetch(`${API_BASE}/analyze_document/${docId}`, {
      method: "POST",
    });
    const data = await readApiResponse(response);

    setAiAnalysis(data.analysis ?? null);
    setAiReportReady(true);
    setAiStatus("Проверка завершена. Отчёт готов к скачиванию.");
    setAiStatusKind("success");
  } catch (error) {
    setAiAnalysis(null);
    setAiReportReady(false);
    setAiStatus(`Проверка не выполнена: ${error.message}`);
    setAiStatusKind("error");
  } finally {
    setIsCheckingWork(false);
  }
};

const downloadAiReport = () => {
  if (!canDownloadReport) {
    setAiStatus("Сначала загрузите файл и завершите проверку.");
    setAiStatusKind("error");
    return;
  }

  window.location.href = `${API_BASE}/report_word/${workDocId}`;
};

  return (
    <div className="page">
      {/* ШАПКА */}
      <header className="header">
        <div className="logo">
          <div className="logo-box">
            <img src={logo} alt="logo" />
          </div>
          <div>
            <b>Навигатор ВКР</b>
            <span>Моя работа</span>
          </div>
        </div>

            <button className="bell" onClick={() => setNotificationsOpen(true)}>
          <img src={bell} alt="bell" />
          <span>0</span>
        </button>

        <div className="profile-wrapper">
          <button
            className="profile"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              <img src={avatar} alt="avatar" />
            </div>

            <div className="profile-text">
              <div className="name">Иванов И. И.</div>
              <div className="role">Студент</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button> <Link to="/cabinet" className="nav-link">
    Личный кабинет
  </Link></button>
              <button>Выйти</button>
            </div>
          )}
        </div>
      </header>

      {/* СЕРЕДИНА */}
      <main className="cabinet-main">
      <section className="work-panel">
    <div className="work-title-block">
      <h1>Моя работа</h1>
      <p>Информация о вашей выпускной квалификационной работе</p>
    </div>

    <div className="work-info">
      <div>
        <b>Тема ВКР:</b>
        <span>Тема ВКР еще не выбрана</span>
      </div>

      <div>
        <b>Руководитель ВКР:</b>
        <span>Бакаев Максим Александрович</span>
      </div>

      <div>
        <b>Статус работы:</b>
        <span>{workStatus}</span>
      </div>
    </div>
      </section>

      <section className="chat-panel">
  <div className={`chat-empty ${messages.length > 0 ? "has-messages" : ""}`}>
    {messages.length === 0 ? (
      "Выполнение работы еще не начато"
    ) : (
      messages.map((msg) => (
        <div
          className={`message ${msg.sender_role === "teacher" ? "incoming" : "outgoing"}`}
          key={msg.id}
        >
          <div className="message-author">{msg.sender_name}</div>
          {msg.text && <p>{msg.text}</p>}
          {msg.has_file && (
            <a
              className="message-file"
              href={getAttachmentUrl(msg.download_url)}
              target="_blank"
              rel="noreferrer"
            >
              {msg.file_name}
            </a>
          )}

         <div className="message-info">
  <span>{msg.recipient_name ? `Кому: ${msg.recipient_name}` : "Без получателя"}</span>

  <span>{msg.message_type === "submission" ? "сдача работы" : "сообщение"}</span>

  <span>
    {new Date(msg.created_at).toLocaleString("ru-RU")}
  </span>
</div>

        </div>
      ))
    )}
  </div>

  <div className="chat-input-panel">
    <label className="attach-btn">
      <img src={clip} alt="file" className="clip-icon" />
      <input
        type="file"
        hidden
        onChange={(event) => {
          setMessageFile(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
    </label>

    <input
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      placeholder="Написать сообщение..."
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          sendMessage();
        }
      }}
    />

    <button
  className="send-btn"
  type="button"
  onClick={sendMessage}
  disabled={isSendingMessage}
>
  <img src={send} alt="send" />
</button>

   <button
  className="recipient-btn"
  type="button"
  onClick={() => setRecipientOpen(true)}
>
  Выбрать получателей
</button>

{selectedRecipient ? (
  <span className="recipient-status added">
    Получатель добавлен
  </span>
) : (
  <span className="recipient-status not-added">
    Получатель не добавлен
  </span>
)}


    <button
  className="submit-work-btn"
  type="button"
  onClick={() => setSubmitModalOpen(true)}
>
  Сдать работу
  </button>
  </div>
  {(messageFile || chatStatus) && (
    <div className="chat-status">
      {messageFile && <span>Прикреплен файл: {messageFile.name}</span>}
      {chatStatus && <span>{chatStatus}</span>}
    </div>
  )}

</section>


      {/* Проверка ИИ-модулем */}
      <section className="ai-check-card">
  <h2>Проверка ИИ-модулем</h2>

  <p>
    Проверьте содержание, а также структуру<br />
    и качество текста вашей ВКР.
  </p>

  <h3>Загрузите файл работы</h3>

  <label
    className={`ai-upload-box ${isDraggingWork ? "dragging" : ""} ${aiBusy ? "disabled" : ""}`}
    onDragOver={(event) => {
      event.preventDefault();
      if (!aiBusy) setIsDraggingWork(true);
    }}
    onDragLeave={() => setIsDraggingWork(false)}
    onDrop={(event) => {
      event.preventDefault();
      setIsDraggingWork(false);
      if (!aiBusy) {
        handleWorkFile(event.dataTransfer.files?.[0] ?? null);
      }
    }}
  >
    <input
      type="file"
      accept=".docx,.doc,.pdf,.rtf,.txt"
      disabled={aiBusy}
      hidden
      onChange={(event) => {
        handleWorkFile(event.target.files?.[0] ?? null);
        event.target.value = "";
      }}
    />

    <b>Перетащите или нажмите для выбора файла в эту область</b>
    <span>Поддерживаемые форматы: .docx, .doc, .pdf, .rtf, .txt</span>

    <img src={clip} alt="file" className="clip-icon" />
  </label>

  <div className="ai-file-name">
    {workFile ? workFile.name : "Файл не выбран"}
  </div>

  <div className={`ai-status ${aiStatusKind}`}>{aiStatus}</div>

  {aiAnalysis && (
    <div className="ai-metrics">
      <span>Слов: {aiAnalysis.total_words ?? "—"}</span>
      <span>Уникальность: {aiAnalysis.uniqueness ?? "—"}%</span>
    </div>
  )}

  <div className="ai-actions">
    <button
      className="download-checked-btn"
      type="button"
      disabled={!canDownloadReport}
      onClick={downloadAiReport}
    >
      Скачать проверенный файл
    </button>

    <button
      className="start-check-btn"
      type="button"
      disabled={aiBusy || !workFile || !isSupportedWorkFile(workFile)}
      onClick={startAiCheck}
    >
      {isCheckingWork ? "Проверяем..." : "Запустить проверку"}
    </button>
  </div>
      </section>


</main>

      {/* Меню */}    
      <section className="nav-panel">
  <Link to="/" className="nav-link">
    Главная
  </Link>
  <Link to="/cabinet" className="nav-link">
    Личный кабинет
  </Link>
  <Link to="/work" className="nav-link">
    Моя работа
  </Link>
  <Link to="/templates" className="nav-link">
    Шаблоны ГОСТ
  </Link>
  <Link to="/teachers" className="nav-link">
    Преподаватели
  </Link>
  <Link to="/topics" className="nav-link">
    Актуальные темы ВКР
  </Link>
  <Link to="/archive" className="nav-link">
    Архив ВКР
  </Link>
</section>

      {/* ФУТЕР */}
      <footer className="footer">
        <div>ⓘ Важная информация</div>
        <span>На данный момент информация отсутствует</span>
      </footer>

      {/* КНОПКА ПОДДЕРЖКИ */}
      <button className="support-btn" onClick={() => setSupportOpen(true)}>
              <img src={support} alt="поддержка" />
            </button>

      {/* МОДАЛКА С УВЕДОМЛЕНИЯМИ */}
      {notificationsOpen && (
        <div className="overlay" onClick={() => setNotificationsOpen(false)}>
          <div
            className="modal notifications-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close"
              type="button"
              onClick={() => setNotificationsOpen(false)}
            >
              ×
            </button>
            <h3>Уведомления</h3>
            <p>Нет новых уведомлений</p>
          </div>
        </div>
      )}

      {/* МОДАЛКА С ПОДДЕРЖКОЙ */}
      {supportOpen && (
        <div className="overlay" onClick={() => setSupportOpen(false)}>
          <div className="modal support-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Техническая поддержка</h3>

            <label>Форма обратной связи</label>
            <textarea placeholder="Опишите подробно, что произошло..." />

            <label>Прикрепить файл</label>
             <label className="file-box">
                       <input type="file" hidden />
           
                           <img src={clip} alt="file" className="clip-icon" />
           
                           <div>
                               <b>Нажмите или перетащите файл в форму</b>
                               <small>Форматы: PNG, JPG, PDF, DOCX. Максимум 10 МБ</small>
                           </div>
                       </label>

            <div className="support-actions">
              <button
                className="outline-btn"
                type="button"
                onClick={() => setSupportOpen(false)}
              >
                Закрыть
              </button>
              <button className="green-btn">Отправить</button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА СДАЧИ РАБОТЫ */}

      {submitModalOpen && (
  <div className="overlay" onClick={() => setSubmitModalOpen(false)}>

    <div
      className="submit-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <h2>Подтвердите сдачу работы</h2>

      <label className="submit-upload-box">

        <input
          type="file"
          hidden
          onChange={(event) => {
            setSubmissionFile(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />

        <b>
          Перетащите или нажмите для выбора файла в эту область
        </b>

        <span>
          Поддерживаемые форматы: .docx, .doc, .pdf, .rtf
        </span>

        <img src={clip} alt="file" className="clip-icon" />

      </label>

      {submissionFile && (
        <p className="submit-file-name">Файл к сдаче: {submissionFile.name}</p>
      )}

      <p className="submit-warning">
        После отправки работы выполнение ВКР считается завершенным.
        Редактирование файла становится невозможным.
      </p>

      <div className="submit-actions">

        <button
          className="cancel-submit-btn"
          type="button"
          onClick={() => setSubmitModalOpen(false)}
        >
          Отменить действие
        </button>

        <button
          className="confirm-submit-btn"
          type="button"
          disabled={isSubmittingWork}
          onClick={submitWork}
        >
          {isSubmittingWork ? "Отправляем..." : "Подтвердить"}
        </button>

      </div>
    </div>
  </div>
      )}

      {/* Выбрать получателя */}
      {recipientOpen && (
  <div className="overlay" onClick={() => setRecipientOpen(false)}>
    <div className="recipient-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Выберите пользователя, которому хотите написать</h3>

      <div className="recipient-list">
        {recipients.length === 0 ? (
          <button className="empty-recipient">
            Нет доступных пользователей
          </button>
        ) : (
          recipients.map((user) => (
            <button
              key={user.id}
              className={`recipient-item ${
                selectedRecipient?.id === user.id ? "active" : ""
              }`}
              onClick={() => setSelectedRecipient(user)}
              type="button"
            >
              {user.name} — {user.role}
            </button>
          ))
        )}
      </div>

      <div className="recipient-actions">
        <button type="button" onClick={() => setRecipientOpen(false)}>
          ОТМЕНА
        </button>

        <button
          type="button"
          className="add-recipient-btn"
          onClick={() => setRecipientOpen(false)}
        >
          Добавить получателя
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
