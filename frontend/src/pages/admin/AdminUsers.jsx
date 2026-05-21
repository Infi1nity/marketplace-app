import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/admin';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers({ search: search || undefined, limit: 50 });
      setUsers(res.data.items || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки');
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminApi.updateUser(userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка обновления');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Деактивировать пользователя?')) return;
    try {
      await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка деактивации');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <h1>Управление пользователями</h1>
      {error && <div className="auth-error">{error}</div>}
      <input placeholder="Поиск пользователей..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} style={{ marginBottom: 16, padding: 8, width: 300 }} />
      <button onClick={fetchUsers} className="auth-btn" style={{ marginLeft: 8 }}>Поиск</button>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #000' }}>
            <th style={{ textAlign: 'left', padding: 8 }}>ID</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Логин</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Роль</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Статус</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} style={{ borderBottom: '1px solid #ccc' }}>
              <td style={{ padding: 8 }}>{u.id}</td>
              <td style={{ padding: 8 }}>{u.username}</td>
              <td style={{ padding: 8 }}>{u.email}</td>
              <td style={{ padding: 8 }}>
                <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                  <option value="buyer">Покупатель</option>
                  <option value="seller">Продавец</option>
                  <option value="admin">Админ</option>
                </select>
              </td>
              <td style={{ padding: 8 }}>{u.is_active ? 'Активен' : 'Неактивен'}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => handleDeactivate(u.id)} style={{ color: 'red' }}>Деактивировать</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;