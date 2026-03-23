// frontend/src/components/AddToCartButton.jsx
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './AddToCartButton.css';

function AddToCartButton({ product, quantity = 1, className = '' }) {
  const { addToCart, updatingItems } = useCart();
  const { isAuthenticated } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    
    setIsAdding(true);
    
    try {
      await addToCart(product.id, quantity);
      
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
      
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const isLoading = updatingItems[product?.id] || isAdding;
  const isOutOfStock = product?.stock === 0;

  return (
    <div className="add-to-cart-wrapper">
      <button
        onClick={handleAddToCart}
        disabled={isLoading || isOutOfStock}
        className={`add-to-cart-btn ${className}`}
      >
        {isLoading ? (
          <>
            <span className="spinner-small"></span>
            Добавление...
          </>
        ) : isOutOfStock ? (
          'Нет в наличии'
        ) : (
          '🛒 В корзину'
        )}
      </button>
      
      {showMessage && !isAuthenticated && (
        <div className="cart-message">
          Товар добавлен! <a href="/login">Войдите</a>, чтобы сохранить корзину
        </div>
      )}
      
      {showMessage && isAuthenticated && (
        <div className="cart-message success">
          ✓ Товар добавлен в корзину
        </div>
      )}
    </div>
  );
}

export default AddToCartButton;
