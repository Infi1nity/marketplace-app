// frontend/src/services/orders.js
import api from './api';

export const ordersApi = {
  // Получить список заказов
  getOrders: (params = {}) => api.get('/orders', { params }),
  
  // Получить детали заказа
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  
  // Создать заказ
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Отменить заказ
  cancelOrder: (orderId) => api.delete(`/orders/${orderId}`),
};