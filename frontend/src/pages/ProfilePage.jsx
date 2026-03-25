import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-not-authenticated">
          <h2>Для просмотра профиля необходимо войти</h2>
          <p>Войдите в аккаунт или зарегистрируйтесь, чтобы получить доступ к профилю</p>
          <div className="auth-buttons">
            <Link to="/login" className="btn-primary">Войти</Link>
            <Link to="/register" className="btn-secondary">Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1>Личный кабинет</h1>
      
      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-username">
            <h3>{user?.username}</h3>
            <p className="user-email">{user?.email}</p>
          </div>
          <nav className="profile-nav">
            <Link to="/orders" className="nav-item">
              📦 Мои заказы
            </Link>
            <Link to="/favorites" className="nav-item">
              ❤️ Избранное
            </Link>
            <Link to="/cart" className="nav-item">
              🛒 Корзина
            </Link>
          </nav>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Информация о профиле</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Имя пользователя</span>
                <span className="info-value">{user?.username}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'Не указан'}</span>
              </div>
              {user?.phone && (
                <div className="info-item">
                  <span className="info-label">Телефон</span>
                  <span className="info-value">{user.phone}</span>
                </div>
              )}
              {user?.created_at && (
                <div className="info-item">
                  <span className="info-label">Дата регистрации</span>
                  <span className="info-value">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-section">
            <h2>Быстрые действия</h2>
            <div className="quick-actions">
              <Link to="/orders" className="action-card">
                <span className="action-icon">📦</span>
                <span className="action-title">Мои заказы</span>
                <span className="action-desc">История заказов и отслеживание</span>
              </Link>
              <Link to="/favorites" className="action-card">
                <span className="action-icon">❤️</span>
                <span className="action-title">Избранное</span>
                <span className="action-desc">Сохранённые товары</span>
              </Link>
              <Link to="/cart" className="action-card">
                <span className="action-icon">🛒</span>
                <span className="action-title">Корзина</span>
                <span className="action-desc">Товары к покупке</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
