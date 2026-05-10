import { useState } from "react";
import "./TeacherWork.css";
import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";


import { Link } from "react-router-dom";


export default function TeacherWork() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [recipientOpen, setRecipientOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const recipients = [
    { id: 1, name: "Герасимов А. К.", role: "Руководитель ВКР" },
  ];

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
            <span>Мои студенты</span>
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
              <div className="role">Преподаватель</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <button> <Link to="/teacher-cabinet" className="nav-link">
    Личный кабинет
  </Link></button>
              <button>Выйти</button>
            </div>
          )}
        </div>
      </header>

      {/* СЕРЕДИНА */}
    

      {/* Меню */}    
      <section className="nav-panel">
  <Link to="/teacher" className="nav-link">
    Главная
  </Link>
  <Link to="/teacher-cabinet" className="nav-link">
    Личный кабинет
  </Link>
  <Link to="/teacher-work" className="nav-link">
    Моя работа
  </Link>
  <Link to="/mytopic" className="nav-link">
    Мои темы ВКР
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

      {/* МОДАЛКА СДАЧИ РАБОТЫ */}

      {submitModalOpen && (
  <div className="overlay" onClick={() => setSubmitModalOpen(false)}>

    <div
      className="submit-modal"
      onClick={(e) => e.stopPropagation()}
    >

      <h2>Подтвердите сдачу работы</h2>

      <label className="submit-upload-box">

        <input type="file" hidden />

        <b>
          Перетащите или нажмите для выбора файла в эту область
        </b>

        <span>
          Поддерживаемые форматы: .docx, .doc, .pdf, .rtf
        </span>

        <img src={clip} alt="file" className="clip-icon" />

      </label>

      <p className="submit-warning">
        После отправки работы выполнение ВКР считается завершенным.
        Редактирование файла становится невозможным.
      </p>

      <div className="submit-actions">

        <button
          className="cancel-submit-btn"
          type="button"
          onClick={() => setSubmitModalOpen(false)}
        >
          Отменить действие
        </button>

        <button
          className="confirm-submit-btn"
          type="button"
          onClick={() => {
            alert("Работа успешно отправлена");
            setSubmitModalOpen(false);
          }}
        >
          Подтвердить
        </button>

      </div>
    </div>
  </div>
      )}

      {/* Выбрать получателя */}
      {recipientOpen && (
  <div className="overlay" onClick={() => setRecipientOpen(false)}>
    <div className="recipient-modal" onClick={(e) => e.stopPropagation()}>
      <h3>Выберите пользователя, которому хотите написать</h3>

      <div className="recipient-list">
        {recipients.length === 0 ? (
          <button className="empty-recipient">
            Нет доступных пользователей
          </button>
        ) : (
          recipients.map((user) => (
            <button
              key={user.id}
              className={`recipient-item ${
                selectedRecipient?.id === user.id ? "active" : ""
              }`}
              onClick={() => setSelectedRecipient(user)}
              type="button"
            >
              {user.name} — {user.role}
            </button>
          ))
        )}
      </div>

      <div className="recipient-actions">
        <button type="button" onClick={() => setRecipientOpen(false)}>
          ОТМЕНА
        </button>

        <button
          type="button"
          className="add-recipient-btn"
          onClick={() => setRecipientOpen(false)}
        >
          Добавить получателя
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
