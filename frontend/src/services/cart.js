import api from './api';

export const cartApi = {
  // Получить корзину
  getCart: () => 
    api.get('/cart'),
  
  // Добавить товар
  addToCart: (productId, quantity = 1) => 
    api.post('/cart/items', { product_id: productId, quantity }),
  
  // Удалить товар
  removeFromCart: (itemId) => 
    api.delete(`/cart/items/${itemId}`),
  
  // Очистить корзину
  clearCart: () => 
    api.delete('/cart'),
};