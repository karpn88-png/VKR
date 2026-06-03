import { useState } from "react";
import "./NormCabinet.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import edit from "../../assets/edit.png";
import photo from "../../assets/photo.png";

import { Link } from "react-router-dom";

export default function NormCabinet() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [isProfileEditing, setIsProfileEditing] = useState(false);
  
  const [normprofilePhoto, setProfilePhoto] = useState(() => {
  return localStorage.getItem("normProfilePhoto") || avatar;
});

const handlePhotoChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    const photoData = reader.result;

    setProfilePhoto(photoData);
    localStorage.setItem("normProfilePhoto", photoData);
  };

  reader.readAsDataURL(file);
};

  const [profileData, setProfileData] = useState({
    surname: "",
    name: "",
    patronymic: "",
    workSchedule: "",
    cabinetNumber: "",

    email: "",
    phone: "",
    additionalContact: "",
    website: "",
    additionalInfo: "",

    vkLink: "",
    maxLink: "",

    notifyEmail: false,
    notifyVk: false,
    notifyMax: false,
  });

  const handleProfileChange = (field, value) => {
    setProfileData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };


  const saveProfileData = () => {
    setIsProfileEditing(false);
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
              <img src={normprofilePhoto} alt="avatar" />
            </div>

            <div className="profile-text">
              <div className="name">Герасимов А. К.</div>
              <div className="role">Сотрудник нормоконтроля</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/reviewer-cabinet">Личный кабинет</Link>
              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>



      {/* ОСНОВНОЙ БЛОК */}
      <main className="cabinet-main">
        <section className="work-panel">
          <div className="work-title-block">
            <h1>Личный кабинет</h1>
            <p>Ваши данные и настройки системы</p>
          </div>

          <div className="norm-cabinet-card">
            {/* ПЕРСОНАЛЬНЫЕ ДАННЫЕ */}
            <div className="norm-cabinet-column personal-column">
              <h2>Персональные данные</h2>

              <div className="personal-content">
                <div className="photo-wrapper">
                  <div className="photo-circle">
                    <img src={normprofilePhoto} alt="Фото пользователя" />
                  </div>

                  <label className="photo-upload-btn" title="Загрузить фото">
                    <img src={photo} alt="file" className="clip-icon" />
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handlePhotoChange}
                    />
                  </label>
                </div>

                <div className="profile-fields">
                  <label className="profile-field">
                    Фамилия
                    <input
                      type="text"
                      placeholder="Герасимов"
                      value={profileData.surname}
                      readOnly={!isProfileEditing}
                      onChange={(e) =>
                        handleProfileChange("surname", e.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    Имя
                    <input
                      type="text"
                      placeholder="Антон"
                      value={profileData.name}
                      readOnly={!isProfileEditing}
                      onChange={(e) =>
                        handleProfileChange("name", e.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    Отчество
                    <input
                      type="text"
                      placeholder="Константинович"
                      value={profileData.patronymic}
                      readOnly={!isProfileEditing}
                      onChange={(e) =>
                        handleProfileChange("patronymic", e.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    График работы
                    <input
                      type="text"
                      placeholder="Введите данные"
                      value={profileData.workSchedule}
                      readOnly={!isProfileEditing}
                      onChange={(e) =>
                        handleProfileChange("workSchedule", e.target.value)
                      }
                    />
                  </label>

                  <label className="profile-field">
                    Номер кабинета
                    <input
                      type="text"
                      placeholder="7-511"
                      value={profileData.cabinetNumber}
                      readOnly={!isProfileEditing}
                      onChange={(e) =>
                        handleProfileChange("cabinetNumber", e.target.value)
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* КОНТАКТНЫЕ ДАННЫЕ */}
            <div className="norm-cabinet-column contact-column">
              <h2>Контактные данные</h2>

              <label className="profile-field">
                Электронная почта
                <input
                  type="email"
                  placeholder="a.gerasimov.2016@stud.nstu.ru"
                  value={profileData.email}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("email", e.target.value)
                  }
                />
              </label>

              <label className="profile-field">
                Телефон
                <input
                  type="text"
                  placeholder="346-08-46"
                  value={profileData.phone}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("phone", e.target.value)
                  }
                />
              </label>

              <label className="profile-field">
                Дополнительный контакт
                <input
                  type="text"
                  placeholder="346-08-55"
                  value={profileData.additionalContact}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("additionalContact", e.target.value)
                  }
                />
              </label>

              <label className="profile-field">
                Сайт
                <input
                  type="text"
                  placeholder="Введите данные"
                  value={profileData.website}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("website", e.target.value)
                  }
                />
              </label>

              <label className="profile-field">
                Дополнительная информация
                <input
                  type="text"
                  placeholder="Введите данные"
                  value={profileData.additionalInfo}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("additionalInfo", e.target.value)
                  }
                />
              </label>
            </div>

            {/* НАСТРОЙКА УВЕДОМЛЕНИЙ */}
            <div className="norm-cabinet-column notification-column">
              <h2>Настройка уведомлений</h2>

              <label className="profile-field">
                Ссылка на ВКонтакте
                <input
                  type="text"
                  placeholder="@gerasim_com"
                  value={profileData.vkLink}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("vkLink", e.target.value)
                  }
                />
              </label>

              <label className="profile-field">
                Ссылка на Max
                <input
                  type="text"
                  placeholder="Введите данные"
                  value={profileData.maxLink}
                  readOnly={!isProfileEditing}
                  onChange={(e) =>
                    handleProfileChange("maxLink", e.target.value)
                  }
                />
              </label>

              <div className="notification-settings-box">
                <p>Отправить уведомление</p>

                <label className="notification-row">
                  <span>Почта</span>

                  <input
                    type="checkbox"
                    checked={profileData.notifyEmail}
                    onChange={(e) =>
                      handleProfileChange("notifyEmail", e.target.checked)
                    }
                  />

                  <span className="switch-slider"></span>
                </label>

                <label className="notification-row">
                  <span>ВК</span>

                  <input
                    type="checkbox"
                    checked={profileData.notifyVk}
                    onChange={(e) =>
                      handleProfileChange("notifyVk", e.target.checked)
                    }
                  />

                  <span className="switch-slider"></span>
                </label>

                <label className="notification-row">
                  <span>Max</span>

                  <input
                    type="checkbox"
                    checked={profileData.notifyMax}
                    onChange={(e) =>
                      handleProfileChange("notifyMax", e.target.checked)
                    }
                  />

                  <span className="switch-slider"></span>
                </label>
              </div>

              <div className="cabinet-actions">
                <button
                  className="edit-profile-btn"
                  type="button"
                  onClick={() => setIsProfileEditing(true)}
                >
                <img src={edit} alt="file" className="edit-icon" />
                 Редактировать данные
                </button>

                <button
                  className="save-profile-btn"
                  type="button"
                  onClick={saveProfileData}
                >
                  Сохранить
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

            {/* МЕНЮ */}
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
      <button
        className="support-btn"
        type="button"
        onClick={() => setSupportOpen(true)}
      >
        <img src={support} alt="поддержка" />
      </button>

      {/* МОДАЛКА С УВЕДОМЛЕНИЯМИ */}
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