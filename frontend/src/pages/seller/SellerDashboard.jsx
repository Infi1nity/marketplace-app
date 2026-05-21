import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { sellerApi } from '../../services/seller';
import './SellerPanel.css';

function SellerDashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await sellerApi.getDashboard();
        setDashboard(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="seller-page"><div className="empty-state"><p>Загрузка...</p></div></div>;
  if (error) return <div className="seller-page"><div className="auth-error">{error}</div></div>;

  return (
    <div className="seller-page">
      <div className="shop-info">
        <div>
          <h2>{dashboard.shop_name || user?.username || 'Мой магазин'}</h2>
          {dashboard.is_verified_seller && <span className="verified-badge">Проверен</span>}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Товары</h3>
          <p className="stat-value">{dashboard.total_products}</p>
          <p className="stat-sub">{dashboard.active_products} активных</p>
        </div>
        <div className="stat-card">
          <h3>Заказы</h3>
          <p className="stat-value">{dashboard.total_orders}</p>
          <p className="stat-sub">{dashboard.pending_orders} ожидают</p>
        </div>
        <div className="stat-card">
          <h3>Выручка</h3>
          <p className="stat-value">{dashboard.total_revenue.toFixed(2)} ₽</p>
        </div>
      </div>

      <div className="actions-grid">
        <Link to="/seller/products" className="action-card">
          <span className="action-title">Управление товарами</span>
          <span className="action-desc">Добавляйте, редактируйте и управляйте товарами</span>
        </Link>
        <Link to="/seller/orders" className="action-card">
          <span className="action-title">Заказы</span>
          <span className="action-desc">Просматривайте входящие заказы</span>
        </Link>
        <Link to="/seller/profile" className="action-card">
          <span className="action-title">Настройки магазина</span>
          <span className="action-desc">Измените название, описание и контакты</span>
        </Link>
      </div>
    </div>
  );
}

export default SellerDashboard;