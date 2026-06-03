import "./Header.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";

import { Link } from "react-router-dom";

export default function Header({
  notifications,
  setNotificationsOpen,
  setShowAllNotifications,
  profileOpen,
  setProfileOpen,
}) {
  return (
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

        <span>
          {notifications.filter((item) => item.unread).length}
        </span>
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

            <Link to="/cabinet" className="nav-link">
              Личный кабинет
            </Link>

            <button type="button">
              Выйти
            </button>

          </div>
        )}
      </div>

    </header>
  );
}