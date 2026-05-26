import { Link } from "react-router-dom";
import "./MyVKRTopic.css";

export default function MyVKRTopic() {
  return (
    <div className="empty-page">

      <div className="empty-content">
        <div className="empty-text">
          На данной странице пока нет информации
        </div>

        <Link to="/teacher" className="back-btn">
          Вернуться на главную
        </Link>
      </div>

    </div>
  );
}

