import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек — удаляем и перенаправляем на логин
      localStorage.removeItem('access_token');
      window.location = '/login';
    }
    
    // Пробрасываем ошибку дальше с понятным сообщением
    const message = error.response?.data?.detail || error.message;
    return Promise.reject({ ...error, message });
  }
);

export default api;