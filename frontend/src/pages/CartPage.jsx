// frontend/src/pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './CartPage.css';

function CartPage() {
  const { 
    cart, 
    loading, 
    error, 
    totalItems, 
    totalPrice,
    updatingItems,
    removeItem,
    increaseItem,
    decreaseItem,
    clearCart
  } = useCart();
  const { isAuthenticated } = useAuth();

  // Обработчик ошибки загрузки изображения
  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/id/20/80/80';
    e.target.onerror = null;
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Загрузка корзины...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-error">
        <h2>Ошибка!</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Ваша корзина пуста</h2>
        <p>Добавьте товары в корзину, чтобы продолжить покупки</p>
        <Link to="/products" className="continue-shopping-btn">
          Перейти к товарам
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина ({totalItems} {totalItems === 1 ? 'товар' : 'товаров'})</h1>

      <div className="cart-container">
        {/* Список товаров */}
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              {/* Изображение товара */}
              <div className="cart-item-image">
                {item.product?.image ? (
                  <img 
                    src={item.product.image} 
                    alt={item.product.name}
                    onError={handleImageError}
                  />
                ) : (
                  <div className="no-image">
                    <span>📷</span>
                  </div>
                )}
              </div>

              {/* Информация о товаре */}
              <div className="cart-item-info">
                <Link to={`/products/${item.product?.slug}`} className="cart-item-name">
                  {item.product?.name || `Товар #${item.product_id}`}
                </Link>
                <div className="cart-item-price">
                  {item.product?.price?.toLocaleString('ru-RU')} ₽
                </div>
              </div>

              {/* Количество */}
              <div className="cart-item-quantity">
                <button
                  onClick={() => decreaseItem(item.id, item.quantity)}
                  disabled={updatingItems[item.id]}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  onClick={() => increaseItem(item.id, item.quantity)}
                  disabled={updatingItems[item.id]}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

              {/* Сумма за позицию */}
              <div className="cart-item-total">
                {((item.product?.price || 0) * item.quantity).toLocaleString('ru-RU')} ₽
              </div>

              {/* Кнопка удаления */}
              <button
                onClick={() => removeItem(item.id)}
                disabled={updatingItems[item.id]}
                className="cart-item-remove"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Итого */}
        <div className="cart-summary">
          <h3>Итого</h3>
          <div className="summary-row">
            <span>Товары ({totalItems} шт.)</span>
            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>
          <div className="summary-row">
            <span>Доставка</span>
            <span>Бесплатно</span>
          </div>
          <div className="summary-total">
            <span>К оплате</span>
            <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
          </div>

          {/* Кнопка оформления заказа */}
          <Link to="/checkout" className="checkout-btn">
            Оформить заказ
          </Link>

          {/* Кнопка очистки корзины */}
          <button onClick={clearCart} className="clear-cart-btn">
            Очистить корзину
          </button>

          {/* Предупреждение для неавторизованных */}
          {!isAuthenticated && (
            <div className="cart-auth-warning">
              <p>
                <Link to="/login">Войдите</Link> или{' '}
                <Link to="/register">зарегистрируйтесь</Link>, чтобы сохранить корзину
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CartPage;