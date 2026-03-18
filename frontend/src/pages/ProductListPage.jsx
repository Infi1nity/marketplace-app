import React, { useState, useEffect } from 'react';  // хуки для состояния и эффектов
import ProductCard from '../components/ProductCard';  // наш компонент карточки
import { productsApi } from '../services/products';    // API для запросов к бэкенду
import './ProductListPage.css';  // стили для страницы (создадим позже)

function ProductListPage() {
  // ========== СОСТОЯНИЯ (STATE) ==========
  // Состояние для списка товаров (изначально пустой массив)
  const [products, setProducts] = useState([]);
  
  // Состояние для индикатора загрузки (показываем спиннер)
  const [loading, setLoading] = useState(true);
  
  // Состояние для ошибки (если запрос не удался)
  const [error, setError] = useState(null);
  
  // Состояние для пагинации (какая страница сейчас)
  const [currentPage, setCurrentPage] = useState(1);
  
  // Состояние для общего количества товаров (для пагинации)
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Состояние для фильтра по категории
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Состояние для поискового запроса
  const [searchQuery, setSearchQuery] = useState('');

  // Количество товаров на странице
  const ITEMS_PER_PAGE = 12;

  // ========== ЗАГРУЗКА ДАННЫХ ==========
  // useEffect выполняет код при монтировании компонента
  // и при изменении зависимостей [currentPage, selectedCategory, searchQuery]
  useEffect(() => {
    // Функция для загрузки товаров (объявляем внутри useEffect)
    const fetchProducts = async () => {
      try {
        // Показываем индикатор загрузки
        setLoading(true);
        
        // Очищаем предыдущую ошибку
        setError(null);
        
        // Вычисляем offset для пагинации (сколько записей пропустить)
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        
        // Формируем параметры запроса
        const params = {
          skip: skip,
          limit: ITEMS_PER_PAGE,
          ...(selectedCategory && { category_id: selectedCategory }), // если выбрана категория
        //   ...(searchQuery && { search: searchQuery }) // если есть поиск
        };
        
        // Отправляем запрос к бэкенду через наш API-клиент
        // Ждем ответ с помощью await (поэтому функция async)
        const response = await productsApi.getAll(params);
        
        // Сохраняем полученные товары в состояние
        setProducts(response.data.items || response.data); // зависит от формата ответа
        
        // Если бэкенд возвращает общее количество, сохраняем его
        if (response.data.total) {
          setTotalProducts(response.data.total);
        }
        
      } catch (err) {
        // Если произошла ошибка, сохраняем её в состояние
        setError(err.response?.data?.detail || err.message || 'Ошибка при загрузке товаров');
        console.error('Error fetching products:', err);
      } finally {
        // В любом случае (успех или ошибка) выключаем индикатор загрузки
        setLoading(false);
      }
    };

    // Вызываем функцию загрузки
    fetchProducts();
    
  }, [currentPage, selectedCategory, searchQuery]); 
  // 👆 Эффект перезапустится при изменении этих значений

  // ========== ОБРАБОТЧИКИ СОБЫТИЙ ==========
  
  // Добавление товара в корзину
  const handleAddToCart = (product) => {
    console.log('Adding to cart:', product);
    // TODO: реализовать добавление в корзину через API
    alert(`Товар "${product.name}" добавлен в корзину!`);
  };

  // Переход на следующую страницу
  const handleNextPage = () => {
    const maxPage = Math.ceil(totalProducts / ITEMS_PER_PAGE);
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
      // Прокрутка вверх страницы
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Переход на предыдущую страницу
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Изменение категории
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // сбрасываем на первую страницу при смене фильтра
  };

  // Поиск
  const handleSearch = (event) => {
    event.preventDefault();
    // searchQuery уже обновляется через onChange инпута
    setCurrentPage(1); // сбрасываем на первую страницу
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    setCurrentPage(1);
  };

  // ========== УСЛОВНЫЙ РЕНДЕРИНГ ==========
  
  // Если идет загрузка - показываем спиннер
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка товаров...</p>
      </div>
    );
  }

  // Если произошла ошибка - показываем сообщение об ошибке
  if (error) {
    return (
      <div className="error-container">
        <h2>Ошибка!</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  // ========== ОСНОВНОЙ РЕНДЕРИНГ ==========
  return (
    <div className="product-list-page">
      {/* Заголовок страницы */}
      <h1 className="page-title">Все товары</h1>
      
      {/* Секция фильтров */}
      <div className="filters-section">
        {/* Поиск */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Найти
          </button>
        </form>

        {/* Фильтр по категориям (пример) */}
        <div className="category-filters">
          <button 
            className={!selectedCategory ? 'active' : ''}
            onClick={() => handleCategoryChange(null)}
          >
            Все
          </button>
          <button 
            className={selectedCategory === 1 ? 'active' : ''}
            onClick={() => handleCategoryChange(1)}
          >
            Электроника
          </button>
          <button 
            className={selectedCategory === 2 ? 'active' : ''}
            onClick={() => handleCategoryChange(2)}
          >
            Одежда
          </button>
          <button 
            className={selectedCategory === 3 ? 'active' : ''}
            onClick={() => handleCategoryChange(3)}
          >
            Книги
          </button>
        </div>

        {/* Кнопка сброса фильтров */}
        {(selectedCategory || searchQuery) && (
          <button onClick={handleResetFilters} className="reset-filters">
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Информация о количестве товаров */}
      <div className="products-info">
        <p>Найдено товаров: {totalProducts || products.length}</p>
      </div>

      {/* Сетка с товарами */}
      {products.length === 0 ? (
        // Если товаров нет
        <div className="no-products">
          <p>Товары не найдены</p>
          <button onClick={handleResetFilters}>Сбросить фильтры</button>
        </div>
      ) : (
        // Если товары есть - отображаем их в сетке
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Пагинация (если общее количество известно) */}
          {totalProducts > 0 && (
            <div className="pagination">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                ← Предыдущая
              </button>
              
              <span className="page-info">
                Страница {currentPage} из {Math.ceil(totalProducts / ITEMS_PER_PAGE)}
              </span>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage >= Math.ceil(totalProducts / ITEMS_PER_PAGE)}
                className="pagination-button"
              >
                Следующая →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProductListPage;