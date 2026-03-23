import api from './api';

export const favoritesApi = {
  // Получить список избранного
  getFavorites: () => api.get('/favorites'),
  
  // Добавить в избранное
  addToFavorites: (productId) => api.post(`/favorites/${productId}`),
  
  // Удалить из избранного
  removeFromFavorites: (productId) => api.delete(`/favorites/${productId}`),
  
  // Проверить, в избранном ли товар
  checkFavorite: (productId) => api.get(`/favorites/check/${productId}`),
};