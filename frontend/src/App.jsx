import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import ProductListPage from './pages/ProductListPage';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';
import ProductDetailPage from './pages/ProductDetailPage';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { FavoritesProvider } from './contexts/FavoritesContext';
import FavoritesPage from './pages/FavoritesPage';
import { CartProvider } from './contexts/CartContext';
import { OrdersProvider } from './contexts/OrdersContext';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import CartPage from './pages/CartPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <OrdersProvider>
              <Header />
              <main className="main-content">
                <Routes>
                  {/* Главная страница - показывает все товары */}
                  <Route path="/" element={<ProductListPage />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </OrdersProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
