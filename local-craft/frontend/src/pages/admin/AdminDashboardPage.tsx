import React from 'react';
import { Users, UserCheck, CalendarCheck, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardStats, bookings } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';

const stats = [
  { label: 'Tổng người dùng', value: dashboardStats.admin.totalUsers, icon: <Users size={22} />, color: 'bg-blue-500' },
  { label: 'Tổng Chủ xưởng', value: dashboardStats.admin.totalHosts, icon: <UserCheck size={22} />, color: 'bg-emerald-500' },
  { label: 'Tổng lượt đặt', value: dashboardStats.admin.totalBookings, icon: <CalendarCheck size={22} />, color: 'bg-purple-500' },
  { label: 'Tổng doanh thu', value: formatCurrencyShort(dashboardStats.admin.totalRevenue), icon: <DollarSign size={22} />, color: 'bg-amber-500' },
];

const AdminDashboardPage: React.FC = () => (
  <div className="space-y-8">
    <div>
      <h1 className="font-headline-lg text-headline-md text-[#3D2B1F]">Bảng điều khiển</h1>
      <p className="text-[#7A6255] text-sm mt-1">Tổng quan hệ thống CraftLocal</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.08)] transition-all group">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>{s.icon}</div>
            <div><p className="text-sm text-[#7A6255] font-medium">{s.label}</p><p className="text-2xl font-bold text-[#3D2B1F] tracking-tight">{s.value}</p></div>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-6">
        <h2 className="font-semibold text-lg text-[#3D2B1F] mb-5">Doanh thu theo tháng</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dashboardStats.admin.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EAD8CC" />
            <XAxis dataKey="month" tick={{ fill: '#7A6255', fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fill: '#7A6255', fontSize: 12 }} />
            <Tooltip formatter={(v: number) => formatCurrencyShort(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #EAD8CC' }} />
            <Bar dataKey="revenue" fill="#964824" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-6">
        <h2 className="font-semibold text-lg text-[#3D2B1F] mb-5">Lượt đặt gần đây</h2>
        <div className="space-y-3">
          {bookings.slice(0, 4).map((b) => (
            <div key={b._id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#FAF7F2] transition-colors">
              <div><p className="font-medium text-sm text-[#3D2B1F]">{b.touristName}</p><p className="text-xs text-[#7A6255] mt-0.5">{b.workshopTitle}</p></div>
              <span className="text-xs font-semibold px-3 py-1.5 bg-[#964824]/10 text-[#964824] rounded-full">{BOOKING_STATUS_LABELS[b.status]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboardPage;
