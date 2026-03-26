import { Link } from 'react-router';
import { useFavorites } from '../contexts/FavoritesContext';
import AddToCartButton from './AddToCartButton';
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
            src={product.image} 
            alt={product.name} 
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            НЕТ ФОТО
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
