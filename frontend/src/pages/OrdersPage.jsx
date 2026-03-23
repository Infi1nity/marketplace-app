// frontend/src/pages/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { useOrders } from '../contexts/OrdersContext';
import { useAuth } from '../contexts/AuthContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './OrdersPage.css';

function OrdersPage() {
  const { orders, loading, pagination, loadOrders, cancelOrder } = useOrders();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders(currentPage, pagination.size);
    }
  }, [isAuthenticated, currentPage]);

  if (!isAuthenticated) {
    return (
      <div className="orders-auth-required">
        <h2>Войдите в аккаунт</h2>
        <p>Чтобы просмотреть историю заказов, войдите или зарегистрируйтесь</p>
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Войти</Link>
          <Link to="/register" className="register-btn">Зарегистрироваться</Link>
        </div>
      </div>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-empty">
        <h2>У вас пока нет заказов</h2>
        <p>Перейдите в каталог, чтобы сделать первый заказ</p>
        <Link to="/products" className="continue-shopping-btn">
          Перейти к товарам
        </Link>
      </div>
    );
  }

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Вы уверены, что хотите отменить этот заказ?')) return;
    
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
    } catch (error) {
      alert(error.response?.data?.detail || 'Ошибка при отмене заказа');
    } finally {
      setCancellingId(null);
    }
  };

  const totalPages = pagination.pages;

  return (
    <div className="orders-page">
      <h1>Мои заказы</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-id">Заказ №{order.id}</span>
                <span className="order-date">
                  {new Date(order.created_at).toLocaleDateString('ru-RU')}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
              <div className="order-actions">
                <Link to={`/orders/${order.id}`} className="view-details-btn">
                  Подробнее
                </Link>
                {order.status === 'pending' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={cancellingId === order.id}
                    className="cancel-order-btn"
                  >
                    {cancellingId === order.id ? 'Отмена...' : 'Отменить'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="order-items">
              {order.items?.slice(0, 3).map(item => (
                <div key={item.id} className="order-item">
                  <span className="item-name">{item.product?.name}</span>
                  <span className="item-quantity">×{item.quantity}</span>
                  <span className="item-price">{item.price.toLocaleString('ru-RU')} ₽</span>
                </div>
              ))}
              {order.items?.length > 3 && (
                <div className="order-more">
                  и ещё {order.items.length - 3} товаров...
                </div>
              )}
            </div>
            
            <div className="order-footer">
              <span className="order-total">
                Сумма: {order.total_amount.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            ← Предыдущая
          </button>
          <span>Страница {currentPage} из {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Следующая →
          </button>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;