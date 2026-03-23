// frontend/src/components/FavoriteButton.jsx
import React from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import './FavoriteButton.css';

function FavoriteButton({ product, className = '' }) {
  const { isFavorite, toggleFavorite, updatingIds } = useFavorites();
  
  const isFav = isFavorite(product?.id);
  const isLoading = updatingIds[product?.id];

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(product?.id);
  };

  if (!product?.id) return null;

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`favorite-btn ${isFav ? 'active' : ''} ${className}`}
      aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      {isLoading ? (
        <span className="favorite-spinner"></span>
      ) : (
        <span className="heart-icon">{isFav ? '❤️' : '🤍'}</span>
      )}
    </button>
  );
}

export default FavoriteButton;
