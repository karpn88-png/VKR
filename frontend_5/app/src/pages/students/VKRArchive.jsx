import { useState } from "react";
import "./VKRArchive.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";

import { Link } from "react-router-dom";

const archiveYears = [
  {
    value: "2025",
    label: "2025",
    subtitle: "XX работ",
  },
  {
    value: "2024",
    label: "2024",
    subtitle: "XX работ",
  },
  {
    value: "2023",
    label: "2023",
    subtitle: "XX работ",
  },
  {
    value: "2022",
    label: "2022",
    subtitle: "XX работ",
  },
  {
    value: "2021",
    label: "2021",
    subtitle: "XX работ",
  },
];

const archiveDirections = [
  {
    code: "09.03.02 (Б)",
    name: "Информационные системы и технологии",
  },
  {
    code: "12.03.04 (Б)",
    name: "Биотехнические системы и технологии",
  },
  {
    code: "15.03.06 (Б)",
    name: "Мехатроника и робототехника",
  },
  {
    code: "09.04.01 (М)",
    name: "Информатика и вычислительная техника",
  },
  {
    code: "12.04.04 (М)",
    name: "Биотехнические системы и технологии",
  },
];

const archiveWorks = [
  {
    id: 1,
    year: "2024",
    direction: "09.03.02 (Б)",
    level: "Бакалавриат",
    title:
      "Разработка информационной системы для взаимодействия студентов и преподавателей при работе с ВКР",
    student: "Щеткин Олег Петрович",
    supervisor: "Бакаев Максим Александрович",
    subjectArea: "Информационные системы",
    keywords: ["Python", "Java"],
    description:
      "В работе рассматривается разработка информационной системы для сопровождения процесса обработки больших данных.",
  },
  {
    id: 2,
    year: "2025",
    direction: "12.03.04 (Б)",
    level: "Бакалавриат",
    title: "Разработка информационной системы для медицинской реабилитации пациентов после ишемического инсульта ",
    student: "Багрова Анна Владимировна",
    supervisor: "Квашнина Елена Анатольевна",
    subjectArea: "Информатика и вычислительная техника",
    keywords: ["Java", "Docker", "PostgreSQL", "информационная система"],
    description:
      "Разработка веб-приложения для медицинской реабилитации пациентов после ишемического инсульта, предоставляющего сбор анамнеза, дифференциальной диагностики типа инсульта, определения алгоритма внутривенного ТЛТ и инициальной антитромботической терапии, оценки состояния по специализированной шкале NIHSS и формирование персонализированной программы реабилитации. ",
  },
  {
    id: 3,
    year: "2022",
    direction: "09.03.02 (Б)",
    level: "Бакалавриат",
    title: "Проектирование базы данных системы учета заявок",
    student: "Смирнова Анастасия  Валерьевна",
    supervisor: "Тетерин Максим Михайлович",
    subjectArea: "Базы данных",
    keywords: ["БД", "SQL", "база данных"],
    description:
      "Выполнено проектирование структуры базы данных и пользовательского интерфейса для системы учета заявок.",
  },
  {
    id: 4,
    year: "2023",
    direction: "12.04.04 (М)",
    level: "Бакалавриат",
    title: "Разработка личного кабинета студента в образовательной системе",
    student: "Орлова Екатерина Дмитриевна",
    supervisor: "Герасимов Антон Константинович",
    subjectArea: "Пользовательский интерфейс для офисного приложения",
    keywords: ["UI"],
    description:
      "В работе реализован личный кабинет сотрудника компании с возможностью просмотра данных, статусов и взаимодействия с другими сотрудниками.",
  },
  {
    id: 5,
    year: "2023",
    direction: "12.03.04 (Б)",
    level: "Бакалавриат",
    title: "Разработка модуля мониторинга медицинских показателей",
    student: "Павлов Александр Валерьевич",
    supervisor: "Герасимов Антон Константинович",
    subjectArea: "Медицинские информационные системы",
    keywords: ["мониторинг", "медицина"],
    description:
      "Работа направлена на создание программного модуля для отслеживания и анализа медицинских показателей пользователя.",
  },
  {
    id: 6,
    year: "2024",
    direction: "15.03.06 (Б)",
    level: "Бакалавриат",
    title: "Система управления роботизированным устройством",
    student: "Николаев Степан Игоревич",
    supervisor: "Козин Алексей Викторович",
    subjectArea: "Робототехника",
    keywords: ["робот", "управление", "MathLab"],
    description:
      "В работе реализован программный модуль управления роботизированным устройством с использованием датчиков обратной связи.",
  },
  {
    id: 7,
    year: "2023",
    direction: "09.04.01 (М)",
    level: "Магистратура",
    title: "Методы анализа пользовательских данных в информационных системах",
    student: "Орлова Евгения Викторовна",
    supervisor: "Бакаев Максим Александрович",
    subjectArea: "Анализ данных",
    keywords: ["аналитика", "данные"],
    description:
      "Исследованы методы анализа пользовательских данных и предложен подход к их применению в информационных системах.",
  },
  {
    id: 8,
    year: "2022",
    direction: "09.03.02 (Б)",
    level: "Бакалавриат",
    title: "Информационная система учета оборудования организации",
    student: "Морозов Александр Григорьевич",
    supervisor: "Тетерин Максим Михайлович",
    subjectArea: "Учет оборудования",
    keywords: ["учет", "Java", "SQLite"],
    description:
      "Разработана информационная система для учета оборудования, контроля состояния и формирования отчетности.",
  },
  {
    id: 9,
    year: "2021",
    direction: "15.03.06 (Б)",
    level: "Бакалавриат",
    title: "Разработка системы визуализации технических параметров",
    student: "Егорова Полина Сергеевна",
    supervisor: "Воронов Виталий Владимирович",
    subjectArea: "Визуализация данных",
    keywords: ["визуализация", "SQL"],
    description:
      "Работа посвящена разработке интерфейса визуализации технических параметров и контролю изменений в реальном времени.",
  },
];

export default function VKRArchive() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDirection, setSelectedDirection] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [filters, setFilters] = useState({
    year: "",
    level: "",
    direction: "",
    student: "",
    supervisor: "",
    title: "",
    subjectArea: "",
    keyword: "",
  });

  const [activeFilters, setActiveFilters] = useState({
    year: "",
    level: "",
    direction: "",
    student: "",
    supervisor: "",
    title: "",
    subjectArea: "",
    keyword: "",
  });

  const [visibleCount, setVisibleCount] = useState(3);
  const [selectedWork, setSelectedWork] = useState(null);

  const [profilePhoto] = useState(() => {
    return localStorage.getItem("ProfilePhoto") || avatar;
  });

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    setActiveFilters(filters);
    setVisibleCount(3);
  };

  const resetFilters = () => {
    const emptyFilters = {
      year: "",
      level: "",
      direction: "",
      student: "",
      supervisor: "",
      title: "",
      subjectArea: "",
      keyword: "",
    };

    setFilters(emptyFilters);
    setActiveFilters(emptyFilters);
    setSelectedYear("");
    setSelectedDirection("");
    setSearchQuery("");
    setVisibleCount(3);
  };

  const normalize = (value) => {
    return String(value || "").toLowerCase().trim();
  };

  const filteredWorks = archiveWorks.filter((work) => {
    const query = normalize(searchQuery);

    const matchesMainSelection =
      (!selectedYear || work.year === selectedYear) &&
      (!selectedDirection || work.direction === selectedDirection);

    const matchesSearch =
      !query ||
      normalize(work.title).includes(query) ||
      normalize(work.student).includes(query) ||
      normalize(work.supervisor).includes(query) ||
      normalize(work.subjectArea).includes(query) ||
      work.keywords.some((keyword) => normalize(keyword).includes(query));

    const matchesFilters =
      (!activeFilters.year || work.year === activeFilters.year) &&
      (!activeFilters.level ||
        normalize(work.level).includes(normalize(activeFilters.level))) &&
      (!activeFilters.direction ||
        normalize(work.direction).includes(normalize(activeFilters.direction))) &&
      (!activeFilters.student ||
        normalize(work.student).includes(normalize(activeFilters.student))) &&
      (!activeFilters.supervisor ||
        normalize(work.supervisor).includes(
          normalize(activeFilters.supervisor)
        )) &&
      (!activeFilters.title ||
        normalize(work.title).includes(normalize(activeFilters.title))) &&
      (!activeFilters.subjectArea ||
        normalize(work.subjectArea).includes(
          normalize(activeFilters.subjectArea)
        )) &&
      (!activeFilters.keyword ||
        work.keywords.some((keyword) =>
          normalize(keyword).includes(normalize(activeFilters.keyword))
        ));

    return matchesMainSelection && matchesSearch && matchesFilters;
  });

  const visibleWorks = filteredWorks.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredWorks.length;

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
            <span>Архив ВКР</span>
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

      {/* СЕРЕДИНА */}
      <main className="cabinet-main">
        <section className="archive-panel">
          <div className="archive-header">
            <div>
              <h1>Архив ВКР</h1>
              <p>
                Хранилище завершенных выпускных квалификационных работ за
                последние 5 лет
              </p>
            </div>

            <div className="archive-search">
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(3);
                }}
                placeholder="Поиск"
              />

              <span>⌕</span>
            </div>
          </div>

          <div className="archive-layout">
            <div className="archive-main">
              <div className="archive-years-row">
                <span className="archive-row-label">Выберите год</span>

                <div className="archive-year-buttons">
                  {archiveYears.map((year) => (
                    <button
                      key={year.value}
                      type="button"
                      className={`archive-year-btn ${
                        selectedYear === year.value ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedYear(year.value);
                        setVisibleCount(3);
                      }}
                    >
                      <b>{year.label}</b>
                      <span>{year.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="archive-directions-row">
                <span className="archive-row-label">Выберите направление</span>

                <div className="archive-direction-buttons">
                  {archiveDirections.map((direction) => (
                    <button
                      key={direction.code}
                      type="button"
                      className={`archive-direction-btn ${
                        selectedDirection === direction.code ? "active" : ""
                      }`}
                      onClick={() => {
                        setSelectedDirection(direction.code);
                        setVisibleCount(3);
                      }}
                    >
                      <b>{direction.code}</b>
                      <span>{direction.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="archive-works-grid">
                {visibleWorks.length === 0 ? (
                  <div className="archive-empty">
                    По выбранным параметрам работы не найдены
                  </div>
                ) : (
                  visibleWorks.map((work) => (
                    <article className="archive-work-card" key={work.id}>
                      <div className="archive-card-top">
                        <span>{work.year}</span>
                        <span>{work.direction}</span>
                      </div>

                      <h3>{work.title}</h3>

                      <div className="archive-work-meta">
                        <div>
                          <b>Студент:</b>
                          <span>{work.student}</span>
                        </div>

                        <div>
                          <b>Научный руководитель:</b>
                          <span>{work.supervisor}</span>
                        </div>

                        <div>
                          <b>Область:</b>
                          <span>{work.subjectArea}</span>
                        </div>
                      </div>

                      <div className="archive-card-section">
  <b className="archive-card-label">Ключевые слова:</b>

  <div className="archive-keywords">
    {work.keywords.map((keyword) => (
      <span key={keyword}>{keyword}</span>
    ))}
  </div>
</div>

<div className="archive-card-section archive-description-section">
  <b className="archive-card-label">Описание:</b>

  <p>{work.description}</p>
</div>

                      <button
                        type="button"
                        className="archive-view-btn"
                        onClick={() => setSelectedWork(work)}
                      >
                        Смотреть работу
                      </button>
                    </article>
                  ))
                )}
              </div>

              {canLoadMore && (
                <button
                  type="button"
                  className="archive-show-more-btn"
                  onClick={() => setVisibleCount((prev) => prev + 3)}
                >
                  Смотреть еще
                </button>
              )}
            </div>

            <aside className="archive-filters">
              <div className="archive-filters-title">
                <h2>Фильтры</h2>
              </div>

              <select
                value={filters.year}
                onChange={(e) => updateFilter("year", e.target.value)}
              >
                <option value="">Выберите год</option>
                {archiveYears.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>

              <select
                value={filters.level}
                onChange={(e) => updateFilter("level", e.target.value)}
              >
                <option value="">Выберите уровень обучения</option>
                <option value="Бакалавриат">Бакалавриат</option>
                <option value="Магистратура">Магистратура</option>
              </select>

              <select
                value={filters.direction}
                onChange={(e) => updateFilter("direction", e.target.value)}
              >
                <option value="">Выберите направление обучения</option>
                {archiveDirections.map((direction) => (
                  <option key={direction.code} value={direction.code}>
                    {direction.code}
                  </option>
                ))}
              </select>

              <input
                value={filters.student}
                onChange={(e) => updateFilter("student", e.target.value)}
                placeholder="Введите фамилию студента"
              />

              <input
                value={filters.supervisor}
                onChange={(e) => updateFilter("supervisor", e.target.value)}
                placeholder="Введите фамилию преподавателя"
              />

              <input
                value={filters.title}
                onChange={(e) => updateFilter("title", e.target.value)}
                placeholder="Введите название темы"
              />

              <input
                value={filters.subjectArea}
                onChange={(e) => updateFilter("subjectArea", e.target.value)}
                placeholder="Введите область исследования"
              />

              <input
                value={filters.keyword}
                onChange={(e) => updateFilter("keyword", e.target.value)}
                placeholder="Введите ключевое слово"
              />

              <div className="archive-filter-actions">
                <button
                  type="button"
                  className="archive-reset-btn"
                  onClick={resetFilters}
                >
                  Сбросить
                </button>

                <button
                  type="button"
                  className="archive-apply-btn"
                  onClick={applyFilters}
                >
                  Применить фильтр
                </button>
              </div>

              <div className="archive-found">
                <b>Найдено:</b>
                <span>
                  {filteredWorks.length > 0
                    ? `${filteredWorks.length} работ`
                    : "Совпадений не найдено"}
                </span>
              </div>
            </aside>
          </div>
        </section>
      </main>

      {/* Меню */}
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

      {/* ПРОСМОТР РАБОТЫ */}
      {selectedWork && (
        <div className="overlay" onClick={() => setSelectedWork(null)}>
          <div
            className="modal archive-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="archive-modal-close"
              type="button"
              onClick={() => setSelectedWork(null)}
            >
              ×
            </button>

            <h2>{selectedWork.title}</h2>

            <div className="archive-modal-info">
              <div>
                <b>Год:</b>
                <span>{selectedWork.year}</span>
              </div>

              <div>
                <b>Направление:</b>
                <span>{selectedWork.direction}</span>
              </div>

              <div>
                <b>Студент:</b>
                <span>{selectedWork.student}</span>
              </div>

              <div>
                <b>Научный руководитель:</b>
                <span>{selectedWork.supervisor}</span>
              </div>

              <div>
                <b>Предметная область:</b>
                <span>{selectedWork.subjectArea}</span>
              </div>
            </div>

            <p>{selectedWork.description}</p>

            <div className="archive-modal-keywords">
              {selectedWork.keywords.map((keyword) => (
                <span key={keyword}>{keyword}</span>
              ))}
            </div>

            <button type="button" className="archive-download-work-btn">
              Скачать работу
            </button>
          </div>
        </div>
      )}

      {/* МОДАЛКА С ПОДДЕРЖКОЙ */}
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