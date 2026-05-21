import { Link } from 'react-router';
import { useFavorites } from '../contexts/FavoritesContext';
import AddToCartButton from './AddToCartButton';
import { API_ORIGIN } from '../services/api';
import './ProductCard.css';

function ProductCard({ product }) {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <div className="product-card">
      <div className="product-card-header">
        <button
          className={`favorite-btn ${isFavorite(product.id) ? 'active' : ''}`}
          onClick={() => toggleFavorite(product.id)}
          aria-label={isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          {isFavorite(product.id) ? '★' : '☆'}
        </button>
      </div>
      
      <Link to={`/product/${product.id}`} className="product-image-link">
        {product.image ? (
          <img 
            src={`${API_ORIGIN}${product.image}`}
            alt={product.name} 
            className="product-image"
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class=\"product-image-placeholder\">NO PHOTO</div>'; }}
          />
        ) : (
          <div className="product-image-placeholder">
            NO PHOTO
          </div>
        )}
      </Link>
      
      <div className="product-info">
        <Link to={`/product/${product.id}`} className="product-title">
          {product.name}
        </Link>
        <p className="product-price">
          {product.price.toLocaleString('ru-RU')} ₽
        </p>
        <div className="product-actions">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
