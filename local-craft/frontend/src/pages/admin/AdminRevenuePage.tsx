import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import adminApi from '../../api/adminApi';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Loading from '../../components/common/Loading';

const AdminRevenuePage: React.FC = () => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
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
        setTotalRevenue(Number(d.totalRevenue ?? 0));
        setMonthlyRevenue(Array.isArray(d.monthlyRevenue) ? d.monthlyRevenue : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được thống kê doanh thu.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <div className="py-20 flex justify-center"><Loading /></div>;
  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const avgMonthly = monthlyRevenue.length > 0 ? totalRevenue / monthlyRevenue.length : 0;

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Thống kê doanh thu</h1>
      <div className="bg-white rounded-xl border border-soft-clay p-6">
        <h2 className="font-semibold text-lg text-deep-earth mb-4">Doanh thu theo tháng</h2>
        {monthlyRevenue.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-on-surface-variant">
            Chưa có dữ liệu doanh thu theo tháng.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E9E4D9" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v: number) => formatCurrencyShort(v)} />
              <Bar dataKey="revenue" fill="#964824" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="bg-white rounded-xl border border-soft-clay p-6">
        <h2 className="font-semibold text-lg text-deep-earth mb-4">Tổng quan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-soft-clay/30 rounded-xl"><p className="text-sm text-on-surface-variant">Tổng doanh thu</p><p className="text-2xl font-bold text-primary">{formatCurrencyShort(totalRevenue)}</p></div>
          <div className="p-4 bg-soft-clay/30 rounded-xl"><p className="text-sm text-on-surface-variant">Trung bình/tháng</p><p className="text-2xl font-bold text-primary">{formatCurrencyShort(avgMonthly)}</p></div>
        </div>
      </div>
    </div>
  );
};

export default AdminRevenuePage;
