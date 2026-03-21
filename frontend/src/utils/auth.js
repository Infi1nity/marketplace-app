// Ключ, под которым мы будем хранить токен в localStorage
const TOKEN_KEY = 'access_token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Опционально: можно хранить и данные пользователя
const USER_KEY = 'user_data';

export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const logout = () => {
  removeToken();
  removeUser();
  // Можно также перенаправить пользователя на страницу логина
};