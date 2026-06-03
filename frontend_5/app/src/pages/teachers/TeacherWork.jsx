    import { useCallback, useEffect, useMemo, useState } from "react";
import "./TeacherWork.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import send from "../../assets/send.png";
import teacher from "../../assets/teacher_photo.png";

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

const TEACHER_ROLE = "teacher";
const TEACHER_NAME = "Тетерин М. М.";

const normalizeStudent = (student) => ({
  ...student,
  preliminaryGrade: student.preliminaryGrade ?? student.grade ?? "",
  predefenseGrade: student.predefenseGrade ?? "",
  finalGrade: student.finalGrade ?? "",
});

export default function TeacherWork() {
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

  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const [students, setStudents] = useState([]);

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

  const currentMessages = useMemo(
    () => (selectedStudent ? teacherMessagesByStudent[selectedStudent.id] || [] : []),
    [selectedStudent, teacherMessagesByStudent]
  );
  const selectedStudentId = selectedStudent?.id;

  const applyStudentStatus = useCallback((studentId, status, patch = {}) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === studentId ? { ...student, status, ...patch } : student
      )
    );

    setSelectedStudent((prevStudent) =>
      prevStudent && prevStudent.id === studentId
        ? { ...prevStudent, status, ...patch }
        : prevStudent
    );
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const loadedStudents = await getTeacherStudents(TEACHER_ROLE);
      setStudents(loadedStudents.map(normalizeStudent));
    } catch (error) {
      setChatStatus(`Не удалось загрузить студентов: ${error.message}`);
    }
  }, []);

  const loadTeacherThread = useCallback(async (studentId) => {
    try {
      const thread = await getWorkThread(studentId, TEACHER_ROLE);
      setTeacherMessagesByStudent((prev) => ({
        ...prev,
        [studentId]: thread.messages ?? [],
      }));
      applyStudentStatus(studentId, thread.status ?? "Не проверено", {
        preliminaryGrade: thread.preliminaryGrade ?? "",
        predefenseGrade: thread.predefenseGrade ?? "",
        finalGrade: thread.finalGrade ?? "",
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
      void loadTeacherThread(selectedStudentId);
    }, 0);
    const timer = window.setInterval(() => {
      void loadTeacherThread(selectedStudentId);
    }, 5000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [loadTeacherThread, selectedStudentId, studentWorkOpen]);

  const openStudentWork = (student) => {
    setSelectedStudent(student);
    setStudentWorkOpen(true);
    setStatusMenuOpen(false);
    setGradeOpen(false);
    setTeacherMessage("");
    setTeacherFile(null);
    setChatStatus("Загружаем переписку...");
    void loadTeacherThread(student.id);
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
        senderRole: TEACHER_ROLE,
        senderName: TEACHER_NAME,
        recipientName: selectedStudent.fio,
        text: teacherMessage,
        file: teacherFile,
      });
      setTeacherMessage("");
      setTeacherFile(null);
      await loadTeacherThread(selectedStudent.id);
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
      const thread = await updateStudentWorkStatus(student.id, newStatus, TEACHER_ROLE);
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

  const getTeacherGradePayload = (student) => ({
    preliminaryGrade: student?.preliminaryGrade ?? "",
    predefenseGrade: student?.predefenseGrade ?? "",
    finalGrade: student?.finalGrade ?? "",
  });

  const saveTeacherGrades = async (student) => {
    if (!student || isSavingGrade) return;

    setIsSavingGrade(true);
    setChatStatus("Сохраняем оценку...");

    try {
      const thread = await updateStudentWorkGrades(student.id, {
        actorRole: TEACHER_ROLE,
        targetRole: TEACHER_ROLE,
        grades: getTeacherGradePayload(student),
      });
      applyStudentStatus(student.id, thread.status ?? student.status, {
        preliminaryGrade: thread.preliminaryGrade ?? "",
        predefenseGrade: thread.predefenseGrade ?? "",
        finalGrade: thread.finalGrade ?? "",
      });
      setChatStatus("Оценка сохранена.");
      showGradeMessage();
    } catch (error) {
      setChatStatus(`Не удалось сохранить оценку: ${error.message}`);
    } finally {
      setIsSavingGrade(false);
    }
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
                      disabled={isMarkingChecked}
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

                        void persistStudentStatus(student, nextStatus);
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
                        onBlur={(e) =>
                          saveTeacherGrades({
                            ...student,
                            [gradeField.key]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            e.currentTarget.blur();
                          }
                        }}
                        placeholder="Балл"
                      />
                    </td>
                  ))}

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
                      msg.sender_role === TEACHER_ROLE ? "own" : "other"
                    }`}
                    key={msg.id}
                  >
                    <div className="teacher-message-header">
                      <span className="teacher-message-author">
                        {msg.sender_role === TEACHER_ROLE
                          ? TEACHER_NAME
                          : msg.sender_name}
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
                  className={`teacher-submit-btn ${
                    selectedStudent.status === "Проверено"
                      ? "checked"
                      : selectedStudent.status === "На проверке"
                      ? "progress"
                      : selectedStudent.status === "Требуется доработка"
                      ? "revision"
                      : "not-checked"
                  }`}
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
                            disabled={isSavingGrade}
                            onClick={() => saveTeacherGrades(selectedStudent)}
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
    
