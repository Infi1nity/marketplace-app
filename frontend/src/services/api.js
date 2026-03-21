// frontend/src/services/api.js
import axios from 'axios';
import { getToken } from '../utils/auth';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// 👇 ПЕРЕХВАТЧИК ЗАПРОСОВ - добавляет токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 👇 ПЕРЕХВАТЧИК ОТВЕТОВ - обрабатывает ошибки авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или невалиден
      console.log('🔒 Unauthorized - clearing token');
      
      // Очищаем localStorage (но не вызываем logout из AuthContext,
      // чтобы избежать циклической зависимости)
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      
      // Перенаправляем на страницу логина
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;