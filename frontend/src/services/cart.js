// frontend/src/services/cart.js
import api from './api';

export const cartApi = {
  // Получить корзину
  getCart: () => api.get('/cart'),
  
  // Добавить товар в корзину
  addToCart: (productId, quantity = 1) => 
    api.post('/cart/items', { product_id: productId, quantity }),
  
  // Изменить количество товара
  updateCartItem: (itemId, quantity) => 
    api.put(`/cart/items/${itemId}`, { quantity }),
  
  // Удалить товар из корзины
  removeCartItem: (itemId) => 
    api.delete(`/cart/items/${itemId}`),
  
  // Увеличить количество на 1
  increaseItem: (itemId) => 
    api.post(`/cart/items/${itemId}/increase`),
  
  // Уменьшить количество на 1
  decreaseItem: (itemId) => 
    api.post(`/cart/items/${itemId}/decrease`),
  
  // Очистить корзину
  clearCart: () => api.delete('/cart'),
};