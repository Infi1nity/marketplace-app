import React, { useState, useEffect } from 'react';
import { categoriesApi } from '../../services/categories';
import { adminApi } from '../../services/admin';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getTree();
      setCategories(Array.isArray(res) ? res : res?.data || []);
      setLoading(false);
    } catch (err) {
      setError('Ошибка загрузки категорий');
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
      if (editingId) {
        await adminApi.updateCategory(editingId, data);
      } else {
        await adminApi.createCategory(data);
      }
      setForm({ name: '', slug: '' });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    }
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug });
    setEditingId(cat.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      await adminApi.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="admin-page">
      <h1>Управление категориями</h1>
      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit} className="auth-form" style={{ marginBottom: 20 }}>
        <div className="form-row">
          <div className="form-group">
            <label>Название</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>URL (slug)</label>
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="auth-btn">{editingId ? 'Обновить' : 'Создать'} категорию</button>
        {editingId && <button type="button" className="logout-btn" style={{ marginLeft: 8 }} onClick={() => { setEditingId(null); setForm({ name: '', slug: '' }); }}>Отмена</button>}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map((cat) => (
          <li key={cat.id} style={{ padding: '8px 0', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><strong>{cat.name}</strong> ({cat.slug})</span>
            <div>
              <button onClick={() => handleEdit(cat)} style={{ marginRight: 8 }}>Изменить</button>
              <button onClick={() => handleDelete(cat.id)} style={{ color: 'red' }}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminCategories;