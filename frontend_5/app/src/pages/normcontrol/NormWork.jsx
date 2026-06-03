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

  const [gradeDraft, setGradeDraft] = useState({
    preliminary: "",
    defense: "",
    final: "",
  });

  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");
  const [teacherSearchValue, setTeacherSearchValue] = useState("");

  const [profilePhoto] = useState(() => {
    return localStorage.getItem("normProfilePhoto") || avatar;
  });

  const [students, setStudents] = useState([
    {
      id: 1,
      fio: "Иванов Иван Иванович",
      group: "АТ-24",
      topic: "Разработка базы данных",
      teacher: "Бакаев М. А.",

      teacherStatus: "Проверено",
      teacherGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },

      normStatus: "Проверено",
      normGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },
    },
    {
      id: 2,
      fio: "Сидорова Анна Петровна",
      group: "АТ-24",
      topic: "Разработка мобильного приложения",
      teacher: "Бакаев М. А.",

      teacherStatus: "Проверено",
      teacherGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },

      normStatus: "На проверке",
      normGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },
    },
    {
      id: 3,
      fio: "Петров Алексей Дмитриевич",
      group: "АО-22",
      topic: "Разработка базы данных",
      teacher: "Бакаев М. А.",

      teacherStatus: "Проверено",
      teacherGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },

      normStatus: "Не проверено",
      normGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },
    },

    {
      id: 4,
      fio: "Карпенко Никита Денисович",
      group: "АТ-23",
      topic: "Разработка информационной системы на основе нейросетевой модели для подготовки ВКР",
      teacher: "Тетерин М. М.",

      teacherStatus: "Проверено",
      teacherGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },

      normStatus: "Требуется доработка",
      normGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },
    },

    {
      id: 5,
      fio: "Филатова Виктория Сергеевна",
      group: "АТ-23",
      topic: "Разработка информационной системы для взаимодействия студентов и преподаваетелей при работе с ВКР",
      teacher: "Тетерин М. М.",

      teacherStatus: "Проверено",
      teacherGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },

      normStatus: "Требуется доработка",
      normGrades: {
        preliminary: "",
        defense: "",
        final: "",
      },
    },
  ]);

  const gradeRows = [
    {
      key: "preliminary",
      title: "Предварительная оценка",
      shortTitle: "Предварительная",
    },
    {
      key: "defense",
      title: "Оценка за предзащиту",
      shortTitle: "За предзащиту",
    },
    {
      key: "final",
      title: "Итоговая оценка",
      shortTitle: "Итоговая",
    },
  ];

  const filteredStudents = students.filter((student) => {
    const groupMatch = groupFilter === "all" || student.group === groupFilter;

    const statusMatch =
      statusFilter === "all" || student.normStatus === statusFilter;

    const searchMatch =
      searchValue.trim() === "" ||
      student.fio.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.topic.toLowerCase().includes(searchValue.toLowerCase());

    const teacherSearchMatch =
      teacherSearchValue.trim() === "" ||
      student.teacher.toLowerCase().includes(teacherSearchValue.toLowerCase());

    return groupMatch && statusMatch && searchMatch && teacherSearchMatch;
  });

  const currentMessages = selectedStudent
    ? teacherMessagesByStudent[selectedStudent.id] || []
    : [];

  const getStatusClass = (status) => {
    if (status === "Проверено") return "checked";
    if (status === "На проверке") return "progress";
    if (status === "Требуется доработка") return "revision";
    return "not-checked";
  };

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
          ? { ...student, normStatus: newStatus }
          : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent ? { ...prevStudent, normStatus: newStatus } : prevStudent
    );

    setStatusMenuOpen(false);
    setSuccessMessage(true);

    setTimeout(() => {
      setSuccessMessage(false);
    }, 3000);
  };

  const cycleNormStatus = (student) => {
    const statuses = [
      "Не проверено",
      "На проверке",
      "Требуется доработка",
      "Проверено",
    ];

    const currentIndex = statuses.indexOf(student.normStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    setStudents((prevStudents) =>
      prevStudents.map((item) =>
        item.id === student.id ? { ...item, normStatus: nextStatus } : item
      )
    );

    if (selectedStudent?.id === student.id) {
      setSelectedStudent((prevStudent) => ({
        ...prevStudent,
        normStatus: nextStatus,
      }));
    }
  };

  const openStudentWork = (student) => {
    setSelectedStudent(student);
    setStudentWorkOpen(true);
    setStatusMenuOpen(false);
    setGradeOpen(false);

    setGradeDraft({
      preliminary: student.normGrades?.preliminary || "",
      defense: student.normGrades?.defense || "",
      final: student.normGrades?.final || "",
    });
  };

  const openGradeEditor = (student) => {
    setSelectedStudent(student);

    setGradeDraft({
      preliminary: student.normGrades?.preliminary || "",
      defense: student.normGrades?.defense || "",
      final: student.normGrades?.final || "",
    });

    setGradeOpen(true);
  };

  const closeGradeEditor = () => {
    setGradeOpen(false);
  };

  const changeGradeDraft = (field, value) => {
    setGradeDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearGradeField = (field) => {
    setGradeDraft((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const saveStudentGrades = () => {
    if (!selectedStudent) return;

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              normGrades: {
                ...gradeDraft,
              },
            }
          : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent
        ? {
            ...prevStudent,
            normGrades: {
              ...gradeDraft,
            },
          }
        : prevStudent
    );

    setGradeMessage(true);

    setTimeout(() => {
      setGradeMessage(false);
    }, 3000);
  };

  const changeStudentGradeFromTable = (studentId, field, value) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              normGrades: {
                ...student.normGrades,
                [field]: value,
              },
            }
          : student
      )
    );

    if (selectedStudent?.id === studentId) {
      setSelectedStudent((prevStudent) => ({
        ...prevStudent,
        normGrades: {
          ...prevStudent.normGrades,
          [field]: value,
        },
      }));

      setGradeDraft((prevDraft) => ({
        ...prevDraft,
        [field]: value,
      }));
    }
  };

  const renderGradesCell = (grades, studentForEdit = null) => {
    return (
      <div className="grade-cell-list">
        {gradeRows.map((row) => (
          <div className="grade-cell-row" key={row.key}>
            <span className="grade-name-readonly">{row.shortTitle}</span>

            {studentForEdit ? (
              <input
                className="grade-mini-input"
                type="text"
                value={grades?.[row.key] || ""}
                placeholder="Балл"
                onChange={(e) =>
                  changeStudentGradeFromTable(
                    studentForEdit.id,
                    row.key,
                    e.target.value
                  )
                }
              />
            ) : (
              <span className="grade-value-text">
                {grades?.[row.key] || "-"}
              </span>
            )}
          </div>
        ))}
      </div>
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
              <img src={profilePhoto} alt="avatar" />
            </div>

            <div className="profile-text">
              <div className="name">Герасимов А. К.</div>
              <div className="role">Сотрудник нормоконтроля</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/reviewer-cabinet">Личный кабинет</Link>
              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>

      

      <main className="teacher-work-panel">
        <div className="teacher-work-header">
          <div>
            <h1>Студенты</h1>
            <p>Проверить работы студентов</p>
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
                <option value="Требуется доработка">
                  Требуется доработка
                </option>
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

              <div className="search-student search-teacher">
                <input
                  value={teacherSearchValue}
                  onChange={(e) => setTeacherSearchValue(e.target.value)}
                  placeholder="Поиск преподавателя"
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
                  setTeacherSearchValue("");
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
                <th>Оценка руководителя</th>
                <th>Статус проверки нормоконтролем</th>
                <th>Оценка нормоконтроля</th>
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

      <td className="empty-status-cell">-</td>

      <td>{renderGradesCell(student.teacherGrades)}</td>

      <td>
        <button
          type="button"
          className={`status-btn ${getStatusClass(student.normStatus)}`}
          onClick={() => cycleNormStatus(student)}
        >
          {student.normStatus}
        </button>
      </td>

      <td>{renderGradesCell(student.normGrades, student)}</td>

      <td>
        <button
          className="go-work-link"
          type="button"
          onClick={() => openStudentWork(student)}
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

            {gradeOpen && selectedStudent && (
              <div className="final-grade-box final-grade-box-modal">
                <button
                  className="final-grade-close"
                  type="button"
                  onClick={closeGradeEditor}
                >
                  ×
                </button>

                {gradeRows.map((row) => (
                  <div className="grade-editor-row" key={row.key}>
                    <h3>{row.title}</h3>

                    <input
                      type="text"
                      value={gradeDraft[row.key]}
                      onChange={(e) =>
                        changeGradeDraft(row.key, e.target.value)
                      }
                      placeholder="Введите балл"
                    />

                    <div className="final-grade-actions">
                      <button
                        type="button"
                        className="final-grade-cancel"
                        onClick={() => clearGradeField(row.key)}
                      >
                        X
                      </button>

                      <button
                        type="button"
                        className="final-grade-save"
                        onClick={saveStudentGrades}
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                  className={`teacher-submit-btn ${getStatusClass(
                    selectedStudent.normStatus
                  )}`}
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

              <button
                className="grade-open-btn"
                type="button"
                onClick={() => openGradeEditor(selectedStudent)}
              >
                Оценка
              </button>
            </div>

            {successMessage && (
              <div className="success-popup">Статус работы изменён</div>
            )}

            {gradeMessage && (
              <div className="grade-popup">Оценка сохранена</div>
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