// frontend/src/pages/OrderDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useOrders } from '../contexts/OrdersContext';
import OrderStatusBadge from '../components/OrderStatusBadge';
import './OrderDetailPage.css';

function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { loadOrderDetails, cancelOrder } = useOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await loadOrderDetails(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Заказ не найден');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!confirm('Вы уверены, что хотите отменить этот заказ?')) return;
    
    setCancelling(true);
    try {
      await cancelOrder(orderId);
      // Обновляем данные после отмены
      const updated = await loadOrderDetails(orderId);
      setOrder(updated);
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при отмене заказа');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner"></div>
        <p>Загрузка заказа...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/orders')}>Вернуться к заказам</button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="order-detail-page">
      <button className="back-button" onClick={() => navigate('/orders')}>
        ← Назад к заказам
      </button>
      
      <div className="order-detail-header">
        <h1>Заказ №{order.id}</h1>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="order-detail-info">
        <div className="info-section">
          <h3>Информация о заказе</h3>
          <p><strong>Дата:</strong> {new Date(order.created_at).toLocaleString('ru-RU')}</p>
          <p><strong>Адрес доставки:</strong> {order.shipping_address}</p>
          <p><strong>Телефон:</strong> {order.contact_phone}</p>
        </div>
        
        <div className="info-section">
          <h3>Состав заказа</h3>
          <div className="order-items-table">
            <div className="items-header">
              <span>Товар</span>
              <span>Кол-во</span>
              <span>Цена</span>
              <span>Сумма</span>
            </div>
            {order.items?.map(item => (
              <div key={item.id} className="items-row">
                <span className="item-name">
                  <Link to={`/products/${item.product?.slug}`}>
                    {item.product?.name || `Товар #${item.product_id}`}
                  </Link>
                </span>
                <span className="item-quantity">{item.quantity}</span>
                <span className="item-price">{item.price.toLocaleString('ru-RU')} ₽</span>
                <span className="item-total">
                  {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="order-total-section">
          <span>Итого:</span>
          <span className="total-amount">{order.total_amount.toLocaleString('ru-RU')} ₽</span>
        </div>
        
        {order.status === 'pending' && (
          <button 
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="cancel-order-btn-large"
          >
            {cancelling ? 'Отмена...' : 'Отменить заказ'}
          </button>
        )}
      </div>
    </div>
  );
}

export default OrderDetailPage;