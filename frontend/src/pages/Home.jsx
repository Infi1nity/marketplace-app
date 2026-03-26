import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import ProductCard from '../components/ProductCard';
import { productsApi } from '../services/products';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchParams] = useSearchParams();
  const [pageInput, setPageInput] = useState('');

  const searchQuery = searchParams.get('search') || '';
  const categorySlug = searchParams.get('category') || '';

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    loadProducts(1);
  }, [searchQuery, categorySlug]);

  const loadProducts = async (page = currentPage) => {
    try {
      setLoading(true);
      const skip = (page - 1) * ITEMS_PER_PAGE;
      const params = { skip, limit: ITEMS_PER_PAGE };
      
      if (searchQuery) params.search = searchQuery;
      if (categorySlug) params.category_slug = categorySlug;
      
      const response = await productsApi.getAll(params);
      
      if (response && typeof response === 'object') {
        if (response.items) {
          setProducts(response.items);
          if (response.total !== undefined) setTotalProducts(response.total);
        } else if (Array.isArray(response)) {
          setProducts(response);
          setTotalProducts(response.length);
        }
      }
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadProducts(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInput = (e) => {
    e.preventDefault();
    const page = parseInt(pageInput);
    if (!isNaN(page)) {
      goToPage(page);
    }
    setPageInput('');
  };

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1;

  if (loading) {
    return (
      <div className="brutal-loading">
        <div className="brutal-loading-spinner"></div>
        <p>ЗАГРУЗКА...</p>
      </div>
    );
  }

  return (
    <div className="brutal-home">
      <main className="brutal-main">
        <section className="brutal-products">
          {(searchQuery || categorySlug) && (
            <div className="brutal-search-info">
              {searchQuery && <p>Результаты поиска: "{searchQuery}"</p>}
              {categorySlug && <p>Категория: {categorySlug}</p>}
            </div>
          )}
          
          {products.length === 0 ? (
            <div className="brutal-no-products">
              <p>ТОВАРЫ НЕ НАЙДЕНЫ</p>
            </div>
          ) : (
            <>
              <div className="brutal-products-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="brutal-pagination">
                  <div className="brutal-pagination-nav">
                    <button 
                      onClick={() => goToPage(1)} 
                      disabled={currentPage === 1} 
                      className="brutal-pagination-btn"
                      title="Первая страница"
                    >
                      ««
                    </button>
                    <button 
                      onClick={() => goToPage(currentPage - 1)} 
                      disabled={currentPage === 1} 
                      className="brutal-pagination-btn"
                      title="Предыдущая"
                    >
                      «
                    </button>
                    
                    <div className="brutal-pagination-pages">
                      <span className="brutal-pagination-info">
                        {currentPage} / {totalPages}
                      </span>
                    </div>
                    
                    <button 
                      onClick={() => goToPage(currentPage + 1)} 
                      disabled={currentPage === totalPages} 
                      className="brutal-pagination-btn"
                      title="Следующая"
                    >
                      »
                    </button>
                    <button 
                      onClick={() => goToPage(totalPages)} 
                      disabled={currentPage === totalPages} 
                      className="brutal-pagination-btn"
                      title="Последняя страница"
                    >
                      »»
                    </button>
                  </div>
                  
                  <div className="brutal-pagination-jump">
                    <form onSubmit={handlePageInput} className="brutal-page-jump">
                      <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        placeholder="#"
                        className="brutal-page-input"
                      />
                      <button type="submit" className="brutal-page-go">
                        →
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
