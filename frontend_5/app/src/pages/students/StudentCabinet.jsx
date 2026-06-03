import { useState } from "react";
import "./StudentCabinet.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import edit from "../../assets/edit.png";

import { Link } from "react-router-dom";

export default function StudentCabinet() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const userRole = "student";
  const isAdmin = userRole === "admin";

  const initialCabinetData = {
    surname: "",
    name: "",
    patronymic: "",

    direction: "",
    directionName: "",
    educationLevel: "",
    group: "",

    email: "",
    phone: "",
    additionalContact: "",
  };

  const [cabinetData, setCabinetData] = useState(initialCabinetData);

  const [contactDraft, setContactDraft] = useState({
    email: initialCabinetData.email,
    phone: initialCabinetData.phone,
    additionalContact: initialCabinetData.additionalContact,
  });

  const [isContactEditing, setIsContactEditing] = useState(false);

  const updateCabinetData = (field, value) => {
    setCabinetData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateContactDraft = (field, value) => {
    setContactDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const startContactEditing = () => {
    setContactDraft({
      email: cabinetData.email,
      phone: cabinetData.phone,
      additionalContact: cabinetData.additionalContact,
    });

    setIsContactEditing(true);
  };

  const cancelContactEditing = () => {
    setContactDraft({
      email: cabinetData.email,
      phone: cabinetData.phone,
      additionalContact: cabinetData.additionalContact,
    });

    setIsContactEditing(false);
  };

  const saveContactEditing = () => {
    setCabinetData((prev) => ({
      ...prev,
      email: contactDraft.email,
      phone: contactDraft.phone,
      additionalContact: contactDraft.additionalContact,
    }));

    setIsContactEditing(false);
    alert("Контактные данные сохранены");
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
              <img src={avatar} alt="avatar" />
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
  <section className="cabinet-panel">
  <div className="cabinet-top-row">
    <div className="cabinet-title-block">
      <h1>Личный кабинет</h1>
      <p>Ваши данные и контактная информация</p>
    </div>

    <div className="work-info cabinet-work-info">
      <div>
        <b>Тема ВКР:</b>
        <span>Разработка информационной системы для взаимодействия студентов и преподавателей при работе с ВКР</span>
      </div>

      <div>
        <b>Руководитель ВКР:</b>
        <span>Тетерин Максим Михайлович</span>
      </div>
    </div>
  </div>

    <div className="cabinet-grid">
      {/* Персональные данные */}
      <section className="cabinet-card personal-card">
        <h2>Персональные данные</h2>

        <label>Фамилия</label>
        <input
          value={cabinetData.surname}
          placeholder="Иванов"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("surname", e.target.value)}
        />

        <label>Имя</label>
        <input
          value={cabinetData.name}
          placeholder="Иван"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("name", e.target.value)}
        />

        <label>Отчество</label>
        <input
          value={cabinetData.patronymic}
          placeholder="Иванович"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("patronymic", e.target.value)}
        />

        <div className="admin-note">
  ⓘ <strong>Персональные данные</strong> и{" "}
  <strong>Сведения об образовании</strong> студента редактируются
  администратором системы. Для изменения этих данных обратитесь в
  техническую поддержку.
</div>
      </section>

      {/* Сведения об образовании */}
      <section className="cabinet-card education-card">
        <h2>Сведения об образовании</h2>

        <label>Направление обучения</label>
        <input
          value={cabinetData.direction}
          placeholder="09.03.02"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("direction", e.target.value)}
        />

        <label>Название направления обучения</label>
        <input
          value={cabinetData.directionName}
          placeholder="Информационные системы и технологии"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("directionName", e.target.value)}
        />

        <label>Уровень образования</label>
        <input
          value={cabinetData.educationLevel}
          placeholder="Бакалавриат"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("educationLevel", e.target.value)}
        />

        <label>Номер группы</label>
        <input
          value={cabinetData.group}
          placeholder="АТ-23"
          disabled={!isAdmin}
          onChange={(e) => updateCabinetData("group", e.target.value)}
        />
      </section>

      {/* Контактные данные */}
      <section className="cabinet-card contact-card">
        <h2>Контактные данные</h2>

        <label>Электронная почта</label>
        <input
          value={isContactEditing ? contactDraft.email : cabinetData.email}
          placeholder="ivan0v_004@mail.ru"
          disabled={!isContactEditing}
          onChange={(e) => updateContactDraft("email", e.target.value)}
        />

        <label>Телефон</label>
        <input
          value={isContactEditing ? contactDraft.phone : cabinetData.phone}
          placeholder="Введите данные"
          disabled={!isContactEditing}
          onChange={(e) => updateContactDraft("phone", e.target.value)}
        />

        <label>Дополнительный контакт</label>
        <input
          value={
            isContactEditing
              ? contactDraft.additionalContact
              : cabinetData.additionalContact
          }
          placeholder="Введите данные"
          disabled={!isContactEditing}
          onChange={(e) =>
            updateContactDraft("additionalContact", e.target.value)
          }
        />

        <div className="contact-buttons-row">
          {!isContactEditing ? (
            <button
  type="button"
  className="contact-edit-btn"
  onClick={startContactEditing}
>
  <img src={edit} alt="edit" className="edit-icon" />
  Редактировать данные
</button>
          ) : (
            <>
              <button
                type="button"
                className="contact-cancel-btn"
                onClick={cancelContactEditing}
              >
                Отменить
              </button>

              <button
                type="button"
                className="contact-save-btn"
                onClick={saveContactEditing}
              >
                Сохранить
              </button>
            </>
          )}
        </div>
      </section>
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

        <Link to="/templates" className="nav-link">
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