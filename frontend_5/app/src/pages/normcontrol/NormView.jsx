import { useState } from "react";
import "./NormView.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";

import { Link } from "react-router-dom";

export default function NormView() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [teacherSearch, setTeacherSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [normprofilePhoto] = useState(() => {
    return localStorage.getItem("normProfilePhoto") || avatar;
  });

  const teachers = [
    {
      id: 1,
      fio: "Бакаев Максим Александрович",
      position: "Доцент",
      checkedWorks: 2,
      students: [
        {
          id: 1,
          fio: "Иванов Иван Иванович",
          group: "АТ-23",
          topic: "Разработка информационной системы",
          teacherStatus: "Проверено",
          normStatus: "Проверено",
        },
        {
          id: 2,
          fio: "Сидороваа Анна Петровна",
          group: "АТ-24",
          topic: "Разработка мобильного приложения",
          teacherStatus: "На проверке",
          normStatus: "На проверке",
        },
        {
          id: 3,
          fio: "Петров Алексей Дмитриевич",
          group: "АО-22",
          topic: "Разработка базы данных",
          teacherStatus: "Не проверено",
          normStatus: "Проверено",
        },
      ],
    },
    {
      id: 2,
      fio: "Тетерин Максим Михайлович",
      position: "Старший преподаватель",
      checkedWorks: 1,
      students: [
        {
          id: 1,
          fio: "Карпенко Никита Денисович",
          group: "АТ-23",
          topic: "Разработка информационной системы на основе нейросетевой модели для подготовки ВКР",
          teacherStatus: "Проверено",
          normStatus: "Проверено",
        },
        {
          id: 2,
          fio: "Филатова Виктория Сергеевна",
          group: "АТ-23",
          topic: "Разработка информационной системы для взаимодействия студентов и преподаваетелей при работе с ВКР",
          teacherStatus: "Проверено",
          normStatus: "Не проверено",
        },
      ],
    },
    
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    return (
      teacherSearch.trim() === "" ||
      teacher.fio.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.position.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  });

  const openStudentsModal = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const closeStudentsModal = () => {
    setSelectedTeacher(null);
  };

  const getStatusClass = (status) => {
  if (status === "Проверено") return "status-checked";
  if (status === "На проверке") return "status-progress";
  return "status-notchecked";
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
            <span>Личный кабинет</span>
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
              <img src={normprofilePhoto} alt="avatar" />
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

      {/* ОСНОВНОЙ БЛОК */}
      <main className="cabinet-main">
        <section className="work-panel">
          <div className="teacher-view-panel">
            <div className="teacher-view-header">
              <div className="teacher-title-block">
                <h1>Преподаватели</h1>
                <p>Список преподавателей и их нагрузка</p>
              </div>

              <div className="teacher-search">
                <input
                  type="text"
                  placeholder="Поиск преподавателя..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                />
                <span>⌕</span>
              </div>
            </div>

            <div className="teacher-table-wrapper">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>ФИО</th>
                    <th>Должность</th>
                    <th>Количество студентов</th>
                    <th>Количество проверенных работ</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeachers.map((teacher, index) => (
                    <tr key={teacher.id}>
                      <td>{index + 1}</td>
                      <td>{teacher.fio}</td>
                      <td>{teacher.position}</td>
                      <td>
                        <button
                          className="students-count-btn"
                          type="button"
                          onClick={() => openStudentsModal(teacher)}
                        >
                          {teacher.students.length}
                        </button>
                      </td>
                      <td>{teacher.checkedWorks}</td>
                    </tr>
                  ))}

                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-table-text">
                        Преподаватели не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* МЕНЮ */}
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

      {/* МОДАЛКА СТУДЕНТОВ ПРЕПОДАВАТЕЛЯ */}
      {selectedTeacher && (
        <div className="overlay" onClick={closeStudentsModal}>
          <div
            className="modal teacher-students-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="teacher-modal-close"
              type="button"
              onClick={closeStudentsModal}
            >
              ×
            </button>

            <h3>Количество студентов</h3>
            <h4>{selectedTeacher.fio}</h4>

            <p className="teacher-students-count">
              Количество студентов: <span>{selectedTeacher.students.length}</span>
            </p>

            <div className="teacher-students-table-wrapper">
              <table className="teacher-students-table">
  <thead>
    <tr>
      <th>№</th>
      <th>ФИО студента</th>
      <th>Группа</th>
      <th>Тема ВКР</th>
      <th>Статус проверки преподавателем</th>
      <th>Статус проверки нормоконтролем</th>
    </tr>
  </thead>

  <tbody>
    {selectedTeacher.students.map((student, index) => (
      <tr key={student.id}>
        <td>{index + 1}</td>

        <td>{student.fio}</td>

        <td>{student.group}</td>

        <td>{student.topic}</td>

        <td>
          <span
            className={`student-status-badge ${getStatusClass(
              student.teacherStatus
            )}`}
          >
            {student.teacherStatus}
          </span>
        </td>

        <td>
          <span
            className={`student-status-badge ${getStatusClass(
              student.normStatus
            )}`}
          >
            {student.normStatus}
          </span>
        </td>
      </tr>
    ))}
  </tbody>
</table>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛКА УВЕДОМЛЕНИЙ */}
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

      {/* МОДАЛКА ПОДДЕРЖКИ */}
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