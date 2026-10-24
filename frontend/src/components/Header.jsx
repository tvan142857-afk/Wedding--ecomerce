import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../store/CartContext.jsx';
import { useAuth } from '../store/AuthContext.jsx';

export default function Header() {
  const { count } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">💍 L'amour Wedding</Link>
        <nav className="nav">
          <NavLink to="/">Trang chủ</NavLink>
          <NavLink to="/orders">Theo dõi đơn hàng</NavLink>
          <NavLink to="/admin">Quản trị</NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/cart" className="cart-link">🛒 Giỏ hàng ({count})</Link>
          {isLoggedIn ? (
            <>
              <span className="user-name">Xin chào, {user?.fullName || user?.name || user?.email || 'bạn'}</span>
              <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">Đăng nhập</Link>
              <Link to="/register" className="btn btn-primary">Đăng ký</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
