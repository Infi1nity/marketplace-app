import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов
api.interceptors.request.use(config => {
  console.log('🔍 ПОЛНЫЙ URL:', config.baseURL + config.url);
  console.log('🔍 baseURL:', config.baseURL);
  console.log('🔍 url:', config.url);
  console.log('🔍 method:', config.method);
  console.log('🔍 params:', config.params);
  console.log('🔍 headers:', config.headers);
  return config;
});

// Перехватчик ответов
api.interceptors.response.use(
  response => {
    console.log('✅ УСПЕХ:', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('❌ ОШИБКА:', {
      status: error.response?.status,
      url: error.config?.baseURL + error.config?.url,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;