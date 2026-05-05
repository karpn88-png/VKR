import "./GOSTTemplates.css";

function TemplateCard({ title, onClick }) {
  return (
    <div className="template-card">
      <div className="template-title">{title}</div>
      <button onClick={onClick} className="download-btn">Скачать</button>
    </div>
  );
}

export default function GOSTTemplates() {
  return (
    <div className="gost-templates">
      <header className="header">
        <div className="logo">
          <div className="logo-box">N</div>
          <div>
            <b>Навигатор ВКР</b>
            <span>Шаблоны ГОСТ</span>
          </div>
        </div>
        <div className="search">
          <input placeholder="Искать шаблон..." />
          <span>⌕</span>
        </div>
        <div className="profile">
          <div className="avatar">◎</div>
          <div>
            <b>Иванов И. И.</b>
            <span>Студент</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        <h1>Шаблоны ГОСТ</h1>
        <div className="templates-grid">
          <TemplateCard title="Название ГОСТ 1" onClick={() => alert("Скачивание ГОСТ 1")} />
          <TemplateCard title="Название ГОСТ 2" onClick={() => alert("Скачивание ГОСТ 2")} />
          <TemplateCard title="Название ГОСТ 3" onClick={() => alert("Скачивание ГОСТ 3")} />
          <TemplateCard title="Название ГОСТ 4" onClick={() => alert("Скачивание ГОСТ 4")} />
        </div>
      </main>

      <footer className="footer">
        <div>ⓘ Важная информация</div>
        <span>На данный момент информация отсутствует</span>
      </footer>
    </div>
  );
}