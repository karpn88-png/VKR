import { useCallback, useEffect, useState } from "react";
import "./TeacherWork.css";

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
  getTeacherStudents,
  getWorkThread,
  markStudentWorkChecked,
  sendWorkMessage,
} from "../../api/workThread";

export default function TeacherWork() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [studentWorkOpen, setStudentWorkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherMessages, setTeacherMessages] = useState([]);
  const [teacherFile, setTeacherFile] = useState(null);
  const [teacherStatus, setTeacherStatus] = useState("");
  const [isSendingTeacherMessage, setIsSendingTeacherMessage] = useState(false);
  const [isMarkingChecked, setIsMarkingChecked] = useState(false);

  const [students, setStudents] = useState([]);
  const [successMessage, setSuccessMessage] = useState(false);
  const selectedStudentId = selectedStudent?.id;

  const loadStudents = useCallback(async () => {
    try {
      setStudents(await getTeacherStudents());
    } catch (error) {
      setTeacherStatus(`Не удалось загрузить список студентов: ${error.message}`);
    }
  }, []);

  const loadTeacherThread = useCallback(async (studentId) => {
    try {
      const thread = await getWorkThread(studentId);
      setTeacherMessages(thread.messages ?? []);
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === studentId ? { ...student, status: thread.status } : student,
        ),
      );
    } catch (error) {
      setTeacherStatus(`Не удалось загрузить переписку: ${error.message}`);
    }
  }, []);

  const sendTeacherMessage = async () => {
    if (isSendingTeacherMessage || !selectedStudent) return;

    if (!teacherMessage.trim() && !teacherFile) {
      setTeacherStatus("Введите сообщение или прикрепите файл.");
      return;
    }

    setIsSendingTeacherMessage(true);
    setTeacherStatus("Отправляем сообщение...");

    try {
      await sendWorkMessage(selectedStudent.id, {
        senderRole: "teacher",
        senderName: "Бакаев М. А.",
        recipientName: selectedStudent.fio,
        text: teacherMessage,
        file: teacherFile,
      });
      setTeacherMessage("");
      setTeacherFile(null);
      setTeacherStatus("");
      await loadTeacherThread(selectedStudent.id);
    } catch (error) {
      setTeacherStatus(`Не удалось отправить сообщение: ${error.message}`);
    } finally {
      setIsSendingTeacherMessage(false);
    }
  };

  const markWorkChecked = async () => {
    if (!selectedStudent || isMarkingChecked) return;

    setIsMarkingChecked(true);
    setTeacherStatus("Обновляем статус работы...");

    try {
      const thread = await markStudentWorkChecked(selectedStudent.id);
      setTeacherMessages(thread.messages ?? []);
      setStudents((currentStudents) =>
        currentStudents.map((student) =>
          student.id === selectedStudent.id ? { ...student, status: thread.status } : student,
        ),
      );
      setSelectedStudent((student) =>
        student ? { ...student, status: thread.status } : student,
      );
      setSuccessMessage(true);
      setTeacherStatus("");

      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      setTeacherStatus(`Не удалось обновить статус: ${error.message}`);
    } finally {
      setIsMarkingChecked(false);
    }
  };

  useEffect(() => {
    const refresh = () => {
      void loadStudents();
    };
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadStudents]);

  useEffect(() => {
    if (!selectedStudentId || !studentWorkOpen) return undefined;

    const refresh = () => {
      void loadTeacherThread(selectedStudentId);
    };
    const initial = window.setTimeout(refresh, 0);
    const timer = window.setInterval(refresh, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadTeacherThread, selectedStudentId, studentWorkOpen]);

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
                          : student.status === "На проверке"
                            ? "status progress"
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
                  <div
                    className={`teacher-message ${
                      msg.sender_role === "student" ? "student-message" : "teacher-own-message"
                    }`}
                    key={msg.id}
                  >
                    <div className="teacher-message-header">
                      <span className="teacher-message-author">
                        {msg.sender_name}
                      </span>

                      <span className="teacher-message-date">
                        {formatAppDateTime(msg.created_at)}
                      </span>
                    </div>

                    {msg.text && <div className="teacher-message-text">{msg.text}</div>}
                    {msg.has_file && (
                      <a
                        className="teacher-message-file"
                        href={getAttachmentUrl(msg.download_url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {msg.file_name}
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="teacher-chat-input">
              <label className="teacher-attach-btn">
                <img src={clip} alt="file" className="clip-icon" />
                <input
                  type="file"
                  hidden
                  onChange={(event) => {
                    setTeacherFile(event.target.files?.[0] ?? null);
                    event.target.value = "";
                  }}
                />
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
                disabled={isSendingTeacherMessage}
                onClick={sendTeacherMessage}
              >
                <img src={send} alt="send" />
              </button>

              <button
  className="teacher-submit-btn"
  type="button"
  disabled={isMarkingChecked}
  onClick={markWorkChecked}
>
  {isMarkingChecked ? "Обновляем..." : 'Отметить работу, как "Проверено"'}
</button>

{successMessage && (
  <div className="success-popup">
    Работа проверена
  </div>
)}
{(teacherFile || teacherStatus) && (
  <div className="teacher-chat-status">
    {teacherFile && <span>Прикреплен файл: {teacherFile.name}</span>}
    {teacherStatus && <span>{teacherStatus}</span>}
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
