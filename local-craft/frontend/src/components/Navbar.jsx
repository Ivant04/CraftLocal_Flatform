import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    return '/dashboard';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏺</span>
          <span className="logo-text">Local Craft</span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/workshops">Workshops</Link>
          <Link to="/products">Sản phẩm</Link>
        </nav>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="user-menu">
              <Link to={getDashboardPath()} className="btn btn-outline">
                Dashboard ({user?.role})
              </Link>
              <Link to="/profile" className="user-name">
                👤 {user?.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline">
                Đăng nhập
              </Link>
              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
