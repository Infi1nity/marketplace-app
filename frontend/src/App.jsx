import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import ProductListPage from './pages/ProductListPage';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
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
                  {/* Главная страница */}
                  <Route path="/" element={<Home />} />
                  {/* Каталог товаров */}
                  <Route path="/products" element={<ProductListPage />} />
                  {/* Страница товара по ID */}
                  <Route path="/product/:id" element={<ProductDetail />} />
                  {/* Корзина */}
                  <Route path="/cart" element={<CartPage />} />
                  {/* Профиль */}
                  <Route path="/profile" element={<ProfilePage />} />
                  {/* Авторизация */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  {/* Оформление заказа */}
                  <Route path="/checkout" element={<CheckoutPage />} />
                  {/* Заказы */}
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:orderId" element={<OrderDetailPage />} />
                  {/* Избранное */}
                  <Route path="/favorites" element={<FavoritesPage />} />
                  {/* 404 */}
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
