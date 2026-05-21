import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { adminApi } from '../../services/admin';

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      setDashboard(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Загрузка...</div>;
  if (!dashboard) return <div className="error-message">Ошибка загрузки</div>;

  return (
    <div className="admin-page">
      <h1>Панель администратора</h1>
      <div className="dashboard-grid">
        <div className="stat-card"><h3>Пользователи</h3><p className="stat-value">{dashboard.total_users}</p><p className="stat-sub">Продавцов: {dashboard.total_sellers}</p></div>
        <div className="stat-card"><h3>Товары</h3><p className="stat-value">{dashboard.total_products}</p></div>
        <div className="stat-card"><h3>Заказы</h3><p className="stat-value">{dashboard.total_orders}</p></div>
        <div className="stat-card"><h3>Выручка</h3><p className="stat-value">{dashboard.total_revenue.toFixed(2)} ₽</p></div>
      </div>
      <div className="actions-grid">
        <Link to="/admin/users" className="action-card"><span className="action-title">Пользователи</span><span className="action-desc">Управление пользователями и ролями</span></Link>
        <Link to="/admin/products" className="action-card"><span className="action-title">Товары</span><span className="action-desc">Модерация товаров</span></Link>
        <Link to="/admin/orders" className="action-card"><span className="action-title">Заказы</span><span className="action-desc">Все заказы</span></Link>
        <Link to="/admin/categories" className="action-card"><span className="action-title">Категории</span><span className="action-desc">Управление категориями</span></Link>
      </div>
    </div>
  );
}

export default AdminDashboard;