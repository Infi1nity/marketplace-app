import api from './api';

export const productsApi = {
  // Получение списка товаров с фильтрами
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Products API error:', error);
      throw error;
    }
  },
  
  // Получение товара по slug
  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/products/${slug}`);
      return response.data;
    } catch (error) {
      console.error('Product by slug error:', error);
      throw error;
    }
  },
  
  // Получение товара по ID
  getById: async (id) => {
    try {
      const response = await api.get(`/products/id/${id}`);
      return response.data;
    } catch (error) {
      console.error('Product by ID error:', error);
      throw error;
    }
  }
};
