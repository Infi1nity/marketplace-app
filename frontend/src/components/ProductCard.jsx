import React from 'react';
// import PropTypes from 'prop-types';
import './ProductCard.css';
import { Link } from 'react-router';
import FavoriteButton from './FavoriteButton'
import AddToCartButton from './AddToCartButton'


function ProductCard({ product }) {
  // Функция для обработки ошибок загрузки изображения
  const handleImageError = (e) => {
    e.target.src = 'https://picsum.photos/id/20/200/200'; // fallback изображение
    e.target.onerror = null;
  };

  return (
    <div className="product-card">
      <div className="product-card-header">
        <FavoriteButton product={product} />
      </div>
      
      <Link to={`/products/${product.slug}`} className="product-image-link">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="product-image"
            onError={handleImageError}
          />
        ) : (
          <div className="product-image-placeholder">
            <span>📷</span>
            <span>Нет фото</span>
          </div>
        )}
      </Link>
      
      <div className="product-info">
        <Link to={`/products/${product.slug}`} className="product-title">
          <h3>{product.name}</h3>
        </Link>
        
        <div className="product-price">
          {product.price.toLocaleString('ru-RU')} ₽
        </div>
        
        <div className="product-actions">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;