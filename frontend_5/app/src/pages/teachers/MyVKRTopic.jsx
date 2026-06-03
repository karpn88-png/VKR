        import { Fragment, useState } from "react";
import { Link } from "react-router-dom";
import "./MyVKRTopic.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";
import edit from "../../assets/edit.png";
import teacher from "../../assets/teacher_photo.png";

const initialForm = {
  title: "",
  area: "",
  description: "",
  status: "Не занята",
};

const statusOptions = ["Не занята", "Занята"];

export default function MyVKRTopic() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [teacherProfilePhoto] = useState(() => {
    return localStorage.getItem("teacherProfilePhoto") || teacher;
  });

  const [topics, setTopics] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingTopicId, setEditingTopicId] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);

  const [topicToDeleteId, setTopicToDeleteId] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  const addTopic = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.area.trim()) {
      return;
    }

    const newTopic = {
      id: Date.now(),
      title: form.title.trim(),
      area: form.area.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    setTopics((prev) => [...prev, newTopic]);
    resetForm();
  };

  const changeTopicStatus = (topicId, status) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              status,
            }
          : topic
      )
    );
  };

  const startEditTopic = (topic) => {
    setEditingTopicId(topic.id);
    setEditForm({
      title: topic.title,
      area: topic.area,
      description: topic.description,
      status: topic.status,
    });
    setTopicToDeleteId(null);
  };

  const saveEditTopic = (topicId) => {
    if (!editForm.title.trim() || !editForm.area.trim()) {
      return;
    }

    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              title: editForm.title.trim(),
              area: editForm.area.trim(),
              description: editForm.description.trim(),
              status: editForm.status,
            }
          : topic
      )
    );

    setEditingTopicId(null);
    setEditForm(initialForm);
  };

  const openDeleteForm = (topicId) => {
    setTopicToDeleteId(topicId);
  };

  const cancelDelete = () => {
    setTopicToDeleteId(null);
  };

  const confirmDelete = () => {
    if (!topicToDeleteId) {
      return;
    }

    setTopics((prev) => prev.filter((topic) => topic.id !== topicToDeleteId));

    if (editingTopicId === topicToDeleteId) {
      setEditingTopicId(null);
      setEditForm(initialForm);
    }

    setTopicToDeleteId(null);
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

        <button className="bell" type="button" onClick={() => setNotificationsOpen(true)}>
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
              <img src={teacherProfilePhoto} alt="teacher" />
            </div>

            <div className="profile-text">
              <div className="name">Тетерин М. М.</div>
              <div className="role">Преподаватель</div>
            </div>
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link to="/teacher-cabinet">Личный кабинет</Link>
              <button type="button">Выйти</button>
            </div>
          )}
        </div>
      </header>

      {/* ОСНОВНАЯ ЧАСТЬ */}
      <main className="cabinet-main">
        <section className="work-panel">
          <div className="work-title-block">
            <h1>Мои темы для ВКР</h1>
            <p>
              Предложить студентам тематику для написания выпускных квалификационных работ
            </p>
          </div>

          <div className="my-topics-content">
            <div className={`topics-list-block ${topics.length > 0 ? "has-topics" : ""}`}>
              {topics.length === 0 ? (
                <div className="topics-empty-text">Нет добавленных тем</div>
              ) : (
                <div className="topics-table-wrapper">
                  <table className="topics-table">
                    <thead>
                      <tr>
                        <th className="topic-number-cell">N</th>
                        <th>Название темы</th>
                        <th>Предметная область</th>
                        <th>Описание</th>
                        <th>Статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>

                    <tbody>
                      {topics.map((topic, index) => {
                        const isEditingTopic = editingTopicId === topic.id;
                        const isDeletingTopic = topicToDeleteId === topic.id;

                        return (
                          <Fragment key={topic.id}>
                            <tr key={topic.id}>
                              <td className="topic-number-cell">{index + 1}</td>

                              <td>
                                {isEditingTopic ? (
                                  <input
                                    className="topic-table-input"
                                    type="text"
                                    value={editForm.title}
                                    onChange={(event) =>
                                      handleEditChange("title", event.target.value)
                                    }
                                  />
                                ) : (
                                  topic.title
                                )}
                              </td>

                              <td>
                                {isEditingTopic ? (
                                  <input
                                    className="topic-table-input"
                                    type="text"
                                    value={editForm.area}
                                    onChange={(event) =>
                                      handleEditChange("area", event.target.value)
                                    }
                                  />
                                ) : (
                                  topic.area
                                )}
                              </td>

                              <td>
                                {isEditingTopic ? (
                                  <textarea
                                    className="topic-table-textarea"
                                    value={editForm.description}
                                    onChange={(event) =>
                                      handleEditChange("description", event.target.value)
                                    }
                                  />
                                ) : (
                                  topic.description
                                )}
                              </td>

                              <td>
                                <select
                                  className="topic-status-select"
                                  value={isEditingTopic ? editForm.status : topic.status}
                                  onChange={(event) => {
                                    if (isEditingTopic) {
                                      handleEditChange("status", event.target.value);
                                    } else {
                                      changeTopicStatus(topic.id, event.target.value);
                                    }
                                  }}
                                >
                                  {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                      {status}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              <td>
                                <div className="topic-actions-cell">
                                  {isEditingTopic ? (
                                    <button
                                      type="button"
                                      className="topic-edit-btn topic-save-btn"
                                      onClick={() => saveEditTopic(topic.id)}
                                    >
                                      Сохранить
                                    </button>
                                  ) : (
                                    <button
  type="button"
  className="topic-edit-btn"
  onClick={() => startEditTopic(topic)}
>
  <img src={edit} alt="" className="topic-edit-icon" />
  Редактировать
</button>
                                  )}

                                  <button
                                    type="button"
                                    className="topic-delete-btn"
                                    onClick={() => openDeleteForm(topic.id)}
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {isDeletingTopic && (
                              <tr key={`delete-${topic.id}`}>
                                <td colSpan="6" className="delete-topic-cell">
                                  <div className="delete-topic-modal">
                                    <p>
                                      Вы действительно хотите
                                      <br />
                                      удалить тему?
                                    </p>

                                    <div className="delete-topic-actions">
                                      <button
                                        type="button"
                                        className="delete-cancel-btn"
                                        onClick={cancelDelete}
                                      >
                                        Отменить
                                      </button>

                                      <button
                                        type="button"
                                        className="delete-confirm-btn"
                                        onClick={confirmDelete}
                                      >
                                        Подтвердить
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <form className="topic-add-form" onSubmit={addTopic}>
  <h2>Добавление новой тематики для написания ВКР</h2>

  <label className="topic-form-field">
    <span className="topic-label-text">
      Название темы <span className="required-star">*</span>
    </span>

    <input
      type="text"
      placeholder="Введите название темы"
      value={form.title}
      onChange={(event) => handleChange("title", event.target.value)}
    />
  </label>

  <label className="topic-form-field">
    <span className="topic-label-text">
      Предметная область <span className="required-star">*</span>
    </span>

    <input
      type="text"
      placeholder="Введите предметную область"
      value={form.area}
      onChange={(event) => handleChange("area", event.target.value)}
    />
  </label>

  <label className="topic-form-field">
    <span className="topic-label-text">Описание темы</span>

    <textarea
      placeholder="Введите описание темы"
      value={form.description}
      onChange={(event) => handleChange("description", event.target.value)}
    />
  </label>

  <label className="topic-form-field">
    <span className="topic-label-text">Статус</span>

    <select
      value={form.status}
      onChange={(event) => handleChange("status", event.target.value)}
    >
      {statusOptions.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  </label>

  <div className="topic-form-note">
    <span>ⓘ</span>
    <p>
      Тема станет доступна студентам после сохранения. Для сохранения темы
      должны быть заполнены все обязательные поля.
    </p>
  </div>

  <div className="topic-form-actions">
    <button
      type="button"
      className="topic-reset-btn"
      onClick={resetForm}
    >
      Сбросить данные
    </button>

    <button type="submit" className="topic-add-btn">
      Добавить тему
    </button>
  </div>
</form>
          </div>
        </section>
      </main>

      {/* МЕНЮ */}
      <section className="nav-panel">
        <Link to="/teacher" className="nav-link">
          Главная
        </Link>
        <Link to="/teacher-cabinet" className="nav-link">
          Личный кабинет
        </Link>
        <Link to="/teacher-work" className="nav-link">
          Мои студенты
        </Link>
        <Link to="/mytopic" className="nav-link">
          Мои темы для ВКР
        </Link>
      </section>

      {/* ФУТЕР */}
      <footer className="footer">
        <div>ⓘ Важная информация</div>
        <span>На данный момент информация отсутствует</span>
      </footer>

      {/* КНОПКА ПОДДЕРЖКИ */}
      <button className="support-btn" type="button" onClick={() => setSupportOpen(true)}>
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
          <div className="modal support-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Техническая поддержка</h3>

            <label>Форма обратной связи</label>
            <textarea placeholder="Опишите подробно, что произошло" />

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

    

    
