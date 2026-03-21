// frontend/src/services/auth.js
import api from './api';

export const authApi = {
  // Регистрация
  register: (userData) => api.post('/auth/register', userData),
  
  // Логин
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Получить профиль
  getProfile: () => api.get('/auth/profile'),
  
  // Обновить профиль
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // Сменить пароль
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  
  // Выйти (опционально)
  logout: () => api.post('/auth/logout'),
  
  // Проверить токен
  verifyToken: () => api.get('/auth/verify-token')
};