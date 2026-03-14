import api from './api';

export const productsApi = {
  // Получить список товаров
  getProducts: (params = {}) => 
    api.get('/products', { params }),
  
  // Получить один товар
  getProduct: (id) => 
    api.get(`/products/${id}`),
  
  // Поиск товаров
  searchProducts: (query) => 
    api.get('/products/search', { params: { q: query } }),
};