import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { sellerApi } from '../../services/seller';
import './SellerPanel.css';

function SellerProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    shop_name: user?.shop_name || '',
    shop_description: user?.shop_description || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const data = {};
      if (form.shop_name) data.shop_name = form.shop_name;
      if (form.shop_description) data.shop_description = form.shop_description;
      if (form.phone) data.phone = form.phone;
      await sellerApi.updateProfile(data);
      setMessage({ type: 'success', text: 'Настройки магазина сохранены!' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Ошибка сохранения';
      setMessage({ type: 'error', text: msg });
    }
    setSaving(false);
  };

  return (
    <div className="seller-page">
      <h1>Настройки магазина</h1>

      {message.text && (
        <div className={`auth-error`} style={{
          background: message.type === 'success' ? '#d1fae5' : '#fef3c7',
          color: message.type === 'success' ? '#065f46' : '#92400e',
          padding: 12,
          borderRadius: 10,
          marginBottom: 16,
          fontSize: 14,
          fontWeight: 500,
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Название магазина</label>
          <input
            value={form.shop_name}
            onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
            placeholder="Название вашего бренда или магазина"
          />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea
            rows={4}
            value={form.shop_description}
            onChange={(e) => setForm({ ...form, shop_description: e.target.value })}
            placeholder="Расскажите покупателям о вашем магазине..."
          />
        </div>
        <div className="form-group">
          <label>Телефон</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+7 (999) 000-00-00"
          />
        </div>
        <button type="submit" className="auth-btn" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
      </form>
    </div>
  );
}

export default SellerProfile;