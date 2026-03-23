// frontend/src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartApi } from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  
  const { isAuthenticated } = useAuth();

  // Загрузка корзины при монтировании и при изменении статуса авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setCart(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Загрузка корзины с сервера
  const loadCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartApi.getCart();
      setCart(response.data);
    } catch (err) {
      console.error('Error loading cart:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки корзины');
    } finally {
      setLoading(false);
    }
  };

  // Добавление товара в корзину
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      // Можно сохранить в localStorage для неавторизованных
      console.log('Неавторизован, сохраняем в localStorage');
      addToLocalCart(productId, quantity);
      return;
    }

    try {
      setUpdatingItems(prev => ({ ...prev, [productId]: true }));
      const response = await cartApi.addToCart(productId, quantity);
      // Обновляем корзину после добавления
      await loadCart();
      return response.data;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setUpdatingItems(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Обновление количества товара
  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return;
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await cartApi.updateCartItem(itemId, quantity);
      await loadCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Удаление товара из корзины
  const removeItem = async (itemId) => {
    if (!isAuthenticated) return;
    
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));
      await cartApi.removeCartItem(itemId);
      await loadCart();
    } catch (err) {
      console.error('Error removing item:', err);
      throw err;
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Увеличение количества
  const increaseItem = async (itemId, currentQuantity) => {
    await updateQuantity(itemId, currentQuantity + 1);
  };

  // Уменьшение количества
  const decreaseItem = async (itemId, currentQuantity) => {
    if (currentQuantity <= 1) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, currentQuantity - 1);
    }
  };

  // Очистка корзины
  const clearCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      await cartApi.clearCart();
      await loadCart();
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw err;
    }
  };

  // Подсчет общего количества товаров
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Подсчет общей стоимости
  const totalPrice = cart?.items?.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity, 
    0
  ) || 0;

  // Локальная корзина для неавторизованных (простая реализация)
  const [localCart, setLocalCart] = useState([]);

  const addToLocalCart = (productId, quantity) => {
    const existing = localCart.find(item => item.productId === productId);
    if (existing) {
      setLocalCart(prev => prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setLocalCart(prev => [...prev, { productId, quantity }]);
    }
  };

  const value = {
    cart,
    loading,
    error,
    totalItems,
    totalPrice,
    updatingItems,
    addToCart,
    updateQuantity,
    removeItem,
    increaseItem,
    decreaseItem,
    clearCart,
    refreshCart: loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};