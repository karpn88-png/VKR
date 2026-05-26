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
  formatAppDateTime,
  getAttachmentUrl,
  getWorkThread,
  sendWorkMessage,
  STUDENT_ID,
  submitStudentWork,
} from "../../api/workThread";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";
const SUPPORTED_WORK_EXTENSIONS = [".docx", ".doc", ".pdf", ".rtf", ".txt"];
const DEFAULT_CHECK_CRITERIA = [
  { id: "structure", title: "Соответствие типовой структуре ВКР" },
  { id: "introduction", title: "Качество введения" },
  { id: "theory", title: "Качество теоретической части" },
  { id: "practice", title: "Качество практической части" },
  { id: "goal_alignment", title: "Связь цели, задач, глав и заключения" },
  { id: "style", title: "Научный стиль и связность текста" },
  { id: "conclusions", title: "Полнота выводов и результатов" },
  { id: "defense_risks", title: "Риски для допуска к защите" },
];

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
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
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
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [attachedFile, setAttachedFile] = useState(null);
  const [activeChatRecipient, setActiveChatRecipient] = useState(null);
  const [chatStatus, setChatStatus] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  const [selectedCheckType, setSelectedCheckType] = useState("");
  const [checkStatuses, setCheckStatuses] = useState({
    ai: "waiting",
    supervisor: "waiting",
    norm: "waiting",
  });
  const [workFile, setWorkFile] = useState(null);
  const [workDocId, setWorkDocId] = useState(null);
  const [aiStatus, setAiStatus] = useState("Выберите файл работы для проверки.");
  const [aiStatusKind, setAiStatusKind] = useState("muted");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiReportReady, setAiReportReady] = useState(false);
  const [isUploadingWork, setIsUploadingWork] = useState(false);
  const [isCheckingWork, setIsCheckingWork] = useState(false);
  const [isDraggingWork, setIsDraggingWork] = useState(false);
  const [checkCriteria, setCheckCriteria] = useState(DEFAULT_CHECK_CRITERIA);
  const [selectedPromptChecks, setSelectedPromptChecks] = useState(
    DEFAULT_CHECK_CRITERIA.map((item) => item.id)
  );

  const [finalSubmitted, setFinalSubmitted] = useState(false);

  const recipients = [
    {
      id: 1,
      name: "Бакаев Максим Александрович",
      role: "Руководитель ВКР",
      threadRole: "teacher",
      checkType: "supervisor",
    },
    {
      id: 2,
      name: "Герасимов Антон Константинович",
      role: "Сотрудник нормоконтроля",
      threadRole: "normcontrol",
      checkType: "norm",
    },
  ];

  const checkTypes = [
    {
      id: "ai",
      label: "Проверка ИИ-модулем",
    },
    {
      id: "supervisor",
      label: "Проверка руководителем",
    },
    {
      id: "norm",
      label: "Проверка нормоконтролем",
    },
  ];

  const checkStatusMap = {
    waiting: {
      label: "Ожидается",
      className: "waiting",
    },
    notChecked: {
      label: "Не проверено",
      className: "not-checked",
    },
    inProgress: {
      label: "На проверке",
      className: "in-progress",
    },
    checked: {
      label: "Проверено",
      className: "checked",
    },
    revision: {
      label: "Требуется доработка",
      className: "revision",
    },
  };

  const currentStatus = selectedCheckType
    ? checkStatusMap[checkStatuses[selectedCheckType]]
    : checkStatusMap.waiting;
  const aiBusy = isUploadingWork || isCheckingWork;
  const canDownloadReport = Boolean(workDocId && aiReportReady && !aiBusy);
  const selectedPromptCheckCount = selectedPromptChecks.length;

  const getWorkStages = () => {
    const stages = [
      {
        id: "topic",
        label: "Выбрать тему ВКР",
        done: true,
      },
      {
        id: "supervisor-choice",
        label: "Выбрать научного руководителя",
        done: true,
      },
      {
        id: "ai-check",
        label: "Проверить работу ИИ-модулем",
        done: checkStatuses.ai === "checked",
      },
      {
        id: "supervisor-check",
        label: "Отправить работу на проверку научному руководителю",
        done: checkStatuses.supervisor === "checked",
      },
      {
        id: "norm-check",
        label: "Отправить работу на проверку сотруднику нормоконтроля",
        done: checkStatuses.norm === "checked",
      },
      {
        id: "final-submit",
        label: "Сдать работу",
        done: finalSubmitted,
      },
    ];

    const firstNotDoneIndex = stages.findIndex((stage) => !stage.done);

    return stages.map((stage, index) => {
      if (stage.done) {
        return {
          ...stage,
          status: "done",
        };
      }

      if (index === firstNotDoneIndex) {
        return {
          ...stage,
          status: "current",
        };
      }

      return {
        ...stage,
        status: "locked",
      };
    });
  };

  const workStages = getWorkStages();

  const supervisor = recipients.find((user) => user.role === "Руководитель ВКР");
  const normControl = recipients.find(
    (user) => user.role === "Сотрудник нормоконтроля"
  );

  const visibleMessages = messages;

  const markRecipientCheckInProgress = (recipient) => {
    if (!recipient?.checkType) return;

    setSelectedCheckType(recipient.checkType);
    setCheckStatuses((prev) => ({
      ...prev,
      [recipient.checkType]: "inProgress",
    }));
  };

  const syncRecipientCheckStatus = useCallback((recipient, backendStatus) => {
    if (!recipient?.checkType) return;

    const statusMap = {
      "Не проверено": "notChecked",
      "На проверке": "inProgress",
      "Требуется доработка": "revision",
      "Проверено": "checked",
    };

    setCheckStatuses((prev) => ({
      ...prev,
      [recipient.checkType]: statusMap[backendStatus] ?? prev[recipient.checkType],
    }));
  }, []);

  const loadChatThread = useCallback(async (recipient = activeChatRecipient) => {
    if (!recipient) return;

    try {
      const thread = await getWorkThread(STUDENT_ID, recipient.threadRole);
      setMessages(thread.messages ?? []);
      syncRecipientCheckStatus(recipient, thread.status);
      setChatStatus("");
    } catch (error) {
      setChatStatus(`Не удалось загрузить переписку: ${error.message}`);
    }
  }, [activeChatRecipient, syncRecipientCheckStatus]);

  useEffect(() => {
    if (!chatModalOpen || !activeChatRecipient) return undefined;

    const initial = window.setTimeout(() => {
      void loadChatThread(activeChatRecipient);
    }, 0);
    const timer = window.setInterval(() => {
      void loadChatThread(activeChatRecipient);
    }, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [activeChatRecipient, chatModalOpen, loadChatThread]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/analysis_criteria`)
      .then(readApiResponse)
      .then((items) => {
        if (cancelled || !Array.isArray(items) || items.length === 0) return;

        const normalizedItems = items
          .filter((item) => item?.id && item?.title)
          .map((item) => ({
            id: item.id,
            title: item.title,
          }));

        if (normalizedItems.length === 0) return;

        setCheckCriteria(normalizedItems);
        setSelectedPromptChecks((prev) => {
          const allowedIds = new Set(normalizedItems.map((item) => item.id));
          const keptIds = prev.filter((id) => allowedIds.has(id));
          return keptIds.length > 0 ? keptIds : normalizedItems.map((item) => item.id);
        });
      })
      .catch(() => {
        // Если backend еще старый, остаемся на локальном списке критериев.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAttachFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAttachedFile(file);
    e.target.value = "";
  };

  const updateAiCheckStatus = (status) => {
    setSelectedCheckType("ai");

    setCheckStatuses((prev) => ({
      ...prev,
      ai: status,
    }));
  };

  const uploadWorkFile = async (file) => {
    updateAiCheckStatus("notChecked");

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

  const togglePromptCheck = (id) => {
    setSelectedPromptChecks((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const startAiCheck = async () => {
    if (aiBusy) return;

    if (selectedPromptCheckCount === 0) {
      setAiStatus("Выберите хотя бы один пункт LLM-проверки.");
      setAiStatusKind("error");
      return;
    }

    let docId = workDocId;

    if (!docId) {
      docId = await uploadWorkFile(workFile);
    }

    if (!docId) return;

    updateAiCheckStatus("inProgress");
    setIsCheckingWork(true);
    setAiReportReady(false);
    setAiStatus("Проверяем работу ИИ-модулем и формируем LLM-отчёт...");
    setAiStatusKind("info");

    try {
      const response = await fetch(`${API_BASE}/analyze_document/${docId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selected_checks: selectedPromptChecks,
        }),
      });
      const data = await readApiResponse(response);

      setAiAnalysis(data.analysis ?? null);
      setAiReportReady(true);
      setAiStatus("Проверка завершена. Отчёт готов к скачиванию.");
      setAiStatusKind("success");
      updateAiCheckStatus("checked");
    } catch (error) {
      setAiAnalysis(null);
      setAiReportReady(false);
      setAiStatus(`Проверка не выполнена: ${error.message}`);
      setAiStatusKind("error");
      updateAiCheckStatus("notChecked");
    } finally {
      setIsCheckingWork(false);
    }
  };

  const handleDownloadCheckedFile = () => {
    if (!canDownloadReport) {
      setAiStatus("Сначала загрузите файл и завершите проверку.");
      setAiStatusKind("error");
      return;
    }

    window.location.href = `${API_BASE}/report_word/${workDocId}`;
  };

  const openChatWithRecipient = (recipient) => {
    setActiveChatRecipient(recipient);
    setSelectedCheckType(recipient.checkType);
    setMessages([]);
    setMessage("");
    setAttachedFile(null);
    setChatStatus("Загружаем переписку...");
    setChatModalOpen(true);
  };

  const closeChatModal = () => {
    setChatModalOpen(false);
    setMessage("");
    setAttachedFile(null);
    setChatStatus("");
  };

  const sendMessage = async () => {
    if (isSendingMessage) return;

    const trimmedMessage = message.trim();

    if (!activeChatRecipient) {
      setChatStatus("Не выбран получатель.");
      return;
    }

    if (!trimmedMessage && !attachedFile) {
      setChatStatus("Введите сообщение или прикрепите файл.");
      return;
    }

    setIsSendingMessage(true);
    setChatStatus("Отправляем сообщение...");

    try {
      await sendWorkMessage(STUDENT_ID, {
        senderRole: "student",
        senderName: "Иванов И. И.",
        recipientName: activeChatRecipient.name,
        recipientRole: activeChatRecipient.threadRole,
        text: trimmedMessage,
        file: attachedFile,
        messageType: attachedFile ? "submission" : "message",
      });

      if (attachedFile) {
        markRecipientCheckInProgress(activeChatRecipient);
      }

      setMessage("");
      setAttachedFile(null);
      await loadChatThread(activeChatRecipient);
      setChatStatus("Сообщение отправлено.");
    } catch (error) {
      setChatStatus(`Не удалось отправить сообщение: ${error.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const confirmSubmitWork = async () => {
    if (isSubmittingWork) return;

    setIsSubmittingWork(true);

    try {
      await submitStudentWork(STUDENT_ID, {
        senderName: "Иванов И. И.",
        recipientRole: "teacher",
        text: "Итоговая работа сдана.",
        file: submissionFile,
      });
      setFinalSubmitted(true);
      setSubmissionFile(null);
      setSubmitModalOpen(false);
    } catch (error) {
      alert(`Не удалось сдать работу: ${error.message}`);
    } finally {
      setIsSubmittingWork(false);
    }
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

        <button
          className="bell"
          type="button"
          onClick={() => setNotificationsOpen(true)}
        >
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
              <button type="button">
                <Link to="/cabinet" className="nav-link">
                  Личный кабинет
                </Link>
              </button>

              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>

      {/* СЕРЕДИНА */}
      <main className="cabinet-main">
        <section className="work-panel">
          <div className="work-top-row">
            <div className="work-title-block">
              <h1>Моя работа</h1>
              <p>Информация о вашей выпускной квалификационной работе</p>
            </div>

            <div className="work-info">
              <div>
                <b>Тема ВКР:</b>
                <span>Разработка информационной системы</span>
              </div>

              <div>
                <b>Руководитель ВКР:</b>
                <span>Бакаев Максим Александрович</span>
              </div>
            </div>
          </div>

          <div className="work-content-grid">
            <div className="work-left-column">
              {/* Кнопки действий */}
              <section className="work-actions-card">
                <button
                  type="button"
                  className="work-action-btn work-action-btn-wide"
                  onClick={() => openChatWithRecipient(supervisor)}
                >
                  Отправить работу на проверку научному руководителю
                </button>

                <div className="work-actions-row">
                  <button
                    type="button"
                    className="work-action-btn work-action-btn-norm"
                    onClick={() => openChatWithRecipient(normControl)}
                  >
                    Отправить работу на проверку сотруднику нормоконтроля
                  </button>

                  <button
                    type="button"
                    className="work-action-btn work-action-btn-submit"
                    onClick={() => setSubmitModalOpen(true)}
                  >
                    Сдать работу
                  </button>
                </div>
              </section>

              {/* Этапы работы */}
              <section className="work-stages-card">
                <h2>Этапы работы над ВКР</h2>

                <div className="work-stages-list">
                  {workStages.map((stage, index) => (
                    <div className="work-stage-row" key={stage.id}>
                      <button
                        type="button"
                        className={`work-stage-item ${stage.status}`}
                      >
                        {stage.label}
                      </button>

                      {index !== workStages.length - 1 && (
                        <div className="work-stage-arrow">↓</div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Проверка ИИ-модулем */}
            <div className="right-work-column">
  {/* Проверка ИИ-модулем */}
  <section className="ai-check-card">
    <h2>Проверка ИИ-модулем</h2>

    <p>
      Проверьте содержание, а также структуру
      <br />
      и качество текста вашей ВКР.
    </p>

    <h3>Загрузите файл работы</h3>

    <div className="ai-criteria-panel">
      <div className="ai-criteria-header">
        <b>Пункты LLM-проверки</b>
        <span>
          Выбрано {selectedPromptCheckCount} из {checkCriteria.length}
        </span>
      </div>

      <div className="ai-criteria-actions">
        <button
          type="button"
          disabled={aiBusy}
          onClick={() => setSelectedPromptChecks(checkCriteria.map((item) => item.id))}
        >
          Выбрать все
        </button>

        <button
          type="button"
          disabled={aiBusy}
          onClick={() => setSelectedPromptChecks([])}
        >
          Снять выбор
        </button>
      </div>

      <div className="ai-criteria-list">
        {checkCriteria.map((item) => (
          <label className="ai-criteria-item" key={item.id}>
            <input
              type="checkbox"
              checked={selectedPromptChecks.includes(item.id)}
              disabled={aiBusy}
              onChange={() => togglePromptCheck(item.id)}
            />
            <span>{item.title}</span>
          </label>
        ))}
      </div>
    </div>

    <label
      className={`ai-upload-box ${isDraggingWork ? "dragging" : ""} ${
        aiBusy ? "disabled" : ""
      }`}
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
        hidden
        accept=".docx,.doc,.pdf,.rtf,.txt"
        disabled={aiBusy}
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
        type="button"
        className="download-checked-btn"
        disabled={!canDownloadReport}
        onClick={handleDownloadCheckedFile}
      >
        Скачать проверенный файл
      </button>

      <button
        type="button"
        className="start-check-btn"
        disabled={
          aiBusy ||
          !workFile ||
          !isSupportedWorkFile(workFile) ||
          selectedPromptCheckCount === 0
        }
        onClick={startAiCheck}
      >
        {isCheckingWork ? "Проверяем..." : "Запустить проверку"}
      </button>
    </div>
  </section>

  {/* Статус работы */}
  <div className="work-status-box">
    <span className="work-status-label">Статус работы</span>

    <select
      className="work-status-select"
      value={selectedCheckType}
      onChange={(e) => setSelectedCheckType(e.target.value)}
    >
      <option value="">Выберите тип проверки</option>

      {checkTypes.map((type) => (
        <option key={type.id} value={type.id}>
          {type.label}
        </option>
      ))}
    </select>

    <span className={`work-status-badge ${currentStatus.className}`}>
      {currentStatus.label}
    </span>
  </div>
</div>

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
      <button
        className="support-btn"
        type="button"
        onClick={() => setSupportOpen(true)}
      >
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
          <div
            className="modal support-modal"
            onClick={(e) => e.stopPropagation()}
          >
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

              <button className="green-btn" type="button">
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА СДАЧИ РАБОТЫ */}
      {submitModalOpen && (
        <div className="overlay" onClick={() => setSubmitModalOpen(false)}>
          <div className="submit-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Подтвердите сдачу работы</h2>

            <label className="submit-upload-box">
              <input
                type="file"
                hidden
                accept=".docx,.doc,.pdf,.rtf"
                onChange={(event) => {
                  setSubmissionFile(event.target.files?.[0] ?? null);
                  event.target.value = "";
                }}
              />

              <b>Перетащите или нажмите для выбора файла в эту область</b>

              <span>Поддерживаемые форматы: .docx, .doc, .pdf, .rtf</span>

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
                onClick={confirmSubmitWork}
              >
                {isSubmittingWork ? "Отправляем..." : "Подтвердить"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ЧАТА */}
      {chatModalOpen && activeChatRecipient && (
        <div className="overlay chat-modal-overlay" onClick={closeChatModal}>
          <div className="chat-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="chat-modal-header">
              <div>
                <h2>Чат с пользователем</h2>
                <p>
                  {activeChatRecipient.name} — {activeChatRecipient.role}
                </p>
              </div>

              <button
                type="button"
                className="chat-modal-close"
                onClick={closeChatModal}
              >
                ×
              </button>
            </div>

            <section className="chat-panel chat-panel-modal">
              <div className="chat-recipient-chip">
                Получатель: <b>{activeChatRecipient.name}</b>
              </div>

              <div className="chat-empty">
                {visibleMessages.length === 0 ? (
                  <span className="chat-empty-text">Сообщений пока нет</span>
                ) : (
                  visibleMessages.map((msg) => (
                    <div className="message" key={msg.id}>
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
                        <span>{msg.message_type === "submission" ? "работа" : "сообщение"}</span>
                        <span>{formatAppDateTime(msg.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="chat-input-panel modal-chat-input">
                <label className="attach-btn">
                  <img src={clip} alt="file" className="clip-icon" />

                  <input
                    type="file"
                    hidden
                    accept=".docx,.doc,.pdf,.rtf"
                    onChange={handleAttachFile}
                  />
                </label>

                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    attachedFile
                      ? `Прикреплен файл: ${attachedFile.name}`
                      : "Написать сообщение..."
                  }
                />

                <button
                  className="send-btn"
                  type="button"
                  disabled={isSendingMessage}
                  onClick={sendMessage}
                >
                  <img src={send} alt="send" />
                </button>
              </div>

              {(attachedFile || chatStatus) && (
                <div className="chat-status">
                  {attachedFile && <span>Прикреплен файл: {attachedFile.name}</span>}
                  {chatStatus && <span>{chatStatus}</span>}
                </div>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
