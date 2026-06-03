    import { useState } from "react";
import "./GOST.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";

import { Link } from "react-router-dom";

const GOST_TEMPLATES_KEY = "gostTemplates";

function getSavedTemplates() {
  const savedTemplates = localStorage.getItem(GOST_TEMPLATES_KEY);

  if (!savedTemplates) {
    return [];
  }

  try {
    return JSON.parse(savedTemplates);
  } catch {
    return [];
  }
}

export default function GOST() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [templates] = useState(getSavedTemplates);

  const [profilePhoto] = useState(() => {
    return localStorage.getItem("ProfilePhoto") || avatar;
  });

  const handleDownloadTemplate = (template) => {
    if (!template.fileData) {
      alert("Файл для этого шаблона еще не загружен");
      return;
    }

    const link = document.createElement("a");
    link.href = template.fileData;
    link.download = template.fileName || template.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <span>Шаблоны ГОСТ</span>
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
        <section className="work-panel">
          <div className="work-top-row">
            <div className="work-title-block">
              <h1>Шаблоны ГОСТ</h1>
              <p>
                Здесь собраны шаблоны, материалы и требования для оформления выпускной квалификационной работы.
              </p>
            </div>

          
          </div>

          <div className="gost-templates-grid">
            {templates.length === 0 ? (
              <div className="gost-empty-card">
                <h3>Шаблоны пока не загружены</h3>
                <p>
                  Материалы появятся после того, как сотрудник нормоконтроля
                  загрузит их в своём личном кабинете.
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <article className="gost-template-card" key={template.id}>
                  <div className="gost-template-icon">📄</div>

                  <div className="gost-template-content">
                    <h3>{template.title}</h3>

                    <p>
                      {template.description ||
                        "Шаблон для оформления выпускной квалификационной работы."}
                    </p>

                    {template.fileName ? (
                      <span>{template.fileName}</span>
                    ) : (
                      <span className="no-file">Файл не загружен</span>
                    )}

                    {template.createdAt && (
                      <small>Загружено: {template.createdAt}</small>
                    )}
                  </div>

                  <button
                    type="button"
                    className="gost-download-btn"
                    onClick={() => handleDownloadTemplate(template)}
                  >
                    Скачать
                  </button>
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      {/* МЕНЮ */}
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

      {/* ТЕХНИЧЕСКАЯ ПОДДЕРЖКА */}
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

    
