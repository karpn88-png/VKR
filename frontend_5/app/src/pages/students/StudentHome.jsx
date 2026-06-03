import { useState } from "react";
import "./StudentHome.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import support from "../../assets/help.png";
import clip from "../../assets/clip.png";
import archive from "../../assets/archive.png";
import check from "../../assets/check.png";
import ex from "../../assets/ex.png";
import people from "../../assets/people.png";
import work from "../../assets/work.png";

import { Link } from "react-router-dom";


export default function StudentHome() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const notifications = [];

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
          onClick={() => setNotificationsOpen(true)}
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
              <div className="name">Иванов И. И.</div>
              <div className="role">Студент</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button type="button"> <Link to="/cabinet" className="nav-link">
    Личный кабинет
  </Link></button>
              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>

      <main className="hero">
        <section className="hero-left">
          <h1>Навигатор ВКР</h1>
          <div className="line"></div>
        <Link to="/work" className="continue-link">
  <button className="green-btn">
    Продолжить работу
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
    onClick={() => setNotificationsOpen(true)}
  >
    Все уведомления
  </button>
</section>

      </main>

      <section className="cards">
        <Link to="/cabinet">
  <Card
    icon={avatar}
    title="Личный кабинет"
    text="Посмотреть ваши данные и настройки системы"
  />
</Link>
        <Link to="/work" className="card-link">
  <Card
    icon={work}
    title="Моя работа"
    text="Продолжить работу над ВКР"
  />
</Link>

<Link to="/gost" className="card-link">
  <Card
    icon={ex}
    title="Шаблоны ГОСТ"
    text="Скачать актуальные шаблоны"
  />
</Link>

<Link to="/teachers" className="card-link">
  <Card
    icon={people}
    title="Преподаватели"
    text="Посмотреть информацию о преподавателях"
  />
</Link>

<Link to="/topics" className="card-link">
  <Card
    icon={check}
    title="Актуальные темы ВКР"
    text="Посмотреть актуальные темы ВКР"
  />
</Link>

<Link to="/archive" className="card-link">
  <Card
    icon={archive}
    title="Архив ВКР"
    text="Посмотреть работы выпускников прошлых лет"
  />
</Link>
      </section>

      <footer className="footer">
        <div>ⓘ <b>Важная информация</b></div>
        <span>На данный момент информация отсутствует</span>
        <Link to="/">Главная</Link>
      </footer>

      <button className="support-btn" onClick={() => setSupportOpen(true)}>
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
          <div className="modal support-modal" onClick={(e) => e.stopPropagation()}>
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
