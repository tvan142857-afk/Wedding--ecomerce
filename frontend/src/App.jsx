import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import { AuthProvider } from './store/AuthContext.jsx';
import { CartProvider } from './store/CartContext.jsx';
import Home from './pages/Home.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Admin from './pages/Admin.jsx';
import { Login, Register } from './pages/Auth.jsx';

function NotFound() {
  return (
    <div className="card empty-cart">
      <h1>Không tìm thấy trang</h1>
      <p className="muted">Trang bạn tìm không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/" className="btn btn-primary">Về trang chủ</Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Header />
          <main className="container main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="container">
              <p>💍 L'amour Wedding — Cửa hàng wedding cho ngày trọng đại của bạn.</p>
              <p className="muted small">Thanh toán COD hoặc Stripe (test).</p>
            </div>
          </footer>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
