import React, { useEffect, useState } from 'react';
import { Users, UserCheck, CalendarCheck, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminApi from '../../api/adminApi';
import { normalizeBooking } from '../../utils/normalizers';
import type { Booking } from '../../types/booking.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';
import Loading from '../../components/common/Loading';

interface AdminStats {
  totalUsers: number;
  totalHosts: number;
  totalBookings: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number }[];
  recentBookings: Booking[];
}

const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi
      .getDashboard()
      .then((res) => {
        if (!active) return;
        const d = res.data?.data || {};
        setData({
          totalUsers: Number(d.totalUsers ?? 0),
          totalHosts: Number(d.totalHosts ?? 0),
          totalBookings: Number(d.totalBookings ?? 0),
          totalRevenue: Number(d.totalRevenue ?? 0),
          monthlyRevenue: Array.isArray(d.monthlyRevenue) ? d.monthlyRevenue : [],
          recentBookings: Array.isArray(d.recentBookings) ? d.recentBookings.map(normalizeBooking) : [],
        });
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được dữ liệu thống kê.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loading /></div>;
  if (error || !data) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-700 text-sm">
        {error || 'Không tải được dữ liệu.'}
      </div>
    );
  }

  const stats = [
    { label: 'Tổng người dùng', value: data.totalUsers, icon: <Users size={22} />, color: 'bg-blue-500' },
    { label: 'Tổng Chủ xưởng', value: data.totalHosts, icon: <UserCheck size={22} />, color: 'bg-emerald-500' },
    { label: 'Tổng lượt đặt', value: data.totalBookings, icon: <CalendarCheck size={22} />, color: 'bg-purple-500' },
    { label: 'Tổng doanh thu', value: formatCurrencyShort(data.totalRevenue), icon: <DollarSign size={22} />, color: 'bg-amber-500' },
  ];

  return (
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
          {data.monthlyRevenue.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-[#7A6255]">
              Chưa có dữ liệu doanh thu theo tháng.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAD8CC" />
                <XAxis dataKey="month" tick={{ fill: '#7A6255', fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} tick={{ fill: '#7A6255', fontSize: 12 }} />
                <Tooltip formatter={(v: number) => formatCurrencyShort(v)} contentStyle={{ borderRadius: '12px', border: '1px solid #EAD8CC' }} />
                <Bar dataKey="revenue" fill="#964824" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-6">
          <h2 className="font-semibold text-lg text-[#3D2B1F] mb-5">Lượt đặt gần đây</h2>
          {data.recentBookings.length === 0 ? (
            <p className="text-sm text-[#7A6255] py-8 text-center">Chưa có lượt đặt nào.</p>
          ) : (
            <div className="space-y-3">
              {data.recentBookings.slice(0, 5).map((b) => (
                <div key={b._id} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-[#FAF7F2] transition-colors">
                  <div><p className="font-medium text-sm text-[#3D2B1F]">{b.touristName}</p><p className="text-xs text-[#7A6255] mt-0.5">{b.workshopTitle}</p></div>
                  <span className="text-xs font-semibold px-3 py-1.5 bg-[#964824]/10 text-[#964824] rounded-full">{BOOKING_STATUS_LABELS[b.status] || b.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
