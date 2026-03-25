import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { useFavorites } from '../contexts/FavoritesContext';
import { useAuth } from '../contexts/AuthContext';
import FavoriteButton from '../components/FavoriteButton';
import AddToCartButton from '../components/AddToCartButton';
import './FavoritesPage.css';

function FavoritesPage() {
  const { favorites, loading, error, refreshFavorites } = useFavorites();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshFavorites();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="favorites-auth-required">
        <h2>Войдите в аккаунт</h2>
        <p>Чтобы просмотреть избранное, войдите или зарегистрируйтесь</p>
        <div className="auth-buttons">
          <Link to="/login" className="login-btn">Войти</Link>
          <Link to="/register" className="register-btn">Зарегистрироваться</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-loading">
        <div className="spinner"></div>
        <p>Загрузка избранного...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-error">
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button onClick={refreshFavorites}>Попробовать снова</button>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>Ваш список желаний пуст</h2>
        <p>Добавляйте товары в избранное, чтобы не потерять их</p>
        <Link to="/products" className="continue-shopping-btn">
          Перейти к товарам
        </Link>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <h1>Избранное ({favorites.length})</h1>

      <div className="favorites-grid">
        {favorites.map(favorite => {
          const product = favorite.product;
          if (!product) return null;

          return (
            <div key={favorite.id} className="favorite-card">
              <div className="favorite-card-header">
                <FavoriteButton product={product} />
              </div>
              
              <Link to={`/products/${product.slug}`} className="favorite-card-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="no-image">Нет фото</div>
                )}
              </Link>
              
              <div className="favorite-card-info">
                <Link to={`/products/${product.slug}`} className="product-name">
                  {product.name}
                </Link>
                <div className="product-price">
                  {product.price?.toLocaleString('ru-RU')} ₽
                </div>
                <AddToCartButton product={product} className="compact-btn" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FavoritesPage;
