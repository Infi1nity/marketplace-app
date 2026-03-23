import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage'
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { FavoritesProvider } from './contexts/FavoritesContext';
import FavoritesPage from './pages/FavoritesPage';
// import { CartProvider } from './path/to/CartProvider';
import { OrdersProvider } from './contexts/OrdersContext';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>  {/* 👈 ВОТ ТАК - оборачиваем всё, что использует авторизацию */}
        {/* <CartProvider> */}
          <FavoritesProvider>
            <OrdersProvider>
              <Header />
              <main className="main-content">
                {/* Навигационное меню */}
                <nav>
                  {/* <ul>
                    <li><Link to="/">Главная</Link></li>
                    <li><Link to="/products">Товары</Link></li>
                  </ul> */}
                </nav>

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/catalog" element={<Catalog />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="*" element={<NotFound />} />
                  <Route path="/products" element={<ProductListPage />} />
                  <Route path="/products/:slug" element={<ProductDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />      {/* 👈 Новый маршрут */}
                  <Route path="/orders" element={<OrdersPage />} />          {/* 👈 Новый маршрут */}
                  <Route path="/orders/:orderId" element={<OrderDetailPage />} /> {/* 👈 Новый маршрут */}
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="*" element={<NotFound />} />
                  
                </Routes>
              </main>
            </OrdersProvider>
          </FavoritesProvider>
        {/* </CartProvider> */}
      </AuthProvider>  {/* 👈 Закрываем провайдер */}
    </BrowserRouter>
  );
}

export default App;


// проверка CORS
// export default function CorsTest() {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetch('http://localhost:8000/')
//       .then(res => res.json())
//       .then(data => {
//         setData(data);
//         console.log('✅ CORS работает! Ответ:', data);
//       })
//       .catch(err => {
//         setError(err.message);
//         console.error('❌ Ошибка CORS:', err);
//       });
//   }, []);

//   if (error) return <div style={{color: 'red'}}>Ошибка: {error}</div>;
//   if (!data) return <div>Проверка CORS...</div>;
//   return <div style={{color: 'green'}}>✅ CORS работает! Ответ: {JSON.stringify(data)}</div>;
// }