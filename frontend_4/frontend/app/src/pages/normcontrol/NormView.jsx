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

            <button className="bell" onClick={() => setNotificationsOpen(true)}>
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
              <img src={avatar} alt="avatar" />
            </div>

            <div className="profile-text">
              <div className="name">Герасимов А. К.</div>
              <div className="role">Сотрудник нормоконтроля</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button> <Link to="/cabinet" className="nav-link">
    Личный кабинет
  </Link></button>
              <button>Выйти</button>
            </div>
          )}
        </div>
      </header>

      {/* СЕРЕДИНА */}
      <main className="cabinet-main">
  <section className="work-panel">
    <div className="work-title-block">
      <h1>Преподаватели</h1>
      <p>Информация о преподавателях</p>
    </div>

    
  </section>
</main>

      {/* Меню */}    
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
      <button className="support-btn" onClick={() => setSupportOpen(true)}>
              <img src={support} alt="поддержка" />
            </button>

      {/* МОДАЛКА С УВЕДОМЛЕНИЯМИ */}
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

      {/* МОДАЛКА С ПОДДЕРЖКОЙ */}
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
              <button className="green-btn">Отправить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
