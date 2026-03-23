// frontend/src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useOrders } from '../contexts/OrdersContext';
import './CheckoutPage.css';

function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  
  const [formData, setFormData] = useState({
    shipping_address: '',
    contact_phone: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const items = cart?.items || [];

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.shipping_address.trim()) {
      newErrors.shipping_address = 'Укажите адрес доставки';
    }
    if (!formData.contact_phone.trim()) {
      newErrors.contact_phone = 'Укажите контактный телефон';
    } else if (!/^[\d\s\-+()]+$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Неверный формат телефона';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const order = await createOrder(formData);
      await clearCart(); // Очищаем корзину после создания заказа
      navigate(`/orders/${order.id}`, { 
        state: { success: true, orderId: order.id }
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      setErrors({ form: error.response?.data?.detail || 'Ошибка при оформлении заказа' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Оформление заказа</h1>
      
      <div className="checkout-container">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-group">
              <label htmlFor="shipping_address">Адрес доставки *</label>
              <input
                type="text"
                id="shipping_address"
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                placeholder="Город, улица, дом, квартира"
                className={errors.shipping_address ? 'error' : ''}
              />
              {errors.shipping_address && (
                <span className="error-message">{errors.shipping_address}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="contact_phone">Контактный телефон *</label>
              <input
                type="tel"
                id="contact_phone"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+7 (XXX) XXX-XX-XX"
                className={errors.contact_phone ? 'error' : ''}
              />
              {errors.contact_phone && (
                <span className="error-message">{errors.contact_phone}</span>
              )}
            </div>
            
            {errors.form && (
              <div className="form-error">{errors.form}</div>
            )}
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Оформление...' : 'Оформить заказ'}
            </button>
          </form>
        </div>
        
        <div className="order-summary">
          <h3>Ваш заказ</h3>
          <div className="summary-items">
            {items.map(item => (
              <div key={item.id} className="summary-item">
                <span className="item-name">
                  {item.product?.name || `Товар #${item.product_id}`}
                  <span className="item-quantity"> × {item.quantity}</span>
                </span>
                <span className="item-price">
                  {((item.product?.price || 0) * item.quantity).toLocaleString('ru-RU')} ₽
                </span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Итого:</span>
            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;