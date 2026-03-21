import api from './api';

export const categoriesApi = {
  // Получить плоский список всех категорий
  getAll: async (params = {}) => {
    const response = await api.get('/categories', { params });
    return response;
  },
  
  // Получить дерево категорий (с вложенными подкатегориями)
  getTree: async () => {
    const response = await api.get('/categories/tree');
    return response;
  },
  
  // Получить конкретную категорию с её подкатегориями
  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response;
  }
};