import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { favoritesApi } from '../services/favorites';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingIds, setUpdatingIds] = useState({});
  const { isAuthenticated } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await favoritesApi.getFavorites();
      setFavorites(response.data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err.response?.data?.detail || 'Ошибка загрузки избранного');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback((productId) => {
    return favorites.some(f => f.product_id === productId);
  }, [favorites]);

  const toggleFavorite = async (productId) => {
    if (!isAuthenticated) {
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
    } catch (err) {
      console.error('Error toggling favorite:', err);
    } finally {
      setUpdatingIds(prev => ({ ...prev, [productId]: false }));
    }
  };

  const value = {
    favorites,
    loading,
    error,
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
