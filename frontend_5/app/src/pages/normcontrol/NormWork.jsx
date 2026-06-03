import { useCallback, useEffect, useMemo, useState } from "react";
import "./NormWork.css";

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
  sendWorkMessage,
  updateStudentWorkGrades,
  updateStudentWorkStatus,
} from "../../api/workThread";

const NORMCONTROL_ROLE = "normcontrol";
const NORMCONTROL_NAME = "Герасимов А. К.";
const TEACHER_ROLE = "teacher";

const emptyGrades = {
  preliminary: "",
  defense: "",
  final: "",
};

const normalizeNormStudent = (student) => ({
  ...student,
  teacherStatus: student.teacherStatus ?? "Не проверено",
  teacherGrades: student.teacherGrades ?? { ...emptyGrades },
  normStatus: student.normStatus ?? student.status ?? "Не проверено",
  normGrades: student.normGrades ?? {
    ...emptyGrades,
    final: student.grade ?? "",
  },
});

export default function NormWork() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [studentWorkOpen, setStudentWorkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherFile, setTeacherFile] = useState(null);
  const [teacherMessagesByStudent, setTeacherMessagesByStudent] = useState({});
  const [chatStatus, setChatStatus] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isMarkingChecked, setIsMarkingChecked] = useState(false);
  const [isSavingGrade, setIsSavingGrade] = useState(false);

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

  const currentMessages = useMemo(
    () => (selectedStudent ? teacherMessagesByStudent[selectedStudent.id] || [] : []),
    [selectedStudent, teacherMessagesByStudent]
  );
  const selectedStudentId = selectedStudent?.id;

  const applyStudentStatus = useCallback((studentId, status, patch = {}) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId
          ? { ...student, normStatus: status, ...patch }
          : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent && prevStudent.id === studentId
        ? { ...prevStudent, normStatus: status, ...patch }
        : prevStudent
    );
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const loadedStudents = await getTeacherStudents(NORMCONTROL_ROLE);
      setStudents(loadedStudents.map(normalizeNormStudent));
    } catch (error) {
      setChatStatus(`Не удалось загрузить студентов: ${error.message}`);
    }
  }, []);

  const loadNormThread = useCallback(async (studentId) => {
    try {
      const thread = await getWorkThread(studentId, NORMCONTROL_ROLE);
      setTeacherMessagesByStudent((prev) => ({
        ...prev,
        [studentId]: thread.messages ?? [],
      }));
      applyStudentStatus(studentId, thread.status ?? "Не проверено", {
        teacherStatus: thread.teacherStatus ?? "Не проверено",
        normStatus: thread.normStatus ?? thread.status ?? "Не проверено",
        teacherGrades: thread.teacherGrades ?? { ...emptyGrades },
        normGrades: thread.normGrades ?? { ...emptyGrades },
      });
      setChatStatus("");
    } catch (error) {
      setChatStatus(`Не удалось загрузить переписку: ${error.message}`);
    }
  }, [applyStudentStatus]);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      void loadStudents();
    }, 0);
    const timer = window.setInterval(() => {
      void loadStudents();
    }, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadStudents]);

  useEffect(() => {
    if (!studentWorkOpen || !selectedStudentId) return undefined;

    const initial = window.setTimeout(() => {
      void loadNormThread(selectedStudentId);
    }, 0);
    const timer = window.setInterval(() => {
      void loadNormThread(selectedStudentId);
    }, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadNormThread, selectedStudentId, studentWorkOpen]);

  const getStatusClass = (status) => {
    if (status === "Проверено") return "checked";
    if (status === "На проверке") return "progress";
    if (status === "Требуется доработка") return "revision";
    return "not-checked";
  };

  const sendTeacherMessage = async () => {
    if (isSendingMessage || !selectedStudent) return;

    if (!teacherMessage.trim() && !teacherFile) {
      setChatStatus("Введите сообщение или прикрепите файл.");
      return;
    }

    setIsSendingMessage(true);
    setChatStatus("Отправляем сообщение...");

    try {
      await sendWorkMessage(selectedStudent.id, {
        senderRole: NORMCONTROL_ROLE,
        senderName: NORMCONTROL_NAME,
        recipientName: selectedStudent.fio,
        text: teacherMessage,
        file: teacherFile,
      });
      setTeacherMessage("");
      setTeacherFile(null);
      await loadNormThread(selectedStudent.id);
      setChatStatus("Сообщение отправлено.");
    } catch (error) {
      setChatStatus(`Не удалось отправить сообщение: ${error.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const persistStudentStatus = async (student, newStatus) => {
    if (!student || isMarkingChecked) return;

    setIsMarkingChecked(true);
    setChatStatus("Обновляем статус работы...");

    try {
      const thread = await updateStudentWorkStatus(
        student.id,
        newStatus,
        NORMCONTROL_ROLE
      );
      setTeacherMessagesByStudent((prev) => ({
        ...prev,
        [student.id]: thread.messages ?? prev[student.id] ?? [],
      }));
      applyStudentStatus(student.id, thread.status ?? newStatus);
      setChatStatus("Статус работы обновлен.");
      setSuccessMessage(true);
      setTimeout(() => {
        setSuccessMessage(false);
      }, 3000);
    } catch (error) {
      setChatStatus(`Не удалось обновить статус: ${error.message}`);
    } finally {
      setIsMarkingChecked(false);
    }
  };

  const updateStudentStatus = async (newStatus) => {
    if (!selectedStudent) return;
    setStatusMenuOpen(false);
    await persistStudentStatus(selectedStudent, newStatus);
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
    void persistStudentStatus(student, nextStatus);
  };

  const openStudentWork = (student) => {
    setSelectedStudent(student);
    setStudentWorkOpen(true);
    setStatusMenuOpen(false);
    setGradeOpen(false);
    setTeacherMessage("");
    setTeacherFile(null);
    setChatStatus("Загружаем переписку...");
    void loadNormThread(student.id);

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

  const applyGradePatch = (studentId, targetRole, grades) => {
    const fieldName = targetRole === "teacher" ? "teacherGrades" : "normGrades";

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId
          ? {
              ...student,
              [fieldName]: {
                ...student[fieldName],
                ...grades,
              },
            }
          : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent && prevStudent.id === studentId
        ? {
            ...prevStudent,
            [fieldName]: {
              ...prevStudent[fieldName],
              ...grades,
            },
          }
        : prevStudent
    );
  };

  const saveGrades = async (student, targetRole, grades) => {
    if (!student || isSavingGrade) return;

    setIsSavingGrade(true);
    setChatStatus("Сохраняем оценку...");

    try {
      const thread = await updateStudentWorkGrades(student.id, {
        actorRole: NORMCONTROL_ROLE,
        targetRole,
        grades,
      });
      applyStudentStatus(student.id, thread.status ?? student.normStatus, {
        teacherStatus: thread.teacherStatus ?? student.teacherStatus,
        normStatus: thread.normStatus ?? student.normStatus,
        teacherGrades: thread.teacherGrades ?? student.teacherGrades,
        normGrades: thread.normGrades ?? student.normGrades,
      });
      setChatStatus("Оценка сохранена.");
      setGradeMessage(true);

      setTimeout(() => {
        setGradeMessage(false);
      }, 3000);
    } catch (error) {
      setChatStatus(`Не удалось сохранить оценку: ${error.message}`);
    } finally {
      setIsSavingGrade(false);
    }
  };

  const saveStudentGrades = () => {
    if (!selectedStudent) return;

    applyGradePatch(selectedStudent.id, "normcontrol", gradeDraft);

    void saveGrades(
      {
        ...selectedStudent,
        normGrades: {
          ...selectedStudent.normGrades,
          ...gradeDraft,
        },
      },
      NORMCONTROL_ROLE,
      gradeDraft
    );
  };

  const changeStudentGradeFromTable = (studentId, targetRole, field, value) => {
    applyGradePatch(studentId, targetRole, { [field]: value });

    if (targetRole === "normcontrol" && selectedStudent?.id === studentId) {
      setGradeDraft((prevDraft) => ({
        ...prevDraft,
        [field]: value,
      }));
    }
  };

  const renderGradesCell = (grades, studentForEdit = null, targetRole = NORMCONTROL_ROLE) => {
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
                    targetRole,
                    row.key,
                    e.target.value
                  )
                }
                onBlur={(e) =>
                  saveGrades(
                    {
                      ...studentForEdit,
                      [`${targetRole === "teacher" ? "teacher" : "norm"}Grades`]: {
                        ...grades,
                        [row.key]: e.target.value,
                      },
                    },
                    targetRole,
                    {
                      ...grades,
                      [row.key]: e.target.value,
                    }
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
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

      <td>
        <span className={`status-btn status-readonly ${getStatusClass(student.teacherStatus)}`}>
          {student.teacherStatus}
        </span>
      </td>

      <td>{renderGradesCell(student.teacherGrades, student, TEACHER_ROLE)}</td>

      <td>
        <button
          type="button"
          className={`status-btn ${getStatusClass(student.normStatus)}`}
          disabled={isMarkingChecked}
          onClick={() => cycleNormStatus(student)}
        >
          {student.normStatus}
        </button>
      </td>

      <td>{renderGradesCell(student.normGrades, student, NORMCONTROL_ROLE)}</td>

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
                  <div
                    className={`teacher-message ${
                      msg.sender_role === NORMCONTROL_ROLE ? "own" : "other"
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

                    {msg.text && (
                      <div className="teacher-message-text">{msg.text}</div>
                    )}

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
                        disabled={isSavingGrade}
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
                  disabled={isSendingMessage}
                  onClick={sendTeacherMessage}
                >
                  <img src={send} alt="send" />
                </button>
              </div>

              {(teacherFile || chatStatus) && (
                <div className="teacher-chat-status">
                  {teacherFile && <span>Прикреплен файл: {teacherFile.name}</span>}
                  {chatStatus && <span>{chatStatus}</span>}
                </div>
              )}

              <div className="status-dropdown">
                <button
                  type="button"
                  className={`teacher-submit-btn ${getStatusClass(
                    selectedStudent.normStatus
                  )}`}
                  disabled={isMarkingChecked}
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
