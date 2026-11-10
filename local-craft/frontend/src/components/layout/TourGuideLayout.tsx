import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, QrCode, Menu } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';

const guideLinks = [
  { to: '/tour-guide/dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} /> },
  { to: '/tour-guide/schedules', label: 'Lịch phân công', icon: <Calendar size={18} /> },
  { to: '/tour-guide/check-in', label: 'Check-in QR', icon: <QrCode size={18} /> },
];

const TourGuideLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar links={guideLinks} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} title="Hướng dẫn viên" />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-soft-clay bg-white flex items-center px-4 lg:px-8 gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-soft-clay rounded-lg">
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-deep-earth">Hướng dẫn viên</h1>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TourGuideLayout;
