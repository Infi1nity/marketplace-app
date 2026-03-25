// frontend/src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { productsApi } from '../services/products';
import AddToCartButton from '../components/AddToCartButton'; // 👈 импортируем компонент кнопки
import './ProductDetailPage.css';

function ProductDetailPage() {
  // ========== ХУКИ ==========
  const { slug } = useParams();
  const navigate = useNavigate();

  // ========== СОСТОЯНИЯ ==========
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [imageError, setImageError] = useState(false); // 👈 для обработки ошибок загрузки

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  
  // Получение основного изображения
  const getMainImage = () => {
    if (product?.images && product.images.length > 0) {
      return product.images[activeImage];
    }
    if (product?.image) {
      return product.image;
    }
    return null;
  };

  // Получение всех изображений (для миниатюр)
  const getAllImages = () => {
    if (product?.images && product.images.length > 0) {
      return product.images;
    }
    if (product?.image) {
      return [product.image];
    }
    return [];
  };

  // Обработка ошибки загрузки изображения
  const handleImageError = (e) => {
    if (!imageError) {
      setImageError(true);
      e.target.src = 'https://picsum.photos/id/20/400/400'; // fallback изображение
      e.target.onerror = null;
    }
  };

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);
        
        console.log('Загружаем товар с slug:', slug);
        
        const response = await productsApi.getBySlug(slug);
        console.log('Получен товар:', response.data);
        
        setProduct(response.data);
        setActiveImage(0); // сбрасываем активное изображение
      } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        
        if (err.response?.status === 404) {
          navigate('/404', { replace: true });
        } else {
          setError(err.message || 'Ошибка при загрузке товара');
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, navigate]);

  // ========== ОБРАБОТЧИКИ ==========
  
  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newValue = prev + delta;
      return Math.max(1, Math.min(newValue, product?.stock || 99));
    });
  };

  const handleBackToCatalog = () => {
    navigate('/products');
  };

  // ========== УСЛОВНЫЙ РЕНДЕРИНГ ==========
  
  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner"></div>
        <p>Загрузка товара...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-error">
        <h2>Ошибка!</h2>
        <p>{error}</p>
        <button onClick={handleBackToCatalog}>Вернуться в каталог</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-not-found">
        <h2>Товар не найден</h2>
        <button onClick={handleBackToCatalog}>Вернуться в каталог</button>
      </div>
    );
  }

  const mainImage = getMainImage();
  const allImages = getAllImages();
  const hasMultipleImages = allImages.length > 1;

  // ========== ОСНОВНОЙ РЕНДЕРИНГ ==========
  return (
    <div className="product-detail-page">
      <button className="back-button" onClick={handleBackToCatalog}>
        ← Назад в каталог
      </button>

      <div className="product-detail-container">
        {/* Левая колонка — изображения */}
        <div className="product-images">
          {/* Главное изображение */}
          <div className="main-image">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={product.name}
                onError={handleImageError}
              />
            ) : (
              <div className="no-image">
                <span className="no-image-icon">📷</span>
                <span>Изображение отсутствует</span>
              </div>
            )}
          </div>

          {/* Миниатюры (если есть несколько фото) */}
          {hasMultipleImages && (
            <div className="thumbnail-list">
              {allImages.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} - ${index + 1}`}
                    onError={(e) => {
                      e.target.src = 'https://picsum.photos/id/20/80/80';
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Правая колонка — информация о товаре */}
        <div className="product-info">
          {/* Категория */}
          {product.category && (
            <div className="product-category">
              Категория: <span>{product.category.name}</span>
            </div>
          )}

          {/* Название */}
          <h1 className="product-name">{product.name}</h1>

          {/* Цена */}
          <div className="product-price">
            {product.price.toLocaleString('ru-RU')} ₽
          </div>

          {/* Наличие */}
          <div className="product-stock">
            {product.stock > 0 ? (
              <span className="in-stock">✅ В наличии: {product.stock} шт.</span>
            ) : (
              <span className="out-of-stock">❌ Нет в наличии</span>
            )}
          </div>

          {/* Артикул */}
          <div className="product-sku">Артикул: {product.id}</div>

          {/* Описание */}
          {product.description && (
            <div className="product-description">
              <h3>Описание</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Характеристики (если есть) */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="product-attributes">
              <h3>Характеристики</h3>
              <table className="attributes-table">
                <tbody>
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}:</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Блок добавления в корзину */}
          {product.stock > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <AddToCartButton 
                product={product} 
                quantity={quantity}
                className="detail-add-to-cart-btn"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;