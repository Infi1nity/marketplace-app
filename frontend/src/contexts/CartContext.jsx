// frontend/src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { cartApi } from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const LOCAL_STORAGE_KEY = 'marketplace_cart';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingItems, setUpdatingItems] = useState({});
  
  const { isAuthenticated } = useAuth();

  // Загрузка локальной корзины из localStorage
  const loadLocalCart = useCallback(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading local cart:', e);
    }
    return [];
  }, []);

  // Сохранение локальной корзины в localStorage
  const saveLocalCart = useCallback((items) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving local cart:', e);
    }
  }, []);

  // Преобразование локальной корзины в формат для отображения
  const prepareLocalCartForDisplay = useCallback((localItems) => {
    return {
      items: localItems.map(item => ({
        id: item.productId,
        product_id: item.productId,
        quantity: item.quantity,
        product: item.product
      })),
      total: localItems.reduce((sum, item) => 
        sum + (item.product?.price || 0) * item.quantity, 0
      )
    };
  }, []);

  // Загрузка корзины при монтировании и при изменении статуса авторизации
  useEffect(() => {
    const initCart = async () => {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Загружаем корзину с сервера
        try {
          const response = await cartApi.getCart();
          setCart(response.data);
        } catch (err) {
          console.error('Error loading server cart:', err);
          setCart({ items: [], total: 0 });
        }
      } else {
        // Загружаем локальную корзину
        const localItems = loadLocalCart();
        if (localItems.length > 0) {
          setCart(prepareLocalCartForDisplay(localItems));
        } else {
          setCart({ items: [], total: 0 });
        }
      }

      setLoading(false);
    };

    initCart();
  }, [isAuthenticated, loadLocalCart, prepareLocalCartForDisplay]);

  // Добавление товара в корзину
  const addToCart = async (product, quantity = 1) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [product.id]: true }));

      if (isAuthenticated) {
        // Для авторизованных - добавляем на сервер
        await cartApi.addToCart(product.id, quantity);
        await loadCart();
      } else {
        // Для неавторизованных - добавляем в localStorage
        const localItems = loadLocalCart();
        const existingIndex = localItems.findIndex(item => item.productId === product.id);
        
        if (existingIndex >= 0) {
          localItems[existingIndex].quantity += quantity;
        } else {
          // Сохраняем полную информацию о продукте
          localItems.push({ 
            productId: product.id, 
            quantity,
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              slug: product.slug,
              description: product.description
            }
          });
        }
        
        saveLocalCart(localItems);
        setCart(prepareLocalCartForDisplay(localItems));
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setUpdatingItems(prev => ({ ...prev, [product.id]: false }));
    }
  };

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

  // Обновление количества товара
  const updateQuantity = async (itemId, quantity) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

      if (isAuthenticated) {
        await cartApi.updateCartItem(itemId, quantity);
        await loadCart();
      } else {
        // Для локальной корзины
        const localItems = loadLocalCart();
        const existingIndex = localItems.findIndex(item => item.productId === itemId);
        
        if (existingIndex >= 0) {
          if (quantity <= 0) {
            localItems.splice(existingIndex, 1);
          } else {
            localItems[existingIndex].quantity = quantity;
          }
          saveLocalCart(localItems);
          setCart(prepareLocalCartForDisplay(localItems));
        }
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    } finally {
      setUpdatingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Удаление товара из корзины
  const removeItem = async (itemId) => {
    try {
      setUpdatingItems(prev => ({ ...prev, [itemId]: true }));

      if (isAuthenticated) {
        await cartApi.removeCartItem(itemId);
        await loadCart();
      } else {
        const localItems = loadLocalCart();
        const filtered = localItems.filter(item => item.productId !== itemId);
        saveLocalCart(filtered);
        setCart(prepareLocalCartForDisplay(filtered));
      }
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
    try {
      if (isAuthenticated) {
        await cartApi.clearCart();
      } else {
        saveLocalCart([]);
      }
      setCart({ items: [], total: 0 });
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
