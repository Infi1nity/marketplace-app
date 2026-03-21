// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, removeToken, removeUser } from '../utils/auth';
import { authApi } from '../services/auth'; // для проверки токена

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка пользователя при старте приложения
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = getToken();
        const storedUser = getUser();
        
        if (token && storedUser) {
          // Опционально: проверить токен на сервере
          try {
            const response = await authApi.verifyToken();
            setUserState(response.data.user);
          } catch (err) {
            // Токен невалидный - очищаем хранилище
            console.error('Token verification failed:', err);
            logout();
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Функция логина
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login({ email, password });
      
      // response.data должен содержать { access_token, user }
      const { access_token, user } = response.data;
      
      // Сохраняем в localStorage
      setToken(access_token);
      setUser(user);
      
      // Обновляем состояние
      setUserState(user);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Login failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Функция регистрации
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      
      // Обычно после регистрации сразу логинят
      // Но можно и просто вернуть пользователя
      return { success: true, user: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Функция выхода
  const logout = () => {
    // Очищаем localStorage
    removeToken();
    removeUser();
    
    // Очищаем состояние
    setUserState(null);
    
    // Опционально: сообщаем серверу о выходе
    // authApi.logout().catch(console.error);
  };

  // Функция обновления профиля
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authApi.updateProfile(userData);
      
      // Обновляем данные в localStorage и состоянии
      setUser(response.data);
      setUserState(response.data);
      
      return { success: true, user: response.data };
    } catch (err) {
      const message = err.response?.data?.detail || 'Update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Значение, которое будет доступно через useAuth()
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};