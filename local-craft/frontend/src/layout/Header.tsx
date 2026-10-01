import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import { ROLE_LABELS } from '../../utils/constants';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-soft-clay/50">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🏺</span>
            <span className="font-headline-lg text-xl font-bold text-deep-earth group-hover:text-primary transition-colors">
              CraftLocal
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/workshops" className="text-on-surface hover:text-primary transition-colors font-medium text-[15px]">
              Trải nghiệm
            </Link>
            <Link to="/products" className="text-on-surface hover:text-primary transition-colors font-medium text-[15px]">
              Sản phẩm
            </Link>
            <Link to="/about" className="text-on-surface hover:text-primary transition-colors font-medium text-[15px]">
              Giới thiệu
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/cart" className="relative p-2 hover:bg-soft-clay rounded-full transition-colors">
              <ShoppingCart size={20} className="text-on-surface" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 hover:bg-soft-clay rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <span className="text-sm font-medium text-on-surface max-w-[120px] truncate">{user.fullName}</span>
                  <ChevronDown size={14} className={`text-outline transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-soft-clay py-2 z-50">
                      <div className="px-4 py-2 border-b border-soft-clay">
                        <p className="text-sm font-semibold text-on-surface">{user.fullName}</p>
                        <p className="text-xs text-outline">{user.email}</p>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{ROLE_LABELS[user.role] || user.role}</span>
                      </div>
                      <Link
                        to={getRoleRedirectPath(user.role)}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-soft-clay transition-colors"
                      >
                        <User size={16} /> Bảng điều khiển
                      </Link>
                      {user.role === 'TOURIST' && (
                        <>
                          <Link to="/my-bookings" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-soft-clay transition-colors">
                            Lịch đặt của tôi
                          </Link>
                          <Link to="/my-orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-soft-clay transition-colors">
                            Đơn hàng của tôi
                          </Link>
                        </>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error/5 transition-colors"
                      >
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 hover:bg-soft-clay rounded-lg transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-soft-clay py-4 space-y-1 animate-[slideDown_0.2s_ease-out]">
            <Link to="/workshops" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-on-surface hover:bg-soft-clay rounded-lg">
              Trải nghiệm
            </Link>
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-on-surface hover:bg-soft-clay rounded-lg">
              Sản phẩm
            </Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-on-surface hover:bg-soft-clay rounded-lg">
              Giới thiệu
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link to={getRoleRedirectPath(user.role)} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-on-surface hover:bg-soft-clay rounded-lg">
                  Bảng điều khiển
                </Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-error hover:bg-error/5 rounded-lg">
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-primary border border-primary rounded-lg">
                  Đăng nhập
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg">
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
