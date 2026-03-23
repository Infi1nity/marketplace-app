import React, { createContext, useState, useContext, useEffect } from 'react';
import { favoritesApi } from '../services/favorites';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState({});
  const { isAuthenticated } = useAuth();

  // Загрузка избранного при авторизации
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoritesApi.getFavorites();
      setFavorites(response.data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(f => f.product_id === productId);
  };

  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
      // Если не авторизован, перенаправляем на логин
      window.location.href = '/login';
      return;
    }

    setUpdatingIds(prev => ({ ...prev, [productId]: true }));
    
    try {
      if (isFavorite(productId)) {
        await favoritesApi.removeFromFavorites(productId);
        setFavorites(prev => prev.filter(f => f.product_id !== productId));
      } else {
        const response = await favoritesApi.addToFavorites(productId);
        setFavorites(prev => [...prev, response.data]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setUpdatingIds(prev => ({ ...prev, [productId]: false }));
    }
  };

  const value = {
    favorites,
    loading,
    updatingIds,
    isFavorite,
    toggleFavorite,
    refreshFavorites: loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};