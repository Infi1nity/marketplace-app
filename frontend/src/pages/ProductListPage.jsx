import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/products';
import './ProductListPage.css';

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageInput, setPageInput] = useState('');
  
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || null;

  const ITEMS_PER_PAGE = 12;
  const maxPageButtons = 5;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const skip = (currentPage - 1) * ITEMS_PER_PAGE;
        
        const params = {
          skip: skip,
          limit: ITEMS_PER_PAGE,
          ...(searchQuery && { search: searchQuery }),
          ...(categorySlug && { category_slug: categorySlug }),
        };
        
        const response = await productsApi.getAll(params);
        
        // Handle different response formats
        if (response && typeof response === 'object') {
          if (response.items) {
            setProducts(response.items);
            if (response.total !== undefined) {
              setTotalProducts(response.total);
            }
          } else if (Array.isArray(response)) {
            setProducts(response);
            setTotalProducts(response.length);
          } else {
            console.warn('Unexpected response format:', response);
            setProducts([]);
          }
        } else {
          setProducts([]);
        }
        
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Ошибка при загрузке товаров');
        console.error('Error fetching products:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, searchQuery, categorySlug]);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setPageInput('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput, 10);
    if (page >= 1 && page <= totalPages) {
      goToPage(page);
    } else {
      setPageInput('');
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = startPage + maxPageButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Загрузка товаров...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-page">
        <div className="error-container">
          <h2>Ошибка!</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <div className="products-info">
        <p>Найдено товаров: {totalProducts || products.length}</p>
        {(searchQuery || categorySlug) && (
          <p className="search-info">
            {searchQuery && `По запросу: "${searchQuery}"`}
            {categorySlug && `Категория: ${categorySlug}`}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>Товары не найдены</p>
          {(searchQuery || categorySlug) && (
            <p>Попробуйте изменить параметры поиска</p>
          )}
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                className="pagination-button pagination-first"
                title="Первая страница"
              >
                ««
              </button>
              
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                «
              </button>
              
              {getPageNumbers().map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                »
              </button>
              
              <button
                onClick={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-button pagination-last"
                title="Последняя страница"
              >
                »»
              </button>
              
              <form onSubmit={handlePageInputSubmit} className="page-input-form">
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  placeholder="..."
                  className="page-input"
                />
                <button type="submit" className="page-input-button">
                  →
                </button>
              </form>
            </div>
          )}
          
          {totalPages > 1 && (
            <p className="page-info">
              Страница {currentPage} из {totalPages}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default ProductListPage;
