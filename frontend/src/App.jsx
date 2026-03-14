import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter, Routes, Route, Link } from 'react-router';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import NotFound from './pages/NotFound';


function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Навигационное меню */}
        <nav>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/catalog">Каталог</Link></li>
            <li><Link to="/product/1">Товар 1</Link></li>
            <li><Link to="/product/2">Товар 2</Link></li>
          </ul>
        </nav>

        {/* Здесь React Router будет подставлять компоненты */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
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