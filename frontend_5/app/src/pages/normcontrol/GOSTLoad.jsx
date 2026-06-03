import { useEffect, useState } from "react";
import "./GOSTLoad.css";

import logo from "../../assets/logo.png";
import bell from "../../assets/bell.png";
import avatar from "../../assets/ava.png";
import clip from "../../assets/clip.png";
import support from "../../assets/help.png";

import { Link } from "react-router-dom";

const GOST_TEMPLATES_KEY = "gostTemplates";
const VISIBLE_TEMPLATES_COUNT = 5;

const defaultTemplates = [
  {
    id: 1,
    title: "Шаблон",
    description: "Шаблон титульных листов ВКР",
    fileName: "",
    fileType: "",
    fileData: "",
    createdAt: "",
  },
  {
    id: 2,
    title: "Указание к оформлению ВКР",
    description: "Требования к оформлению ВКР",
    fileName: "",
    fileType: "",
    fileData: "",
    createdAt: "",
  },
  {
    id: 3,
    title: "Выполнение, оформление и защита ВКР",
    description: "Порядок выполнения ВКР",
    fileName: "",
    fileType: "",
    fileData: "",
    createdAt: "",
  },
  {
    id: 4,
    title: "Технический регламент проверки НД аспирантов",
    description: "Регламент проверки НД",
    fileName: "",
    fileType: "",
    fileData: "",
    createdAt: "",
  },
  {
    id: 5,
    title: "Пример",
    description: "Пример оформления работы",
    fileName: "",
    fileType: "",
    fileData: "",
    createdAt: "",
  },
];

const loadTemplatesFromStorage = () => {
  const savedTemplates = localStorage.getItem(GOST_TEMPLATES_KEY);

  if (!savedTemplates) {
    return defaultTemplates;
  }

  try {
    const parsedTemplates = JSON.parse(savedTemplates);

    if (!Array.isArray(parsedTemplates)) {
      return defaultTemplates;
    }

    return parsedTemplates;
  } catch {
    return defaultTemplates;
  }
};

export default function GOSTLoad() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  const [templates, setTemplates] = useState(loadTemplatesFromStorage);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    file: null,
  });

  const [fileInputKey, setFileInputKey] = useState(0);
  const [templateStartIndex, setTemplateStartIndex] = useState(0);

  const [normprofilePhoto] = useState(() => {
    return localStorage.getItem("normProfilePhoto") || avatar;
  });

  useEffect(() => {
    localStorage.setItem(GOST_TEMPLATES_KEY, JSON.stringify(templates));
  }, [templates]);

  const visibleTemplates = templates.slice(
    templateStartIndex,
    templateStartIndex + VISIBLE_TEMPLATES_COUNT
  );

  const canGoLeft = templateStartIndex > 0;

  const canGoRight =
    templateStartIndex + VISIBLE_TEMPLATES_COUNT < templates.length;

  const selectTemplate = (id) => {
    setSelectedTemplateId((prevId) => (prevId === id ? null : id));
  };

  const goPrevTemplates = () => {
    if (!canGoLeft) return;
    setTemplateStartIndex((prev) => prev - 1);
  };

  const goNextTemplates = () => {
    if (!canGoRight) return;
    setTemplateStartIndex((prev) => prev + 1);
  };

  const deleteSelectedTemplate = () => {
    if (selectedTemplateId === null) {
      alert("Сначала выберите шаблон для удаления");
      return;
    }

    setTemplates((prevTemplates) => {
      const updatedTemplates = prevTemplates.filter(
        (item) => item.id !== selectedTemplateId
      );

      setTemplateStartIndex((prevIndex) =>
        Math.min(
          prevIndex,
          Math.max(updatedTemplates.length - VISIBLE_TEMPLATES_COUNT, 0)
        )
      );

      return updatedTemplates;
    });

    setSelectedTemplateId(null);
  };

  const resetForm = () => {
    setNewTemplate({
      title: "",
      description: "",
      file: null,
    });

    setFileInputKey((prevKey) => prevKey + 1);
  };

  const addTemplate = () => {
    if (!newTemplate.title.trim()) {
      alert("Введите название шаблона");
      return;
    }

    if (!newTemplate.file) {
      alert("Выберите файл шаблона");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const template = {
        id: Date.now(),
        title: newTemplate.title.trim(),
        description:
          newTemplate.description.trim() || "Шаблон для оформления ВКР",
        fileName: newTemplate.file.name,
        fileType: newTemplate.file.type,
        fileData: reader.result,
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };

      setTemplates((prevTemplates) => {
        const updatedTemplates = [...prevTemplates, template];

        const lastStartIndex = Math.max(
          updatedTemplates.length - VISIBLE_TEMPLATES_COUNT,
          0
        );

        setTemplateStartIndex(lastStartIndex);

        return updatedTemplates;
      });

      resetForm();
      alert("Шаблон успешно добавлен");
    };

    reader.readAsDataURL(newTemplate.file);
  };

  const downloadTemplate = (template) => {
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

      <main className="cabinet-main">
        <section className="work-panel">
          <div className="work-title-block">
            <h1>Шаблоны ГОСТ</h1>
            <p>Актуальные шаблоны и требования для оформления ВКР</p>
          </div>

          <div className="gost-wrapper">
            <div className="templates-wrapper">
              <button
                className={`arrow-btn arrow-left ${!canGoLeft ? "disabled" : ""}`}
                type="button"
                onClick={goPrevTemplates}
              >
                ◁
              </button>

              <div className="templates-list">
                {visibleTemplates.map((item) => (
                  <div
                    key={item.id}
                    className={`template-card ${
                      selectedTemplateId === item.id ? "selected" : ""
                    }`}
                    onClick={() => selectTemplate(item.id)}
                  >
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    {item.fileName && (
                      <small className="template-file-name">
                        {item.fileName}
                      </small>
                    )}

                    <button
                      className="download-btn"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTemplate(item);
                      }}
                    >
                      ⭳ Скачать
                    </button>
                  </div>
                ))}
              </div>

              <button
                className={`arrow-btn arrow-right ${!canGoRight ? "disabled" : ""}`}
                type="button"
                onClick={goNextTemplates}
              >
                ▷
              </button>

              <button
                className="delete-template-btn"
                type="button"
                onClick={deleteSelectedTemplate}
              >
                Удалить шаблон
              </button>
            </div>

            <div className="add-template-wrapper">
              <h2>Добавить шаблон</h2>

              <div className="add-template-content">
                <div className="left-form">
                  <label>
                    1. Добавить название
                    <input
                      type="text"
                      placeholder="Введите данные"
                      value={newTemplate.title}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          title: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    2. Добавить описание
                    <input
                      type="text"
                      placeholder="Введите данные"
                      value={newTemplate.description}
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          description: e.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <div className="right-form">
                  <label className="file-title">3. Загрузите файл работы</label>

                  <label className="gost-upload-box">
                    <input
                      key={fileInputKey}
                      type="file"
                      hidden
                      accept=".docx,.doc,.pdf,.rtf"
                      onChange={(e) =>
                        setNewTemplate({
                          ...newTemplate,
                          file: e.target.files?.[0] || null,
                        })
                      }
                    />

                    <img src={clip} alt="file" className="gost-upload-icon" />

                    <div className="gost-upload-text">
                      <b>Нажмите или перетащите файл в форму</b>
                      <span>Форматы: DOCX, DOC, PDF, RTF. Максимум 10 МБ</span>

                      {newTemplate.file && <small>{newTemplate.file.name}</small>}
                    </div>
                  </label>

                  <div className="form-actions">
                    <button
                      className="cancel-btn"
                      type="button"
                      onClick={resetForm}
                    >
                      Сбросить данные
                    </button>

                    <button
                      className="add-btn"
                      type="button"
                      onClick={addTemplate}
                    >
                      Добавить шаблон
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

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

      <footer className="footer">
        <div>ⓘ Важная информация</div>
        <span>На данный момент информация отсутствует</span>

      </footer>

      <button
        className="support-btn"
        type="button"
        onClick={() => setSupportOpen(true)}
      >
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
