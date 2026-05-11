import { useState, useEffect } from "react";
import "./TeacherWork.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import send from "../../assets/send.png";

import { Link } from "react-router-dom";

export default function TeacherWork() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [studentWorkOpen, setStudentWorkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherMessages, setTeacherMessages] = useState([]);

  const [workStatus, setWorkStatus] = useState("Не проверено");
  const [successMessage, setSuccessMessage] = useState(false);

  const students = [
    {
      id: 1,
      fio: "Иванов Иван Иванович",
      group: "АТ-23",
      topic: "Разработка информационной системы",
      status: workStatus,
    },
  ];

  const sendTeacherMessage = () => {
    if (!teacherMessage.trim()) return;

    setTeacherMessages([
      ...teacherMessages,
      {
        id: Date.now(),
        text: teacherMessage,
        sender: "Бакаев М. А.",
        date: new Date().toLocaleDateString("ru-RU"),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setTeacherMessage("");
  };

  useEffect(() => {
    document.body.style.overflow = studentWorkOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [studentWorkOpen]);

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          <div className="logo-box">
            <img src={logo} alt="logo" />
          </div>

          <div>
            <b>Навигатор ВКР</b>
            <span>Мои студенты</span>
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
              <div className="name">Бакаев М. А.</div>
              <div className="role">Преподаватель</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/teacher-cabinet" className="nav-link">
                Личный кабинет
              </Link>

              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>

      <main className="teacher-work-panel">
        <div className="teacher-work-header">
          <div>
            <h1>Мои студенты</h1>
            <p>Список студентов, выполняющих ВКР под моим руководством</p>
          </div>

          <div className="teacher-filters">
            <select>
              <option>Выбрать группу студента</option>
              <option>АТ-23</option>
              <option>АТ-24</option>
              <option>АО-22</option>
            </select>

            <div className="filters-row">
              <select>
                <option>Выбрать статус работы</option>
                <option>Не проверено</option>
                <option>На проверке</option>
                <option>Проверено</option>
              </select>

              <div className="search-student">
                <input placeholder="Поиск студента..." />
                <span>⌕</span>
              </div>
            </div>
          </div>
        </div>

        <section className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>N</th>
                <th>ФИО</th>
                <th>Группа</th>
                <th>Тема ВКР</th>
                <th>Статус работы</th>
                <th>Перейти к работе</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.fio}</td>
                  <td>{student.group}</td>
                  <td>{student.topic}</td>

                  <td>
                    <span
                      className={
                        student.status === "Проверено"
                          ? "status checked"
                          : "status not-checked"
                      }
                    >
                      {student.status}
                    </span>
                  </td>

                  <td>
                    <button
                      className="go-work-link"
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setStudentWorkOpen(true);
                      }}
                    >
                      Перейти
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {studentWorkOpen && selectedStudent && (
        <div className="student-work-overlay">
          <div className="student-work-modal">
            <div className="student-work-top">
              <div>
                <p>
                  <b>Студент:</b> {selectedStudent.fio}
                </p>
                <p>
                  <b>Тема ВКР:</b> {selectedStudent.topic}
                </p>
              </div>

              <button
                className="student-close-btn"
                type="button"
                onClick={() => setStudentWorkOpen(false)}
              >
                Закрыть
              </button>
            </div>

            <div className="teacher-chat-box">
              {teacherMessages.length === 0 ? (
                <p className="empty-chat-text">Проверка работы еще не начата</p>
              ) : (
                teacherMessages.map((msg) => (
                  <div className="teacher-message" key={msg.id}>
                    <div className="teacher-message-header">
                      <span className="teacher-message-author">
                        {msg.sender}
                      </span>

                      <span className="teacher-message-date">
                        {msg.date} {msg.time}
                      </span>
                    </div>

                    <div className="teacher-message-text">{msg.text}</div>
                  </div>
                ))
              )}
            </div>

            <div className="teacher-chat-input">
              <label className="teacher-attach-btn">
                <img src={clip} alt="file" className="clip-icon" />
                <input type="file" hidden />
              </label>

              <input
                type="text"
                value={teacherMessage}
                onChange={(e) => setTeacherMessage(e.target.value)}
                placeholder="Написать сообщение..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendTeacherMessage();
                  }
                }}
              />

              <button
                className="teacher-send-btn"
                type="button"
                onClick={sendTeacherMessage}
              >
                <img src={send} alt="send" />
              </button>

              <button
  className="teacher-submit-btn"
  type="button"
  onClick={() => {
    setWorkStatus("Проверено");

    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
    }, 3000);
  }}
>
  Отметить работу, как "Проверено"
</button>

{successMessage && (
  <div className="success-popup">
    Работа проверена
  </div>
)}
            </div>
          </div>
        </div>
      )}

      <section className="nav-panel">
        <Link to="/teacher" className="nav-link">
          Главная
        </Link>

        <Link to="/teacher-cabinet" className="nav-link">
          Личный кабинет
        </Link>

        <Link to="/teacher-work" className="nav-link">
          Мои студенты
        </Link>

        <Link to="/mytopic" className="nav-link">
          Мои темы ВКР
        </Link>
      </section>

      <footer className="footer">
        <div>ⓘ Важная информация</div>
        <span>На данный момент информация отсутствует</span>
      </footer>

      <button
        className="support-btn"
        type="button"
        onClick={() => setSupportOpen(true)}
      >
        <img src={support} alt="поддержка" />
      </button>

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
    </div>
  );
}