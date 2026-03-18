import api from './api';

export const productsApi = {
  // Существующий метод
  getAll: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response;
  },
  
  // Новый метод для получения товара по slug
  getBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response;
  },
  
  // Можно также добавить по ID
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response;
  }
};