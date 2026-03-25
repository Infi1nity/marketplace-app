import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { categoriesApi } from '../services/categories';
import './Header.css';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Header() {
  const auth = useAuth();
  const cart = useCart();

  const user = auth?.user || null;
  const isAuthenticated = auth?.isAuthenticated || false;
  const logout = auth?.logout || (() => {});
  const totalItems = cart?.totalItems || 0;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoriesApi.getTree();
        setCategories(response.data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const handleCategoryClick = (slug) => {
    navigate(`/products?category=${slug}`);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderSubMenu = (items, level = 0) => {
    if (!items || items.length === 0) return null;
    
    return (
      <ul className={`submenu level-${level}`}>
        {items.map(item => (
          <li key={item.id} className="menu-item">
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
            
            {item.children && item.children.length > 0 && (
              renderSubMenu(item.children, level + 1)
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <h1>Marketplace</h1>
          </Link>
        </div>

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

        <div className="user-actions">
          <Link to="/favorites" className="favorites-link">
            ❤️ Избранное
          </Link>
          
          <Link to="/cart" className="cart-link">
            🛒 Корзина
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <div className="profile-menu">
              <Link to="/profile" className="profile-icon">
                👤 {user?.username}
              </Link>
              <button onClick={handleLogout} className="logout-btn">
                Выйти
              </button>
            </div>
          ) : (
            <Link to="/login" className="login-link">
              👤 Войти
            </Link>
          )}
        </div>

        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      <nav className="categories-nav">
        <div className="categories-container">
          {loading ? (
            <div className="categories-loading">Загрузка...</div>
          ) : (
            <ul className="main-menu">
              {categories.map(category => (
                <li key={category.id} className="main-menu-item">
                  <Link 
                    to={`/products?category=${category.slug}`}
                    className="main-menu-link"
                  >
                    {category.name}
                    {category.children && category.children.length > 0 && (
                      <span className="arrow">▼</span>
                    )}
                  </Link>
                  
                  {category.children && category.children.length > 0 && (
                    renderSubMenu(category.children)
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
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

        <div className="mobile-user-actions">
          <Link to="/favorites" onClick={() => setMobileMenuOpen(false)}>
            ❤️ Избранное
          </Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>
            🛒 Корзина
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                👤 Профиль
              </Link>
              <Link to="/orders">📦 Заказы</Link>
              <button onClick={handleLogout} className="mobile-logout-btn">
                Выйти
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              👤 Войти
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
