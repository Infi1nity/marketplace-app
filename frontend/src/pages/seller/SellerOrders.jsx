import React, { useState, useEffect } from 'react';
import { sellerApi } from '../../services/seller';
import './SellerPanel.css';

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await sellerApi.getOrders();
        setOrders(res.data.items || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="seller-page"><div className="empty-state"><p>Загрузка...</p></div></div>;
  if (error) return <div className="seller-page"><div className="auth-error">{error}</div></div>;

  return (
    <div className="seller-page">
      <h1>Заказы</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <h3>Заказов пока нет</h3>
          <p>Когда покупатели закажут ваши товары, они появятся здесь</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Заказ #{order.id}</h3>
                <span className={`order-status ${order.status}`}>{order.status}</span>
              </div>
              <div className="order-meta">
                <span>Сумма: <strong>{order.total_amount.toFixed(2)} ₽</strong></span>
                <span>Адрес: {order.shipping_address}</span>
                <span>Телефон: {order.contact_phone}</span>
              </div>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Товар</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product_name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price.toFixed(2)} ₽</td>
                      <td>{(item.quantity * item.price).toFixed(2)} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;