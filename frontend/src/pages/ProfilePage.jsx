import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import './ProfilePage.css';

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-page">
        <div className="profile-not-auth">
          <div className="profile-not-auth-icon">👤</div>
          <h2>Войдите в аккаунт</h2>
          <p>Для просмотра профиля необходимо войти в систему</p>
          <div className="profile-auth-buttons">
            <Link to="/login" className="brutal-btn primary">ВОЙТИ</Link>
            <Link to="/register" className="brutal-btn secondary">РЕГИСТРАЦИЯ</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Личный кабинет</h1>
      </div>
      
      <div className="profile-container">
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>
          <div className="profile-user-info">
            <h3 className="profile-username">{user?.username}</h3>
            <p className="profile-email">{user?.email}</p>
          </div>
          
          <div className="profile-menu">
            <Link to="/orders" className="profile-menu-item">
              <span className="menu-icon">📦</span>
              <span>Мои заказы</span>
            </Link>
            <Link to="/favorites" className="profile-menu-item">
              <span className="menu-icon">⭐</span>
              <span>Избранное</span>
            </Link>
            <Link to="/cart" className="profile-menu-item">
              <span className="menu-icon">🛒</span>
              <span>Корзина</span>
            </Link>
          </div>

          <button onClick={handleLogout} className="logout-btn">
            ВЫЙТИ
          </button>
        </aside>

        <main className="profile-content">
          <section className="profile-section">
            <h2 className="section-title">
              <span className="section-icon">👤</span>
              Информация о профиле
            </h2>
            <div className="info-grid">
              <div className="info-card">
                <span className="info-label">Имя пользователя</span>
                <span className="info-value">{user?.username}</span>
              </div>
              <div className="info-card">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'Не указан'}</span>
              </div>
              {user?.phone && (
                <div className="info-card">
                  <span className="info-label">Телефон</span>
                  <span className="info-value">{user.phone}</span>
                </div>
              )}
              {user?.created_at && (
                <div className="info-card">
                  <span className="info-label">Дата регистрации</span>
                  <span className="info-value">
                    {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className="profile-section">
            <h2 className="section-title">
              <span className="section-icon">⚡</span>
              Быстрые действия
            </h2>
            <div className="actions-grid">
              <Link to="/orders" className="action-card">
                <span className="action-icon">📦</span>
                <span className="action-title">Мои заказы</span>
                <span className="action-desc">История заказов</span>
              </Link>
              <Link to="/favorites" className="action-card">
                <span className="action-icon">⭐</span>
                <span className="action-title">Избранное</span>
                <span className="action-desc">Сохранённые товары</span>
              </Link>
              <Link to="/cart" className="action-card">
                <span className="action-icon">🛒</span>
                <span className="action-title">Корзина</span>
                <span className="action-desc">К покупке</span>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
