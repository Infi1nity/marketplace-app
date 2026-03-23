// frontend/src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-icon">🔍</div>
      <div className="error-code">404</div>
      <h1 className="not-found-title">Страница не найдена</h1>
      <p className="not-found-description">
        Извините, запрашиваемая страница не существует или была перемещена.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="home-btn">
          🏠 На главную
        </Link>
        <button onClick={() => window.history.back()} className="back-btn">
          ← Назад
        </button>
      </div>
      <div className="not-found-decoration">
        <span className="ghost">👻</span>
      </div>
    </div>
  );
}
