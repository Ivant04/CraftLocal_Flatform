import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, ChevronDown, Calendar, Package, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useNearbyModal } from '../../context/NearbyModalContext';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import { ROLE_LABELS } from '../../utils/constants';
import BrandLogo from '../common/BrandLogo';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { openNearbyModal, openItineraryModal } = useNearbyModal();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-sm font-semibold transition-all duration-200 rounded-lg ${
      isActive
        ? 'text-[#964824] bg-[#964824]/8 font-bold'
        : 'text-[#3D2B1F] hover:text-[#964824] hover:bg-[#FAF7F2]'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAD8CC]/80 shadow-[0_4px_20px_rgba(61,43,31,0.04)]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="CRAFT - Tinh hoa nghề Việt">
            <BrandLogo theme="light" size="md" showTagline />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/workshops" className={navLinkClass}>
              Trải nghiệm Workshop
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Sản phẩm thủ công
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              Về chúng tôi
            </NavLink>
            <button
              type="button"
              onClick={() => openItineraryModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#3D2B1F] bg-[#FAF7F2] hover:bg-[#964824] hover:text-white rounded-xl transition-all duration-200 cursor-pointer border border-[#EAD8CC] hover:border-[#964824] ml-1"
              title="Gợi ý lịch trình 1 ngày trải nghiệm làng nghề & cà phê nghỉ ngơi"
            >
              <Calendar size={13} className="shrink-0 text-[#964824]" />
              <span>Lịch trình 1 ngày</span>
            </button>
            <button
              type="button"
              onClick={openNearbyModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#964824] bg-[#964824]/10 hover:bg-[#964824] hover:text-white rounded-xl transition-all duration-200 cursor-pointer border border-[#964824]/20 ml-1"
              title="Trò chuyện với Trợ lý AI CraftLocal - Đề xuất vị trí & thời tiết"
            >
              <Sparkles size={13} className="shrink-0 text-[#964824]" />
              <span>Trợ lý AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#964824] animate-pulse" />
            </button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2.5 md:gap-3.5">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl border border-[#EAD8CC] bg-[#FAF7F2] hover:bg-white text-[#3D2B1F] hover:text-[#964824] hover:border-[#964824]/40 transition-all duration-200"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart size={19} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-[#964824] text-white text-[11px] font-extrabold rounded-full flex items-center justify-center shadow-sm animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile or Auth Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-[#EAD8CC] bg-[#FAF7F2] hover:bg-white transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-[#964824] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      user.fullName?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#3D2B1F] max-w-[110px] truncate leading-tight">
                      {user.fullName}
                    </span>
                    <span className="text-[10px] text-[#7A6255] uppercase font-semibold">
                      {ROLE_LABELS[user.role] || user.role}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-[#7A6255] transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAD8CC] p-2 z-50 animate-scaleIn">
                      <div className="px-3.5 py-3 border-b border-[#EAD8CC]/60 mb-1">
                        <p className="text-sm font-bold text-[#3D2B1F] truncate">{user.fullName}</p>
                        <p className="text-xs text-[#7A6255] truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-extrabold px-2 py-0.5 bg-[#964824]/10 text-[#964824] rounded-full uppercase">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </div>

                      <Link
                        to={getRoleRedirectPath(user.role)}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-colors"
                      >
                        <Sparkles size={16} className="text-[#964824]" />
                        <span>Bảng điều khiển</span>
                      </Link>

                      {user.role === 'TOURIST' && (
                        <>
                          <Link
                            to="/my-bookings"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-colors"
                          >
                            <Calendar size={16} className="text-[#7A6255]" />
                            <span>Vé & Lịch đặt chỗ</span>
                          </Link>
                          <Link
                            to="/my-orders"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-colors"
                          >
                            <Package size={16} className="text-[#7A6255]" />
                            <span>Đơn hàng của tôi</span>
                          </Link>
                        </>
                      )}

                      <div className="pt-1 mt-1 border-t border-[#EAD8CC]/60">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        >
                          <LogOut size={16} />
                          <span>Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-[#3D2B1F] hover:text-[#964824] hover:bg-[#FAF7F2] rounded-xl transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#964824] hover:bg-[#7A3518] rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl border border-[#EAD8CC] bg-[#FAF7F2] hover:bg-white text-[#3D2B1F] transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[#EAD8CC] py-4 space-y-1.5 animate-slideDown">
            <Link
              to="/workshops"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl"
            >
              Trải nghiệm Workshop
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl"
            >
              Sản phẩm thủ công
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl"
            >
              Về chúng tôi
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openItineraryModal();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-[#3D2B1F] bg-[#FAF7F2] rounded-xl cursor-pointer my-1 border border-[#EAD8CC]"
            >
              <span className="flex items-center gap-2">
                <Calendar size={16} className="text-[#964824]" />
                <span>Lịch trình 1 ngày (AI)</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Mới
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openNearbyModal();
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold text-[#964824] bg-[#964824]/10 rounded-xl cursor-pointer my-1"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={16} />
                <span>Trợ lý AI Làng nghề</span>
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#964824] text-white">
                AI
              </span>
            </button>

            {isAuthenticated && user ? (
              <div className="pt-2 border-t border-[#EAD8CC]">
                <Link
                  to={getRoleRedirectPath(user.role)}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 text-sm font-bold text-[#964824]"
                >
                  Bảng điều khiển ({ROLE_LABELS[user.role] || user.role})
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-2 pt-3 border-t border-[#EAD8CC]">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs font-bold text-[#3D2B1F] border border-[#EAD8CC] rounded-xl"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="text-center py-2.5 text-xs font-bold text-white bg-[#964824] rounded-xl"
                >
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
