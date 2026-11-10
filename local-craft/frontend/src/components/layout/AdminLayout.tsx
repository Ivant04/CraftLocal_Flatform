import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UserCheck, TrendingUp, Menu } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/users', label: 'Quản lý người dùng', icon: <Users size={18} /> },
  { to: '/admin/approve-hosts', label: 'Duyệt Chủ xưởng', icon: <UserCheck size={18} /> },
  { to: '/admin/revenue', label: 'Doanh thu', icon: <TrendingUp size={18} /> },
];

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar links={adminLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Quản trị" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-soft-clay bg-white flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-soft-clay rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-deep-earth">Quản trị viên</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
