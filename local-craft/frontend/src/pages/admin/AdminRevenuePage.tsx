import React, { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  ArrowUpRight,
  BarChart3,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import adminApi from '../../api/adminApi';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Loading from '../../components/common/Loading';

interface MonthlyRevenueItem {
  month: string;
  revenue: number;
}

const AdminRevenuePage: React.FC = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenueItem[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getDashboard();
      const d = res.data?.data || {};
      setTotalRevenue(Number(d.totalRevenue ?? 0));
      setTotalBookings(Number(d.totalBookings ?? 0));
      setMonthlyRevenue(Array.isArray(d.monthlyRevenue) ? d.monthlyRevenue : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải thống kê doanh thu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute metrics
  const maxMonth = useMemo(() => {
    if (monthlyRevenue.length === 0) return null;
    return [...monthlyRevenue].sort((a, b) => b.revenue - a.revenue)[0];
  }, [monthlyRevenue]);

  const avgMonthly = useMemo(() => {
    if (monthlyRevenue.length === 0) return 0;
    const sum = monthlyRevenue.reduce((acc, m) => acc + m.revenue, 0);
    return Math.round(sum / monthlyRevenue.length);
  }, [monthlyRevenue]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
            Báo cáo & Phân tích
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
            Doanh thu hệ thống
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Tổng hợp dữ liệu thanh toán từ các dịch vụ trải nghiệm làng nghề và sản phẩm thủ công.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.06)] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#964824] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tổng doanh thu</p>
              <p className="text-xl md:text-2xl font-bold text-[#3D2B1F] tracking-tight">
                {formatCurrencyShort(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.06)] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Trung bình / tháng</p>
              <p className="text-xl md:text-2xl font-bold text-[#3D2B1F] tracking-tight">
                {formatCurrencyShort(avgMonthly)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.06)] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles size={22} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tháng cao điểm</p>
              <p className="text-xl md:text-2xl font-bold text-[#3D2B1F] tracking-tight">
                {maxMonth ? `${maxMonth.month}` : '—'}
              </p>
              {maxMonth && (
                <p className="text-[11px] text-[#7A6255] font-mono">
                  {formatCurrencyShort(maxMonth.revenue)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.06)] transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tổng lượt đặt chỗ</p>
              <p className="text-xl md:text-2xl font-bold text-[#3D2B1F] tracking-tight">
                {totalBookings}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Chart Section */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif font-bold text-lg text-[#3D2B1F]">
              Biểu đồ doanh thu theo tháng
            </h2>
            <p className="text-xs text-[#7A6255] mt-0.5">
              Thống kê dòng tiền lũy kế theo các chu kỳ tháng trong năm.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#EAD8CC] self-start sm:self-auto">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-white text-[#964824] shadow-xs'
                  : 'text-[#7A6255] hover:text-[#3D2B1F]'
              }`}
            >
              Cột (Bar)
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-[#964824] shadow-xs'
                  : 'text-[#7A6255] hover:text-[#3D2B1F]'
              }`}
            >
              Vùng (Area)
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-[320px] flex items-center justify-center">
            <Loading />
          </div>
        ) : monthlyRevenue.length === 0 ? (
          <div className="h-[320px] flex flex-col items-center justify-center text-center p-6 text-[#7A6255]">
            <BarChart3 size={44} className="text-[#964824] opacity-40 mb-3" />
            <p className="font-semibold text-sm text-[#3D2B1F]">Chưa có dữ liệu giao dịch</p>
            <p className="text-xs mt-1">Dữ liệu doanh thu sẽ tự động hiển thị khi phát sinh đơn hàng thành công.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            {chartType === 'bar' ? (
              <BarChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAD8CC" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#7A6255', fontSize: 12 }} axisLine={{ stroke: '#EAD8CC' }} />
                <YAxis
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v}`)}
                  tick={{ fill: '#7A6255', fontSize: 12 }}
                  axisLine={{ stroke: '#EAD8CC' }}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrencyShort(v), 'Doanh thu']}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #EAD8CC',
                    backgroundColor: '#FAF7F2',
                    boxShadow: '0 8px 30px rgba(61,43,31,0.08)',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="revenue" fill="#964824" radius={[8, 8, 0, 0]} maxBarSize={56} />
              </BarChart>
            ) : (
              <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#964824" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#964824" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAD8CC" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#7A6255', fontSize: 12 }} axisLine={{ stroke: '#EAD8CC' }} />
                <YAxis
                  tickFormatter={(v) => (v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` : `${v}`)}
                  tick={{ fill: '#7A6255', fontSize: 12 }}
                  axisLine={{ stroke: '#EAD8CC' }}
                />
                <Tooltip
                  formatter={(v: number) => [formatCurrencyShort(v), 'Doanh thu']}
                  contentStyle={{
                    borderRadius: '16px',
                    border: '1px solid #EAD8CC',
                    backgroundColor: '#FAF7F2',
                    boxShadow: '0 8px 30px rgba(61,43,31,0.08)',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#964824"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Monthly Breakdown Table */}
      {monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden shadow-xs">
          <div className="p-4 md:px-6 border-b border-[#EAD8CC] flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-[#3D2B1F]">
              Bảng kê chi tiết theo tháng
            </h3>
            <span className="text-xs text-[#7A6255]">
              Tổng cộng: <strong className="text-[#964824]">{monthlyRevenue.length} tháng ghi nhận</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#EAD8CC] bg-[#FAF7F2]/80 text-[#7A6255] font-semibold">
                  <th className="py-3 px-4 md:px-6">Tháng</th>
                  <th className="py-3 px-4">Doanh thu ghi nhận</th>
                  <th className="py-3 px-4">Tỷ trọng đóng góp</th>
                  <th className="py-3 px-4 md:px-6 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD8CC]/60 text-[#3D2B1F]">
                {monthlyRevenue.map((item, index) => {
                  const percent = totalRevenue > 0 ? ((item.revenue / totalRevenue) * 100).toFixed(1) : '0';
                  return (
                    <tr key={index} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-4 md:px-6 font-semibold">{item.month}</td>
                      <td className="py-3 px-4 font-bold text-[#964824]">
                        {formatCurrencyShort(item.revenue)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 max-w-xs">
                          <div className="flex-1 h-2 bg-[#EAD8CC]/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#964824] rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, Number(percent)))}%` }}
                            />
                          </div>
                          <span className="text-xs text-[#7A6255] font-mono w-10 text-right">{percent}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 md:px-6 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} /> Đã kết toán
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenuePage;
