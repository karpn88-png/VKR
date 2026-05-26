import { useState } from "react";
import "./StudentWork.css";
import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import send from "../../assets/send.png";

import { Link } from "react-router-dom";

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

  const [selectedCheckType, setSelectedCheckType] = useState("");
  const [checkStatuses, setCheckStatuses] = useState({
    ai: "waiting",
    supervisor: "waiting",
    norm: "waiting",
  });

  const [finalSubmitted, setFinalSubmitted] = useState(false);

  const recipients = [
    {
      id: 1,
      name: "Бакаев Максим Александрович",
      role: "Руководитель ВКР",
    },
    {
      id: 2,
      name: "Герасимов Антон Константинович",
      role: "Сотрудник нормоконтроля",
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

  const visibleMessages = activeChatRecipient
    ? messages.filter((msg) => msg.recipientId === activeChatRecipient.id)
    : messages;

  const handleAttachFile = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setAttachedFile(file);
  };

  const handleAiFileClick = () => {
    setSelectedCheckType("ai");

    setCheckStatuses((prev) => ({
      ...prev,
      ai: "notChecked",
    }));
  };

  const handleDownloadCheckedFile = () => {
    setSelectedCheckType("ai");

    setCheckStatuses((prev) => ({
      ...prev,
      ai: "checked",
    }));

    const link = document.createElement("a");
    link.href = "/files/checked-work.docx";
    link.download = "Проверенный_файл.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startAiCheck = () => {
    setSelectedCheckType("ai");

    setCheckStatuses((prev) => ({
      ...prev,
      ai: "inProgress",
    }));
  };

  const openChatWithRecipient = (recipient) => {
    setActiveChatRecipient(recipient);
    setMessage("");
    setAttachedFile(null);
    setChatModalOpen(true);
  };

  const closeChatModal = () => {
    setChatModalOpen(false);
    setMessage("");
    setAttachedFile(null);
  };

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!activeChatRecipient) {
      alert("Не выбран получатель");
      return;
    }

    if (!trimmedMessage && !attachedFile) {
      alert("Введите сообщение или прикрепите файл");
      return;
    }

    const isSupervisor = activeChatRecipient.role === "Руководитель ВКР";
    const isNormControl =
      activeChatRecipient.role === "Сотрудник нормоконтроля";

    if (attachedFile && isSupervisor) {
      setSelectedCheckType("supervisor");

      setCheckStatuses((prev) => ({
        ...prev,
        supervisor: "inProgress",
      }));
    }

    if (attachedFile && isNormControl) {
      setSelectedCheckType("norm");

      setCheckStatuses((prev) => ({
        ...prev,
        norm: "inProgress",
      }));
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmedMessage,
        fileName: attachedFile ? attachedFile.name : null,
        recipientId: activeChatRecipient.id,
        recipient: activeChatRecipient.name,
        recipientRole: activeChatRecipient.role,
        status: "не прочитано",
        date: new Date().toLocaleDateString("ru-RU"),
        time: new Date().toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
    setAttachedFile(null);
  };

  const confirmSubmitWork = () => {
    setFinalSubmitted(true);

    alert("Работа успешно отправлена");
    setSubmitModalOpen(false);
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

    <label className="ai-upload-box" onClick={handleAiFileClick}>
      <input type="file" hidden accept=".docx,.doc,.pdf,.rtf" />

      <b>Перетащите или нажмите для выбора файла в эту область</b>

      <span>Поддерживаемые форматы: .docx, .doc, .pdf, .rtf</span>

      <img src={clip} alt="file" className="clip-icon" />
    </label>

    <div className="ai-actions">
      <button
        type="button"
        className="download-checked-btn"
        onClick={handleDownloadCheckedFile}
      >
        Скачать проверенный файл
      </button>

      <button
        type="button"
        className="start-check-btn"
        onClick={startAiCheck}
      >
        Запустить проверку
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
              <input type="file" hidden accept=".docx,.doc,.pdf,.rtf" />

              <b>Перетащите или нажмите для выбора файла в эту область</b>

              <span>Поддерживаемые форматы: .docx, .doc, .pdf, .rtf</span>

              <img src={clip} alt="file" className="clip-icon" />
            </label>

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
                onClick={confirmSubmitWork}
              >
                Подтвердить
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
                      {msg.text && <p>{msg.text}</p>}

                      {msg.fileName && (
                        <div className="message-file">📎 {msg.fileName}</div>
                      )}

                      <div className="message-info">
                        <span>{msg.status}</span>
                        <span>
                          {msg.date} · {msg.time}
                        </span>
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

                <button className="send-btn" type="button" onClick={sendMessage}>
                  <img src={send} alt="send" />
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
