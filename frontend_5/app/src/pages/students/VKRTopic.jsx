import { useState } from "react";
import "./VKRTopic.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import support from "../../assets/help.png";
import clip from "../../assets/clip.png";

import { Link } from "react-router-dom";

const initialTopics = [
  {
    id: 1,
    teacher: "Бакаев Максим Александрович",
    department: "Доцент",
    subjectArea: "кандитат технических наук",
    description:
      "Пользовательские интерфесы, Методы искусственного интелекта, Мышление и поведение пользователей, Сбор и анализ данных",
    status: "Не занята",
  },
  {
    id: 2,
    teacher: "Тетерин Максим Михайлович",
    department: "Старший преподаватель",
    subjectArea: "-",
    description:
      "Разработка репозитория для хранения ВКР",
    status: "Занята",
  },
 
];

export default function VKRTopics() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    teacher: "",
    department: "",
    status: "",
    subjectArea: "",
  });

  const [activeFilters, setActiveFilters] = useState({
    teacher: "",
    department: "",
    status: "",
    subjectArea: "",
  });

  const [topics] = useState(initialTopics);

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
      teacher: "",
      department: "",
      status: "",
      subjectArea: "",
    };

    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setSearchQuery("");
  };

  const filteredTopics = topics.filter((topic) => {
    const query = normalize(searchQuery);

    const matchesSearch =
      !query ||
      normalize(topic.teacher).includes(query) ||
      normalize(topic.department).includes(query) ||
      normalize(topic.subjectArea).includes(query) ||
      normalize(topic.description).includes(query) ||
      normalize(topic.status).includes(query);

    const matchesFilters =
      (!activeFilters.teacher ||
        normalize(topic.teacher).includes(normalize(activeFilters.teacher))) &&
      (!activeFilters.department ||
        normalize(topic.department).includes(normalize(activeFilters.department))) &&
      (!activeFilters.status ||
        normalize(topic.status).includes(normalize(activeFilters.status))) &&
      (!activeFilters.subjectArea ||
        normalize(topic.subjectArea).includes(
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
            <span>Актуальные темы ВКР</span>
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
        <section className="topics-panel">
          <div className="topics-header">
            <div>
              <h1>Актуальные темы ВКР</h1>
              <p>Список актуальных тем выпускных квалификационных работ</p>
            </div>

            <div className="topics-search">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск"
              />
              <span>⌕</span>
            </div>
          </div>

          <div className="topics-layout">
            <div className="topics-table-wrapper">
              <table className="topics-table">
                <thead>
                  <tr>
                    <th>ФИО преподавателя</th>
                    <th>Должность</th>
                    <th>Ученая степень</th>
                    <th>Тематика</th>
                    <th>Статус</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTopics.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="topics-empty">
                        Темы по выбранным параметрам не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredTopics.map((topic) => (
                      <tr key={topic.id}>
                        <td>{topic.teacher}</td>
                        <td>{topic.department}</td>
                        <td>{topic.subjectArea}</td>
                        <td>{topic.description}</td>
                        <td>
                          <span
                            className={`topic-status ${
                              topic.status === "Занята"
                                ? "busy"
                                : "available"
                            }`}
                          >
                            {topic.status}
                          </span>
                        </td>
                      
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <aside className="topics-filters">
              <div className="topics-filters-title">
                <h2>Фильтры</h2>
              </div>

              <label>Фамилия преподавателя</label>
              <input
                value={filters.teacher}
                onChange={(e) => updateFilter("teacher", e.target.value)}
                placeholder="Введите фамилию преподавателя"
              />

              <label>Название темы</label>
              <input
                value={filters.department}
                onChange={(e) => updateFilter("title", e.target.value)}
                placeholder="Введите название темы"
              />

              <label>Статус темы</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value)}
              >
                <option value="">Все статусы</option>
                <option value="Не занята">Не занята</option>
                <option value="Занята">Занята</option>
              </select>

              <label>Сфера деятельности</label>
              <input
                value={filters.subjectArea}
                onChange={(e) =>
                  updateFilter("subjectArea", e.target.value)
                }
                placeholder="Введите сферу деятельности"
              />

              <div className="topics-filter-actions">
                <button
                  type="button"
                  className="topics-reset-btn"
                  onClick={resetFilters}
                >
                  Сбросить
                </button>

                <button
                  type="button"
                  className="topics-apply-btn"
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
