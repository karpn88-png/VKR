    import { useEffect, useState } from "react";
import "./TeacherWork.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import send from "../../assets/send.png";
import teacher from "../../assets/teacher_photo.png";

import { Link } from "react-router-dom";

export default function TeacherWork() {
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
      fio: "Карпенко Никита Денисович",
      group: "АТ-23",
      topic: "Разработка информационной системы на основе нейросетевой модели для проверки ВКР",
      status: "Не проверено",
      preliminaryGrade: "",
      predefenseGrade: "",
      finalGrade: "",
    },
    {
      id: 2,
      fio: "Филатова Виктория Сергеевна",
      group: "АТ-23",
      topic: "Разработка информационной системы для взаимодействия студентов и преподавателей при работе с ВКР",
      status: "На проверке",
      preliminaryGrade: "",
      predefenseGrade: "",
      finalGrade: "",
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

  const gradeFields = [
    { key: "preliminaryGrade", label: "Предварительная оценка" },
    { key: "predefenseGrade", label: "Оценка за предзащиту" },
    { key: "finalGrade", label: "Итоговая оценка" },
  ];

  const [teacherprofilePhoto] = useState(() => {
  return localStorage.getItem("teacherProfilePhoto") || teacher;
});

  const currentMessages = selectedStudent
    ? teacherMessagesByStudent[selectedStudent.id] || []
    : [];

  const sendTeacherMessage = () => {
    if (!teacherMessage.trim() || !selectedStudent) return;

    const newMessage = {
      id: Date.now(),
      text: teacherMessage,
      sender: "Тетерин М. М.",
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

  const updateStudentGrade = (studentId, gradeKey, value) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, [gradeKey]: value } : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent && prevStudent.id === studentId
        ? { ...prevStudent, [gradeKey]: value }
        : prevStudent
    );
  };

  const showGradeMessage = () => {
    setGradeMessage(true);

    setTimeout(() => {
      setGradeMessage(false);
    }, 3000);
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
              <img src={teacherprofilePhoto} alt="avatar" />
            </div>

            <div className="profile-text">
              <div className="name">Тетерин М. М.</div>
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
                  placeholder="Поиск студента"
                />
                <span>⌕</span>
              </div>

              <button
                className="resets-filters-btn"
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
                <th>Статус работы</th>
                <th>Предварительная оценка</th>
                <th>Оценка за предзащиту</th>
                <th>Итоговая оценка</th>
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

                  {gradeFields.map((gradeField) => (
                    <td key={gradeField.key}>
                      <input
                        className="grade-input grade-table-input"
                        type="text"
                        value={student[gradeField.key] || ""}
                        onChange={(e) =>
                          updateStudentGrade(
                            student.id,
                            gradeField.key,
                            e.target.value
                          )
                        }
                        placeholder="Балл"
                      />
                    </td>
                  ))}

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
  <b>Студент:</b> {selectedStudent.fio}, {selectedStudent.group}
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
                  Оценки
                </button>

                {gradeOpen && (
                  <div className="final-grade-box">
                    <button
                      className="final-grade-close"
                      type="button"
                      onClick={() => setGradeOpen(false)}
                      aria-label="Закрыть форму оценок"
                    >
                      ×
                    </button>

                    {gradeFields.map((gradeField) => (
                      <div className="grade-form-row" key={gradeField.key}>
                        <h3>{gradeField.label}</h3>

                        <input
                          type="text"
                          value={selectedStudent[gradeField.key] || ""}
                          onChange={(e) =>
                            updateStudentGrade(
                              selectedStudent.id,
                              gradeField.key,
                              e.target.value
                            )
                          }
                          placeholder="Введите балл"
                        />

                        <div className="final-grade-actions">
                          <button
                            type="button"
                            className="final-grade-cancel"
                            onClick={() =>
                              updateStudentGrade(
                                selectedStudent.id,
                                gradeField.key,
                                ""
                              )
                            }
                          >
                            X
                          </button>

                          <button
                            type="button"
                            className="final-grade-save"
                            onClick={showGradeMessage}
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    ))}
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
          Мои темы для ВКР
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
  <div className="notifications-popover">
    <button
      className="notifications-close"
      type="button"
      onClick={() => setNotificationsOpen(false)}
    >
      ×
    </button>

    <h3>Уведомления</h3>

    <p>Нет новых уведомлений</p>
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
    
