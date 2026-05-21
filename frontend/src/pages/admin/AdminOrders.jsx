import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/admin';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getOrders({ status_filter: statusFilter || undefined, limit: 50 });
      setOrders(res.data.items || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки');
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <h1>Все заказы</h1>
      {error && <div className="auth-error">{error}</div>}
      <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); }} style={{ marginBottom: 16, padding: 8 }}>
        <option value="">Все статусы</option>
        <option value="pending">Ожидает</option>
        <option value="processing">В обработке</option>
        <option value="shipped">Отправлен</option>
        <option value="delivered">Доставлен</option>
        <option value="cancelled">Отменён</option>
      </select>
      <button onClick={fetchOrders} className="auth-btn" style={{ marginLeft: 8 }}>Фильтр</button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>ID заказа</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Пользователь</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Статус</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Сумма</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Дата</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: 8 }}>#{o.id}</td>
              <td style={{ padding: 8 }}>#{o.user_id}</td>
              <td style={{ padding: 8 }}>{o.status}</td>
              <td style={{ padding: 8 }}>{o.total_amount.toFixed(2)} ₽</td>
              <td style={{ padding: 8 }}>{o.created_at ? new Date(o.created_at).toLocaleDateString('ru-RU') : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminOrders;