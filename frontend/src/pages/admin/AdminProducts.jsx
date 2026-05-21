import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/admin';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await adminApi.getProducts({ search: search || undefined, limit: 50 });
      setProducts(res.data.items || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки');
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар навсегда?')) return;
    try {
      await adminApi.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <h1>Модерация товаров</h1>
      {error && <div className="auth-error">{error}</div>}
      <input placeholder="Поиск товаров..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchProducts()} style={{ marginBottom: 16, padding: 8, width: 300 }} />
      <button onClick={fetchProducts} className="auth-btn" style={{ marginLeft: 8 }}>Поиск</button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Название</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Цена</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Остаток</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Продавец</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Статус</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: 8 }}>{p.id}</td>
              <td style={{ padding: 8 }}>{p.name}</td>
              <td style={{ padding: 8 }}>{p.price.toFixed(2)} ₽</td>
              <td style={{ padding: 8 }}>{p.stock}</td>
              <td style={{ padding: 8 }}>#{p.seller_id}</td>
              <td style={{ padding: 8 }}>{p.is_active ? 'Активен' : 'Неактивен'}</td>
              <td style={{ padding: 8 }}><button onClick={() => handleDelete(p.id)} style={{ color: 'red' }}>Удалить</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminProducts;