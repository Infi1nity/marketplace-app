import React from 'react';
import { Link, useNavigate } from 'react-router';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">⚠️</div>
        
        <div className="not-found-code">404</div>
        
        <h1 className="not-found-title">Страница не найдена</h1>
        
        <p className="not-found-text">
          Запрашиваемая страница не существует<br />
          или была перемещена
        </p>
        
        <div className="not-found-actions">
          <Link to="/" className="brutal-btn primary">
            ← НА ГЛАВНУЮ
          </Link>
          <button 
            onClick={() => navigate(-1)} 
            className="brutal-btn secondary"
          >
            НАЗАД
          </button>
        </div>
      </div>
      
      <div className="not-found-decoration">
        <div className="deco-line"></div>
        <span className="ghost">👻</span>
        <div className="deco-line"></div>
      </div>
    </div>
  );
}
