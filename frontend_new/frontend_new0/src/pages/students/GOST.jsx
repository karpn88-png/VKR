import "./GOST.css";

function TemplateCard({ title }) {
  return (
    <div className="template-card">
      <div className="template-title">{title}</div>
      <button className="download-btn">Скачать</button>
    </div>
  );
}

export default function GOST() {
  return (
    <div className="gost-templates">
      <main className="main-content">
        <h1>Шаблоны ГОСТ</h1>
        <div className="templates-grid">
          <TemplateCard title="ГОСТ — титульный лист" />
          <TemplateCard title="ГОСТ — пояснительная записка" />
          <TemplateCard title="ГОСТ — список литературы" />
        </div>
      </main>
    </div>
  );
}
