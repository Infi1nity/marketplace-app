// frontend/src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { categoriesApi } from '../services/categories';
import './Header.css';
import { useAuth } from '../contexts/AuthContext'; // Импортируем хук


function Header() {

  const { user, isAuthenticated, logout } = useAuth();
  // ========== СОСТОЯНИЯ ==========
  const [categories, setCategories] = useState([]);      // список категорий для меню
  const [loading, setLoading] = useState(true);          // загрузка категорий
  const [activeMenu, setActiveMenu] = useState(null);    // какое меню открыто (для десктопа)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // меню на мобилках
  const [searchQuery, setSearchQuery] = useState('');     // поисковый запрос
  
  const navigate = useNavigate();

  // ========== ЗАГРУЗКА КАТЕГОРИЙ ==========
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Загружаем дерево категорий
        const response = await categoriesApi.getTree();
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        // Если не удалось загрузить, показываем заглушку или пустое меню
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ========== ОБРАБОТЧИКИ ==========
  
  // Поиск
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  // Переход в категорию
  const handleCategoryClick = (slug) => {
    navigate(`/products?category=${slug}`);
    setActiveMenu(null);
    setMobileMenuOpen(false);
  };

  // Открытие/закрытие мобильного меню
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
  
  // Рекурсивное отображение подменю
  const renderSubMenu = (items, level = 0) => {
    if (!items || items.length === 0) return null;
    
    return (
      <ul className={`submenu level-${level}`}>
        {items.map(item => (
          <li 
            key={item.id} 
            className="menu-item"
            onMouseEnter={() => setActiveMenu(item.id)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link 
              to={`/products?category=${item.slug}`}
              onClick={() => handleCategoryClick(item.slug)}
              className="menu-link"
            >
              {item.name}
              {item.children && item.children.length > 0 && (
                <span className="arrow">›</span>
              )}
            </Link>
            
            {/* Рекурсивно отображаем подкатегории */}
            {item.children && item.children.length > 0 && (
              renderSubMenu(item.children, level + 1)
            )}
          </li>
        ))}
      </ul>
    );
  };

  // ========== РЕНДЕРИНГ ==========
  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <div className="logo">
          <Link to="/">
            <h1>Marketplace</h1>
          </Link>
        </div>

        {/* Поиск (десктоп) */}
        <form className="search-form" onSubmit={handleSearch}>
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

        {/* Иконки пользователя и корзины */}
        <div className="user-actions">
          <Link to="/cart" className="cart-icon">
            🛒 Корзина
          </Link>
          <Link to="/profile" className="profile-icon">
            👤 Профиль
          </Link>
        </div>

        {/* Кнопка мобильного меню */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Навигационное меню категорий (десктоп) */}
      <nav className="categories-nav">
        <div className="categories-container">
          {loading ? (
            <div className="categories-loading">Загрузка...</div>
          ) : (
            <ul className="main-menu">
              {categories.map(category => (
                <li 
                  key={category.id} 
                  className="main-menu-item"
                  onMouseEnter={() => setActiveMenu(category.id)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <Link 
                    to={`/products?category=${category.slug}`}
                    className="main-menu-link"
                  >
                    {category.name}
                    {category.children && category.children.length > 0 && (
                      <span className="arrow">▼</span>
                    )}
                  </Link>
                  
                  {/* Подменю */}
                  {category.children && category.children.length > 0 && (
                    renderSubMenu(category.children)
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Мобильное меню */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Поиск в мобильном меню */}
        <form className="mobile-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
          />
          <button type="submit" className="mobile-search-button">
            Найти
          </button>
        </form>

        {/* Категории в мобильном меню */}
        <div className="mobile-categories">
          <h3>Категории</h3>
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            <ul className="mobile-categories-list">
              {categories.map(category => (
                <li key={category.id}>
                  <Link 
                    to={`/products?category=${category.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {category.children && category.children.length > 0 && (
                    <ul className="mobile-subcategories">
                      {category.children.map(child => (
                        <li key={child.id}>
                          <Link 
                            to={`/products?category=${child.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Ссылки на пользовательские разделы в мобильном меню */}
        <div className="mobile-user-actions">
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
            🛒 Корзина
          </Link>
          <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
            👤 Профиль
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;