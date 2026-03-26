import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { productsApi } from '../services/products';
import { useFavorites } from '../contexts/FavoritesContext';
import AddToCartButton from '../components/AddToCartButton';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productsApi.getById(id);
        setProduct(data);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(prev + delta, 99)));
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>ЗАГРУЗКА...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>ТОВАР НЕ НАЙДЕН</h2>
        <button onClick={() => navigate('/')}>ВЕРНУТЬСЯ</button>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← НАЗАД
      </button>

      <div className="product-detail-container">
        <div className="product-detail-image">
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="no-image">НЕТ ФОТО</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>
          
          <div className="product-detail-price">
            {product.price.toLocaleString('ru-RU')} ₽
          </div>

          {product.description && (
            <p className="product-detail-desc">{product.description}</p>
          )}

          <div className="product-detail-stock">
            {product.stock > 0 ? (
              <span className="in-stock">В НАЛИЧИИ: {product.stock} ШТ.</span>
            ) : (
              <span className="out-stock">НЕТ В НАЛИЧИИ</span>
            )}
          </div>

          <div className="product-detail-actions">
            <div className="quantity-control">
              <button onClick={() => handleQuantityChange(-1)}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>

            <AddToCartButton product={product} quantity={quantity} />

            <button 
              className="favorite-detail"
              onClick={() => toggleFavorite(product.id)}
            >
              {isFavorite(product.id) ? '★' : '☆'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
