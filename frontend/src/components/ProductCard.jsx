import React from 'react';
// import PropTypes from 'prop-types';
import './ProductCard.css';
import { Link } from 'react-router';

function ProductCard({ product, onAddToCart }) {
    if (!product) {
        return null;
    };

    const handleAddToCart = () => {
        onAddToCart(product);
    }

      return (
    <div className="product-card">
      {/* Оборачиваем изображение и название в ссылку */}
      <Link to={`/products/${product.slug}`} className="product-link">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-image" />
        ) : (
          <div className="product-image-placeholder">Нет фото</div>
        )}
        
        <h3 className="product-title">{product.name}</h3>
      </Link>
      
      <p className="product-price">
        {product.price.toLocaleString('ru-RU')} ₽
      </p>
      
      <button 
        onClick={() => handleAddToCart(product)}
        className="add-to-cart-btn"
        disabled={product.stock === 0}
      >
        {product.stock > 0 ? 'В корзину' : 'Нет в наличии'}
      </button>
    </div>
  );
}

// ProductCard.propTypes = {
//   product: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     name: PropTypes.string.isRequired,
//     price: PropTypes.number.isRequired,
//     image: PropTypes.string,
//     stock: PropTypes.number.isRequired
//   }).isRequired,
//   onAddToCart: PropTypes.func.isRequired
// };

// Экспортируем компонент для использования в других файлах
export default ProductCard;