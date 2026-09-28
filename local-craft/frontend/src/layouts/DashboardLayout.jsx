import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const DashboardLayout = () => {
  const { user } = useAuth();

  const renderNavLinks = () => {
    if (user?.role === 'ADMIN') {
      return (
        <ul className="sidebar-menu">
          <li><NavLink to="/admin" end>📊 Tổng quan hệ thống</NavLink></li>
          <li><NavLink to="/admin?tab=users">👥 Quản lý Người dùng</NavLink></li>
          <li><NavLink to="/admin?tab=artisans">👨‍🎨 Quản lý Nghệ nhân</NavLink></li>
          <li><NavLink to="/admin?tab=workshops">🎪 Quản lý Workshop</NavLink></li>
          <li><NavLink to="/admin?tab=products">📦 Quản lý Sản phẩm</NavLink></li>
          <li><NavLink to="/admin?tab=bookings">📅 Quản lý Bookings</NavLink></li>
          <li><NavLink to="/admin?tab=orders">🛒 Quản lý Đơn hàng</NavLink></li>
          <li><NavLink to="/admin?tab=reviews">⭐ Quản lý Đánh giá</NavLink></li>
          <li><NavLink to="/admin?tab=categories">🏷️ Danh mục</NavLink></li>
          <li><NavLink to="/profile">👤 Thông tin cá nhân</NavLink></li>
        </ul>
      );
    }

    if (user?.role === 'ARTISAN') {
      return (
        <ul className="sidebar-menu">
          <li><NavLink to="/dashboard" end>📊 Tổng quan Nghệ nhân</NavLink></li>
          <li><NavLink to="/dashboard?tab=workshops">🎪 Workshops của tôi</NavLink></li>
          <li><NavLink to="/dashboard?tab=products">📦 Sản phẩm của tôi</NavLink></li>
          <li><NavLink to="/dashboard?tab=bookings">📅 Danh sách Đặt chỗ</NavLink></li>
          <li><NavLink to="/dashboard?tab=orders">🛒 Đơn hàng sản phẩm</NavLink></li>
          <li><NavLink to="/dashboard?tab=reviews">⭐ Đánh giá từ khách</NavLink></li>
          <li><NavLink to="/profile">👤 Hồ sơ nghệ nhân</NavLink></li>
        </ul>
      );
    }

    // Default: CUSTOMER
    return (
      <ul className="sidebar-menu">
        <li><NavLink to="/dashboard" end>📊 Tổng quan tài khoản</NavLink></li>
        <li><NavLink to="/booking">📅 Lịch đặt Workshop của tôi</NavLink></li>
        <li><NavLink to="/orders">🛒 Đơn hàng sản phẩm của tôi</NavLink></li>
        <li><NavLink to="/dashboard?tab=reviews">⭐ Đánh giá của tôi</NavLink></li>
        <li><NavLink to="/profile">👤 Thông tin cá nhân</NavLink></li>
      </ul>
    );
  };

  return (
    <div className="layout-root">
      <Navbar />
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h4>Bảng điều khiển</h4>
            <span className="badge-role">{user?.role}</span>
          </div>
          {renderNavLinks()}
        </aside>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
