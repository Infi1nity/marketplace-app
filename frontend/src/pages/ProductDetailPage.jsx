// frontend/src/pages/ProductDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';  // хуки для работы с URL и навигацией
import { productsApi } from '../services/products';
import './ProductDetailPage.css';

function ProductDetailPage() {
  // ========== ХУКИ ==========
  // useParams получает параметры из URL (например, /products/iphone-15 → { slug: "iphone-15" })
  const { slug } = useParams();
  
  // useNavigate для программной навигации (перенаправления)
  const navigate = useNavigate();

  // ========== СОСТОЯНИЯ ==========
  const [product, setProduct] = useState(null);        // данные товара
  const [loading, setLoading] = useState(true);        // индикатор загрузки
  const [error, setError] = useState(null);            // ошибка
  const [quantity, setQuantity] = useState(1);         // количество для добавления в корзину
  const [activeImage, setActiveImage] = useState(0);   // индекс активного изображения (если несколько фото)

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  useEffect(() => {
    // Функция для загрузки товара по slug
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Загружаем товар с slug:', slug);
        
        // Вызываем API для получения товара
        const response = await productsApi.getBySlug(slug);
        console.log('Получен товар:', response.data);
        
        setProduct(response.data);
      } catch (err) {
        console.error('Ошибка загрузки товара:', err);
        
        // Если товар не найден (404) — перенаправляем на страницу 404
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
  }, [slug, navigate]); // Эффект перезапустится, если изменится slug

  // ========== ОБРАБОТЧИКИ ==========
  
  // Добавление в корзину
  const handleAddToCart = () => {
    console.log('Добавляем в корзину:', { product: product.id, quantity });
    // TODO: реализовать добавление в корзину через API
    alert(`Товар "${product.name}" добавлен в корзину (${quantity} шт.)`);
  };

  // Изменение количества
  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newValue = prev + delta;
      // Не меньше 1 и не больше остатка на складе
      return Math.max(1, Math.min(newValue, product?.stock || 99));
    });
  };

  // Переход к списку товаров
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

  // ========== ОСНОВНОЙ РЕНДЕРИНГ ==========
  return (
    <div className="product-detail-page">
      {/* Кнопка "Назад" */}
      <button className="back-button" onClick={handleBackToCatalog}>
        ← Назад в каталог
      </button>

      <div className="product-detail-container">
        {/* Левая колонка — изображения */}
        <div className="product-images">
          {/* Главное изображение */}
          <div className="main-image">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[activeImage]} 
                alt={product.name}
              />
            ) : (
              <div className="no-image">Нет фото</div>
            )}
          </div>

          {/* Миниатюры (если есть несколько фото) */}
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-list">
              {product.images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={img} alt={`${product.name} - ${index + 1}`} />
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

          {/* Артикул / ID (опционально) */}
          <div className="product-sku">Артикул: {product.id}</div>

          {/* Описание */}
          {product.description && (
            <div className="product-description">
              <h3>Описание</h3>
              <p>{product.description}</p>
            </div>
          )}

          {/* Характеристики (если есть) */}
          {product.attributes && (
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

              <button 
                className="add-to-cart-button"
                onClick={handleAddToCart}
              >
                Добавить в корзину
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;