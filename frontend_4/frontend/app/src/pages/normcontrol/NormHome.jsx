import { useState } from "react";
import "./NormHome.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import support from "../../assets/help.png";
import clip from "../../assets/clip.png";
import people from "../../assets/people.png";
import teachers from "../../assets/teachers.png";
import ex from "../../assets/ex.png";

import { Link } from "react-router-dom";

export default function NormHome() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const notifications = [];

  const visibleNotifications = showAllNotifications
    ? notifications
    : notifications.filter((item) => item.unread);

  return (
    <div className="page">
      <header className="header">
        <div className="logo">
          <div className="logo-box">
            <img src={logo} alt="Логотип" />
          </div>

          <div>
            <b>Навигатор ВКР</b>
            <span>Главная страница</span>
          </div>
        </div>

        <button
          className="bell"
          type="button"
          onClick={() => {
            setNotificationsOpen(true);
            setShowAllNotifications(false);
          }}
        >
          <img src={bell} alt="Уведомления" />
          <span>{notifications.filter((item) => item.unread).length}</span>
        </button>

        <div className="profile-wrapper">
          <button
            className="profile"
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className="avatar">
              <img src={avatar} alt="Аватар" />
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

      <main className="hero">
        <section className="hero-left">
          <h1>Навигатор ВКР</h1>
          <div className="line"></div>

          <Link to="/reviewer-work" className="continue-link">
            <button className="green-btn" type="button">
              Проверить работы
            </button>
          </Link>
        </section>

        <section className="building"></section>

        <section className="notifications">
          <h2>Уведомления</h2>

          <p className="no-notification">
            Нет новых уведомлений
          </p>

          <button
            className="all-link"
            type="button"
            onClick={() => {
              setNotificationsOpen(true);
              setShowAllNotifications(true);
            }}
          >
            Все уведомления
          </button>
        </section>
      </main>

      <section className="cards">
        <Link to="/reviewer-cabinet" className="card-link">
          <Card
            icon={avatar}
            title="Личный кабинет"
            text="Посмотреть ваши данные и настройки системы"
          />
        </Link>

        <Link to="/reviewer-work" className="card-link">
          <Card
            icon={people}
            title="Cтуденты"
            text="Проверить работы студентов"
          />
        </Link>

        <Link to="/reviewer-view" className="card-link">
          <Card
            icon={teachers}
            title="Преподаватели"
            text="Посмотреть информацию о преподавателях"
          />
        </Link>

        <Link to="/GOSTLoad" className="card-link">
          <Card
            icon={ex}
            title="Шаблоны ГОСТ"
            text="Добавить актуальные шаблоны и требования для оформления ВКР"
          />
        </Link>
      </section>

      <footer className="footer">
        <div>ⓘ <b>Важная информация</b></div>
        <span>На данный момент информация отсутствует</span>
        <Link to="/teacher">Главная</Link>
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

            {visibleNotifications.length === 0 ? (
              <p className="empty-text">Нет новых уведомлений</p>
            ) : (
              visibleNotifications.map((item, index) => (
                <div
                  key={index}
                  className={`notification-item ${
                    item.unread ? "unread" : ""
                  }`}
                >
                  <b>{item.text}</b>
                  <span>{item.time}</span>
                </div>
              ))
            )}

            {!showAllNotifications && (
              <button
                className="all-link"
                type="button"
                onClick={() => setShowAllNotifications(true)}
              >
                Все уведомления
              </button>
            )}
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

function Card({ icon, title, text }) {
  return (
    <div className="card">
      <img src={icon} alt="" className="card-icon" />

      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}