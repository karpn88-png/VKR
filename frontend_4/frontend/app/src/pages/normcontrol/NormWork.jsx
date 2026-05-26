import { useEffect, useState } from "react";
import "./NormWork.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import send from "../../assets/send.png";

import { Link } from "react-router-dom";

export default function NormWork() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [studentWorkOpen, setStudentWorkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherMessagesByStudent, setTeacherMessagesByStudent] = useState({});

  const [successMessage, setSuccessMessage] = useState(false);
  const [gradeMessage, setGradeMessage] = useState(false);

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [gradeOpen, setGradeOpen] = useState(false);

  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const [students, setStudents] = useState([
    {
      id: 1,
      fio: "Иванов Иван Иванович",
      group: "АТ-23",
      topic: "Разработка информационной системы",
      status: "Не проверено",
      grade: "",
      teacher: "Бакаев М. А.",
      teacherGrade: "",
    },
    {
      id: 2,
      fio: "Сидорова Анна Петровна",
      group: "АТ-24",
      topic: "Разработка мобильного приложения",
      status: "На проверке",
      grade: "",
      teacher: "Бакаев М. А.",
      teacher: "Бакаев М. А.",
      teacherGrade: "",
    },
    {
      id: 3,
      fio: "Петров Алексей Дмитриевич",
      group: "АО-22",
      topic: "Разработка базы данных",
      status: "Требуется доработка",
      grade: "",
      teacher: "Бакаев М. А.",
      teacher: "Бакаев М. А.",
      teacherGrade: "",
    },
  ]);

  const filteredStudents = students.filter((student) => {
    const groupMatch = groupFilter === "all" || student.group === groupFilter;
    const statusMatch = statusFilter === "all" || student.status === statusFilter;

    const searchMatch =
      searchValue.trim() === "" ||
      student.fio.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.topic.toLowerCase().includes(searchValue.toLowerCase());

    return groupMatch && statusMatch && searchMatch;
  });

  const currentMessages = selectedStudent
    ? teacherMessagesByStudent[selectedStudent.id] || []
    : [];

  const sendTeacherMessage = () => {
    if (!teacherMessage.trim() || !selectedStudent) return;

    const newMessage = {
      id: Date.now(),
      text: teacherMessage,
      sender: "Герасимов А. К.",
      date: new Date().toLocaleDateString("ru-RU"),
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTeacherMessagesByStudent((prev) => ({
      ...prev,
      [selectedStudent.id]: [...(prev[selectedStudent.id] || []), newMessage],
    }));

    setTeacherMessage("");
  };

  const updateStudentStatus = (newStatus) => {
    if (!selectedStudent) return;

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === selectedStudent.id
          ? { ...student, status: newStatus }
          : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent ? { ...prevStudent, status: newStatus } : prevStudent
    );

    setStatusMenuOpen(false);
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
    }, 3000);
  };

  const updateStudentGrade = (value) => {
  if (!selectedStudent) return;

  setStudents((prevStudents) =>
    prevStudents.map((student) =>
      student.id === selectedStudent.id
        ? {
            ...student,
            grade: value,
          }
        : student
    )
  );

  setSelectedStudent((prevStudent) =>
    prevStudent
      ? {
          ...prevStudent,
          grade: value,
        }
      : prevStudent
  );
};

  useEffect(() => {
    document.body.style.overflow = studentWorkOpen ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [studentWorkOpen]);

  useEffect(() => {
    const chatBox = document.querySelector(".teacher-chat-box");

    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }, [currentMessages]);

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          <div className="logo-box">
            <img src={logo} alt="logo" />
          </div>

          <div>
            <b>Навигатор ВКР</b>
            <span>Cтуденты</span>
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
              <div className="name">Герасимов А. К.</div>
              <div className="role">Сотрудник нормоконтроля</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/reviewer-cabinet" className="nav-link">
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
            <h1>Мои студенты и их ВКР</h1>
            <p>Список студентов, выполняющих ВКР под моим руководством</p>
          </div>

          <div className="teacher-filters">
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
            >
              <option value="all">Все группы</option>
              <option value="АТ-23">АТ-23</option>
              <option value="АТ-24">АТ-24</option>
              <option value="АО-22">АО-22</option>
            </select>

            <div className="filters-row">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Все статусы</option>
                <option value="Не проверено">Не проверено</option>
                <option value="На проверке">На проверке</option>
                <option value="Требуется доработка">Требуется доработка</option>
                <option value="Проверено">Проверено</option>
              </select>

              <div className="search-student">
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Поиск студента..."
                />
                <span>⌕</span>
              </div>

              <button
                className="reset-filters-btn"
                type="button"
                onClick={() => {
                  setGroupFilter("all");
                  setStatusFilter("all");
                  setSearchValue("");
                }}
              >
                Сбросить фильтры
              </button>
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
                <th>Научный руководитель</th>
                <th>Статус проверки руководителем</th>
                <th>Статус работы</th>
                <th>Оценка</th>
                <th>Перейти к работе</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.fio}</td>
                  <td>{student.group}</td>
                  <td>{student.topic}</td>
                  <td>{student.teacher}</td>
                  <td>{student.teacherGrade || "-"}</td>

                  <td>
                    <button
                      type="button"
                      className={`status-btn ${
                        student.status === "Проверено"
                          ? "checked"
                          : student.status === "На проверке"
                          ? "progress"
                          : student.status === "Требуется доработка"
                          ? "revision"
                          : "not-checked"
                      }`}
                      onClick={() => {
                        const statuses = [
                          "Не проверено",
                          "На проверке",
                          "Требуется доработка",
                          "Проверено",
                        ];

                        const currentIndex = statuses.indexOf(student.status);
                        const nextStatus =
                          statuses[(currentIndex + 1) % statuses.length];

                        setStudents((prevStudents) =>
                          prevStudents.map((s) =>
                            s.id === student.id
                              ? { ...s, status: nextStatus }
                              : s
                          )
                        );
                      }}
                    >
                      {student.status}
                    </button>
                  </td>

                  <td>{student.grade || "-"}</td>

                  <td>
                    <button
                      className="go-work-link"
                      type="button"
                      onClick={() => {
                        setSelectedStudent(student);
                        setStudentWorkOpen(true);
                        setStatusMenuOpen(false);
                        setGradeOpen(false);
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
        <div
          className="student-work-overlay"
          onClick={() => setStudentWorkOpen(false)}
        >
          <div
            className="student-work-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="student-work-top">
              <div>
                <p>
                  <b>Студент:</b> {selectedStudent.fio}
                </p>
                <p>
                  <b>Тема ВКР:</b> {selectedStudent.topic}
                </p>
                <p>
                  <b>Научный руководитель:</b> {selectedStudent.teacher}
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
              {currentMessages.length === 0 ? (
                <p className="empty-chat-text">
                  Проверка работы еще не начата
                </p>
              ) : (
                currentMessages.map((msg) => (
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

            <div className="teacher-chat-bottom">
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
              </div>

              <div className="status-dropdown">
                <button
                  type="button"
                  className={`teacher-submit-btn ${
                    selectedStudent.status === "Проверено"
                      ? "checked"
                      : selectedStudent.status === "На проверке"
                      ? "progress"
                      : selectedStudent.status === "Требуется доработка"
                      ? "revision"
                      : "not-checked"
                  }`}
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                >
                  Статус работы
                </button>

                {statusMenuOpen && (
                  <div className="status-dropdown-menu">
                    <button
                      type="button"
                      onClick={() => updateStudentStatus("Не проверено")}
                    >
                      Не проверено
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStudentStatus("На проверке")}
                    >
                      На проверке
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateStudentStatus("Требуется доработка")
                      }
                    >
                      Требуется доработка
                    </button>

                    <button
                      type="button"
                      onClick={() => updateStudentStatus("Проверено")}
                    >
                      Проверено
                    </button>
                  </div>
                )}
              </div>

              <div className="grade-dropdown">
                <button
                  className="grade-open-btn"
                  type="button"
                  onClick={() => setGradeOpen(!gradeOpen)}
                >
                  Оценка
                </button>

                {gradeOpen && (
                  <div className="final-grade-box">
                    <button
                      className="final-grade-close"
                      type="button"
                      onClick={() => setGradeOpen(false)}
                    >
                      x
                    </button>

                    <h3>Итоговая оценка</h3>

                    <input
                      type="text"
                      value={selectedStudent.grade || ""}
                      onChange={(e) => updateStudentGrade(e.target.value)}
                      placeholder="Введите балл..."
                    />

                    <div className="final-grade-actions">
                      <button
                        type="button"
                        className="final-grade-cancel"
                        onClick={() => {
                          updateStudentGrade("");
                          setGradeOpen(false);
                        }}
                      >
                        X
                      </button>

                      <button
                        type="button"
                        className="final-grade-save"
                        onClick={() => {
                          setGradeMessage(true);
                          setGradeOpen(false);

                          setTimeout(() => {
                            setGradeMessage(false);
                          }, 3000);
                        }}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {successMessage && (
              <div className="success-popup">Статус работы изменён</div>
            )}

            {gradeMessage && (
              <div className="grade-popup">Оценка выставлена</div>
            )}
          </div>
        </div>
      )}

      <section className="nav-panel">
        <Link to="/reviewer" className="nav-link">
          Главная
        </Link>

        <Link to="/reviewer-cabinet" className="nav-link">
          Личный кабинет
        </Link>

        <Link to="/reviewer-work" className="nav-link">
          Студенты
        </Link>

        <Link to="/reviewer-view" className="nav-link">
          Преподаватели
        </Link>

        <Link to="/GOSTLoad" className="nav-link">
          Шаблоны ГОСТ
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