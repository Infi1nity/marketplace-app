import { useFavorites } from '../contexts/FavoritesContext';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import AddToCartButton from '../components/AddToCartButton';
import './FavoritesPage.css';

function FavoritesPage() {
  const { favorites, loading, toggleFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <h2>Войдите в аккаунт</h2>
          <p>Добавляйте товары в избранное</p>
          <Link to="/login" className="browse-btn">ВОЙТИ</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="brutal-loading">
          <div className="brutal-loading-spinner"></div>
          <p>ЗАГРУЗКА...</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>Избранное</h1>
        </div>
        <div className="favorites-empty">
          <h2>Избранное пусто</h2>
          <p>Добавьте товары в избранное</p>
          <Link to="/" className="browse-btn">Перейти к товарам</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <h1>Избранное</h1>
        <p className="favorites-count">Товаров: {favorites.length}</p>
      </div>
      
      <div className="favorites-grid">
        {favorites.map(fav => {
          const product = fav.product || fav;
          const productId = fav.product_id || product?.id;
          
          return (
            <div key={productId} className="product-card">
              <div className="product-card-header">
                <button
                  className={`favorite-btn ${isFavorite(productId) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(productId)}
                  title={isFavorite(productId) ? 'Удалить из избранного' : 'В избранное'}
                >
                  {isFavorite(productId) ? '★' : '☆'}
                </button>
              </div>
              
              <Link to={`/product/${productId}`} className="product-image-link">
                {product?.image ? (
                  <img src={product.image} alt={product?.name || 'Товар'} className="product-image" />
                ) : (
                  <div className="product-image-placeholder">НЕТ ФОТО</div>
                )}
              </Link>
              
              <div className="product-info">
                <Link to={`/product/${productId}`} className="product-title">
                  {product?.name || 'Товар'}
                </Link>
                <p className="product-price">
                  {product?.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
                </p>
                <div className="product-actions">
                  <AddToCartButton product={product} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FavoritesPage;
