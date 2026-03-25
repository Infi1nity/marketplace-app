// frontend/src/components/AddToCartButton.jsx
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import './AddToCartButton.css';

function AddToCartButton({ product, quantity = 1, className = '' }) {
  const { addToCart, cart, updatingItems } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Проверяем, есть ли товар в корзине и сколько
  const getItemQuantity = () => {
    if (!cart?.items) return 0;
    const item = cart.items.find(i => i.product_id === product.id || i.id === product.id);
    return item?.quantity || 0;
  };

  const itemQuantity = getItemQuantity();
  const isInCart = itemQuantity > 0;
  const isLoading = updatingItems[product?.id] || isAdding;

  const handleAddToCart = async () => {
    if (!product || product.stock === 0 || isLoading) return;
    
    setIsAdding(true);
    
    try {
      await addToCart(product, quantity);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading || product?.stock === 0}
      className={`add-to-cart-btn ${className} ${isInCart ? 'in-cart' : ''}`}
    >
      {isLoading ? (
        <span className="btn-loading">
          <span className="spinner-small"></span>
        </span>
      ) : isInCart ? (
        <span className="btn-in-cart">
          ✓ Добавлено {itemQuantity > 1 && `×${itemQuantity}`}
        </span>
      ) : product?.stock === 0 ? (
        'Нет в наличии'
      ) : (
        '🛒 В корзину'
      )}
    </button>
  );
}

export default AddToCartButton;
