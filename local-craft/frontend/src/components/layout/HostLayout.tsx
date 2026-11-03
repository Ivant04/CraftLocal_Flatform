import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Clock, Package, ShoppingBag, Users, UserPlus, Menu } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

const hostLinks = [
  { to: '/host/dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
  { to: '/host/workshops', label: 'Quản lý Workshop', icon: <BookOpen size={18} /> },
  { to: '/host/timeslots', label: 'Khung giờ', icon: <Clock size={18} /> },
  { to: '/host/products', label: 'Sản phẩm', icon: <Package size={18} /> },
  { to: '/host/orders', label: 'Đơn hàng', icon: <ShoppingBag size={18} /> },
  { to: '/host/tour-guides', label: 'Hướng dẫn viên', icon: <Users size={18} /> },
  { to: '/host/assign-guide', label: 'Gán HĐV', icon: <UserPlus size={18} /> },
];

const HostLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar links={hostLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Chủ xưởng" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-soft-clay bg-white flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-soft-clay rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-deep-earth">Chủ xưởng</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HostLayout;
