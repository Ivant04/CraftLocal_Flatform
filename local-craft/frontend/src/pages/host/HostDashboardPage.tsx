import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, DollarSign, BookOpen, ShoppingBag, Plus, UserPlus, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import dashboardApi from '../../api/dashboardApi';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';

interface HostDashboardData {
  totalWorkshops: number;
  totalTimeslots: number;
  totalBookings: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  todaySchedules: Array<{
    _id: string;
    startTime: string;
    endTime: string;
    bookedSlots: number;
    totalSlots: number;
    workshopId?: { title?: string };
    tourGuideId?: { fullName?: string };
  }>;
  topWorkshops: Array<{
    _id: string;
    title: string;
    totalBookings: number;
    averageRating: number;
  }>;
}

const quickActions = [
  { label: 'Thêm Workshop', desc: 'Tạo workshop mới', to: '/host/workshops/create', icon: <Plus size={20} /> },
  { label: 'Thêm sản phẩm', desc: 'Đăng sản phẩm bán', to: '/host/products/create', icon: <Plus size={20} /> },
  { label: 'Quản lý HĐV', desc: 'Danh sách hướng dẫn viên', to: '/host/tour-guides', icon: <UserPlus size={20} /> },
  { label: 'Gán HĐV', desc: 'Phân công cho workshop', to: '/host/assign-guide', icon: <UserPlus size={20} /> },
];

const HostDashboardPage: React.FC = () => {
  const [data, setData] = useState<HostDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    dashboardApi
      .getHostStats()
      .then((res) => {
        if (!active) return;
        setData(res.data?.data || null);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được dữ liệu dashboard.');
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
    { label: 'Tổng lượt đặt', value: data.totalBookings, icon: <CalendarCheck size={22} />, color: 'bg-blue-500' },
    { label: 'Tổng doanh thu', value: formatCurrencyShort(data.totalRevenue), icon: <DollarSign size={22} />, color: 'bg-emerald-500' },
    { label: 'Số Workshop', value: data.totalWorkshops, icon: <BookOpen size={22} />, color: 'bg-purple-500' },
    { label: 'Đơn hàng chờ xử lý', value: data.pendingOrders, icon: <ShoppingBag size={22} />, color: 'bg-amber-500' },
  ];

  const topChartData = (data.topWorkshops || []).map((w) => ({
    name: w.title.length > 18 ? `${w.title.slice(0, 18)}…` : w.title,
    bookings: w.totalBookings || 0,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-lg text-headline-md text-[#3D2B1F]">Bảng điều khiển</h1>
        <p className="text-[#7A6255] text-sm mt-1">Chào mừng trở lại, Chủ xưởng!</p>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EAD8CC] p-6">
          <h2 className="font-semibold text-lg text-[#3D2B1F] mb-5">Workshop nổi bật (Lượt đặt)</h2>
          {topChartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-[#7A6255]">
              Chưa có dữ liệu workshop nào.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAD8CC" />
                <XAxis dataKey="name" tick={{ fill: '#7A6255', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#7A6255', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #EAD8CC' }} />
                <Bar dataKey="bookings" name="Lượt đặt" fill="#964824" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-6">
          <h2 className="font-semibold text-lg text-[#3D2B1F] mb-5">Thao tác nhanh</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link key={a.to} to={a.to} className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-[#FAF7F2] transition-all group/item">
                <div className="w-10 h-10 rounded-xl bg-[#964824]/10 flex items-center justify-center text-[#964824] group-hover/item:bg-[#964824]/20 transition-colors">{a.icon}</div>
                <div className="flex-1"><p className="text-sm font-semibold text-[#3D2B1F]">{a.label}</p><p className="text-xs text-[#7A6255]">{a.desc}</p></div>
                <ArrowRight size={14} className="text-[#7A6255] opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
          {data.todaySchedules.length > 0 && (
            <div className="mt-6 pt-5 border-t border-[#EAD8CC]">
              <h3 className="text-sm font-semibold text-[#3D2B1F] mb-3">Lịch hôm nay ({data.todaySchedules.length})</h3>
              <div className="space-y-2">
                {data.todaySchedules.slice(0, 3).map((ts) => (
                  <div key={ts._id} className="text-xs p-2.5 rounded-xl bg-[#FAF7F2] flex items-center justify-between gap-2">
                    <span className="font-medium text-[#3D2B1F] truncate">{ts.workshopId?.title || 'Workshop'}</span>
                    <span className="text-[#964824] font-semibold shrink-0">{formatTime(ts.startTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostDashboardPage;
