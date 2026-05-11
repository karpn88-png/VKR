import { Link } from "react-router-dom";
import "./VKRTopic.css";

export default function VKRTopic() {
  return (
    <div className="empty-page">

      <div className="empty-content">
        <div className="empty-text">
          На данной странице пока нет информации
        </div>

        <Link to="/" className="back-btn">
          Вернуться на главную
        </Link>
      </div>

    </div>
  );
}