import React, { useState, useEffect, useRef } from 'react';
import { sellerApi } from '../../services/seller';
import { API_ORIGIN } from '../../services/api';
import './SellerPanel.css';

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', slug: '', price: '', stock: '0',
    description: '', category_id: '1', image: ''
  });

  const fetchProducts = async () => {
    try {
      const res = await sellerApi.getProducts();
      setProducts(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => {
    setForm({ name: '', slug: '', price: '', stock: '0', description: '', category_id: '1', image: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, slug: p.slug, price: p.price.toString(),
      stock: p.stock.toString(), description: p.description || '',
      category_id: p.category_id.toString(), image: p.image || ''
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await sellerApi.uploadImage(formData);
      setForm(prev => ({ ...prev, image: res.data.url }));
    } catch (err) {
      setError('Ошибка загрузки изображения');
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        category_id: parseInt(form.category_id) || 1,
        image: form.image || undefined
      };
      if (editingId) {
        await sellerApi.updateProduct(editingId, data);
      } else {
        await sellerApi.createProduct(data);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить товар навсегда?')) return;
    try {
      await sellerApi.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  const autoSlug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (loading) return <div className="seller-page"><div className="empty-state"><p>Загрузка...</p></div></div>;

  return (
    <div className="seller-page">
      <div className="page-header">
        <h1>Мои товары</h1>
        <button className="auth-btn" onClick={openCreate}>+ Добавить товар</button>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>Товаров пока нет</h3>
          <p>Создайте первый товар, чтобы начать продавать</p>
          <button className="auth-btn" onClick={openCreate}>+ Создать товар</button>
        </div>
      ) : (
        <div className="product-table-wrap">
          <table className="product-table">
            <thead>
              <tr>
                <th>Фото</th>
                <th>Название</th>
                <th>Цена</th>
                <th>Остаток</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="product-image-cell">
                    {p.image ? (
                      <img src={`${API_ORIGIN}${p.image}`} alt={p.name}
                        onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div style=\"width:48px;height:48px;background:#f0f0f0;border-radius:8px\"></div>'; }}
                      />
                    ) : (
                      <div style={{ width: 48, height: 48, background: '#f0f0f0', borderRadius: 8 }} />
                    )}
                  </td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.price.toFixed(2)} ₽</td>
                  <td>
                    <span className={`stock-badge ${p.stock <= 3 ? 'low' : 'ok'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${p.is_active ? 'active' : 'inactive'}`}>
                      {p.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" onClick={() => openEdit(p)}>Изменить</button>
                      <button className="btn-icon danger" onClick={() => handleDelete(p.id)}>Удалить</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Редактировать товар' : 'Добавить товар'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Название товара</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : autoSlug(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>URL идентификатор (slug)</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Цена (₽)</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Количество на складе</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                </div>
                <div className="form-group full-width">
                  <label>Описание</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
                </div>
                <div className="form-group full-width">
                  <label>Фото товара</label>
                  <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                    {form.image ? (
                      <img src={`${API_ORIGIN}${form.image}`} alt="Preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <span className="icon">📷</span>
                        <span>{uploading ? 'Загрузка...' : 'Нажмите, чтобы загрузить фото'}</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  {form.image && (
                    <button type="button" className="btn-icon" onClick={() => setForm({ ...form, image: '' })} style={{ marginTop: 8 }}>
                      Удалить фото
                    </button>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="btn-icon" onClick={() => setShowModal(false)}>Отмена</button>
                <button type="submit" className="auth-btn" disabled={uploading}>
                  {uploading ? 'Загрузка...' : editingId ? 'Сохранить' : 'Создать товар'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerProducts;