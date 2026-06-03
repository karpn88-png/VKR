import { useState } from "react";
import "./Teachers.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import teterin from "../../assets/teacher_photo.png";
import bakaev from "../../assets/Bakaev.png";

import { Link } from "react-router-dom";

const teachersData = [
  {
    id: 1,
    photo: bakaev,
    surname: "Бакаев",
    name: "Максим",
    patronymic: "Александрович",
    fullName: "Бакаев Максим Александрович",
    position: "Заведующий кафедрой, доцент",
    degree: "кандидат технических наук",
    subjectArea:
      "Биоинформатика и машинное обучение, взаимодействие в человеко-компьютерных системах, информатика, информационные технологии, машинное обучение, моделирование биотехнических систем, научно-исследовательский семинар, программирование, телемедицинские системы, технологии компьютерного зрения",
    schedule:
      "На кафедре ССОД: вторник - пятница с 13:00 до 14:00. Консультация студентов: четверг с 14:00 до 15:00",
    room: "7-809",
    phone: "(383) 346-11-00",
    email: "bakaev@corp.nstu.ru",
    site: "https://www.researchgate.net/profile/Maxim_Bakaev",
    additional:
      "Руководитель научно-образовательного центра “Центр международного ИТ-сотрудничества”",
    topics:
      "Пользовательские интерфейсы, методы искусственного интеллекта, мышление и поведение пользователей, сбор и анализ данных",
  },
  {
    id: 2,
    photo: teterin,
    surname: "Тетерин",
    name: "Максим",
    patronymic: "Михайлович",
    fullName: "Тетерин Максим Михайлович",
    position: "Старший преподаватель",
    degree: "-",
    subjectArea:
      "Архитектура вычислительных систем,Информационные технологии и основы программирования, Компьютерная графика, Метрология, Микроконтроллеры и микропроцессоры, Моделирование процессов и систем, Программирование, Производственная практика: преддипломная практика (научно-исследовательская работа), Производственная практика: преддипломная практика по получению профессиональных умений и опыта профессиональной деятельности, Робототехнические системы и комплексы, Схемотехника, Теория алгоритмов",
    schedule:
      "-",
    room: "7-511",
    phone: "-",
    email: "m.teterin@corp.nstu.ru",
    site: "",
    additional:
      "-",
    topics:
      "Разработка репозитория для хранения ВКР",
  },
  
];

export default function Teachers() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [filters, setFilters] = useState({
    surname: "",
    name: "",
    patronymic: "",
    position: "",
    degree: "",
    subjectArea: "",
  });

  const [activeFilters, setActiveFilters] = useState({
    surname: "",
    name: "",
    patronymic: "",
    position: "",
    degree: "",
    subjectArea: "",
  });

  const [profilePhoto] = useState(() => {
    return localStorage.getItem("ProfilePhoto") || avatar;
  });

  const normalize = (value) => String(value || "").toLowerCase().trim();

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setActiveFilters(filters);
  };

  const resetFilters = () => {
    const emptyFilters = {
      surname: "",
      name: "",
      patronymic: "",
      position: "",
      degree: "",
      subjectArea: "",
    };

    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setSearchQuery("");
  };

  const filteredTeachers = teachersData.filter((teacher) => {
    const query = normalize(searchQuery);

    const matchesSearch =
      !query ||
      normalize(teacher.fullName).includes(query) ||
      normalize(teacher.position).includes(query) ||
      normalize(teacher.degree).includes(query) ||
      normalize(teacher.subjectArea).includes(query);

    const matchesFilters =
      (!activeFilters.surname ||
        normalize(teacher.surname).includes(normalize(activeFilters.surname))) &&
      (!activeFilters.name ||
        normalize(teacher.name).includes(normalize(activeFilters.name))) &&
      (!activeFilters.patronymic ||
        normalize(teacher.patronymic).includes(
          normalize(activeFilters.patronymic)
        )) &&
      (!activeFilters.position ||
        normalize(teacher.position).includes(
          normalize(activeFilters.position)
        )) &&
      (!activeFilters.degree ||
        normalize(teacher.degree).includes(normalize(activeFilters.degree))) &&
      (!activeFilters.subjectArea ||
        normalize(teacher.subjectArea).includes(
          normalize(activeFilters.subjectArea)
        ));

    return matchesSearch && matchesFilters;
  });

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
            <span>Преподаватели</span>
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
              <div className="name">Иванов И. И.</div>
              <div className="role">Студент</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/cabinet" className="profile-menu-link">
                Личный кабинет
              </Link>

              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>

      {/* ОСНОВНОЙ БЛОК */}
      <main className="cabinet-main">
        <section className="teachers-panel">
          <div className="teachers-header">
  <div>
    <h1>Преподаватели</h1>
    <p>Информация о преподавателях кафедры ССОД</p>
  </div>

  <div className="teachers-header-right">
    <div className="teachers-search">
      <input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Поиск преподавателя..."
      />
      <span>⌕</span>
    </div>

    <div className="teachers-note">
      Только старший преподаватель, доцент и профессор могут быть вашими
      научными руководителями!
    </div>
  </div>
</div>

          <div className="teachers-layout">
            <div className="teachers-table-wrapper">
              <table className="teachers-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>ФИО</th>
                    <th>Должность</th>
                    <th>Предметная область</th>
                    <th>Узнать больше</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="teachers-empty">
                        Преподаватели по выбранным параметрам не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((teacher, index) => (
                      <tr key={teacher.id}>
                        <td>{index + 1}</td>
                        <td>{teacher.fullName}</td>
                        <td>{teacher.position}</td>
                        <td>{teacher.subjectArea}</td>
                        <td>
                          <button
                            type="button"
                            className="teacher-more-btn"
                            onClick={() => setSelectedTeacher(teacher)}
                          >
                            Узнать
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <aside className="teachers-filters">
              <div className="teachers-filters-title">
                <h2>Фильтры</h2>
              </div>

              <label>Фамилия</label>
              <input
                value={filters.surname}
                onChange={(e) => updateFilter("surname", e.target.value)}
                placeholder="Введите ФИО"
              />

              <label>Имя</label>
              <input
                value={filters.name}
                onChange={(e) => updateFilter("name", e.target.value)}
                placeholder="Введите имя"
              />

              <label>Отчество</label>
              <input
                value={filters.patronymic}
                onChange={(e) => updateFilter("patronymic", e.target.value)}
                placeholder="Введите отчество"
              />

              <label>Должность</label>
              <input
                value={filters.position}
                onChange={(e) => updateFilter("position", e.target.value)}
                placeholder="Введите должность"
              />

              <label>Ученая степень</label>
              <input
                value={filters.degree}
                onChange={(e) => updateFilter("degree", e.target.value)}
                placeholder="Введите ученую степень"
              />

              <label>Предметная область</label>
              <input
                value={filters.subjectArea}
                onChange={(e) => updateFilter("subjectArea", e.target.value)}
                placeholder="Введите предметную область"
              />

              <div className="teachers-filter-actions">
                <button
                  type="button"
                  className="teachers-reset-btn"
                  onClick={resetFilters}
                >
                  Сбросить
                </button>

                <button
                  type="button"
                  className="teachers-apply-btn"
                  onClick={applyFilters}
                >
                  Применить фильтр
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* НАВИГАЦИЯ */}
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

        <Link to="/gost" className="nav-link">
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

      {/* УВЕДОМЛЕНИЯ */}
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

      {/* МОДАЛКА ПРЕПОДАВАТЕЛЯ */}
      {selectedTeacher && (
        <div className="teacher-modal-overlay">
          <div className="teacher-modal">
            <button
              type="button"
              className="teacher-modal-close"
              onClick={() => setSelectedTeacher(null)}
            >
              ×
            </button>

            <div className="teacher-modal-top">
              <div className="teacher-photo">
  <img
    src={selectedTeacher.photo || avatar}
    alt={selectedTeacher.fullName}
    onError={(e) => {
      e.currentTarget.src = avatar;
    }}
  />
</div>

              <div>
                <h2>{selectedTeacher.fullName}</h2>
                <p>{selectedTeacher.position}</p>
                <p>{selectedTeacher.degree}</p>
              </div>
            </div>

            <div className="teacher-modal-info">
              <div className="teacher-info-row">
                <b>Сфера деятельности:</b>
                <span>{selectedTeacher.subjectArea}</span>
              </div>

              <div className="teacher-info-row">
                <b>График работы:</b>
                <span>{selectedTeacher.schedule}</span>
              </div>

              <div className="teacher-info-row">
                <b>Номер кабинета:</b>
                <span>{selectedTeacher.room}</span>
              </div>

              <h3>Контактные данные</h3>

              <div className="teacher-info-row">
                <b>Телефон:</b>
                <span>{selectedTeacher.phone}</span>
              </div>

              <div className="teacher-info-row">
                <b>Почта:</b>
                <span>{selectedTeacher.email}</span>
              </div>

              <div className="teacher-info-row">
                <b>Сайт:</b>
                <a href={selectedTeacher.site} target="_blank" rel="noreferrer">
                  {selectedTeacher.site}
                </a>
              </div>

              <div className="teacher-info-row">
                <b>Дополнительная информация:</b>
                <span>{selectedTeacher.additional}</span>
              </div>

              <div className="teacher-info-row">
                <b>Темы ВКР:</b>
                <span>{selectedTeacher.topics}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ПОДДЕРЖКА */}
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