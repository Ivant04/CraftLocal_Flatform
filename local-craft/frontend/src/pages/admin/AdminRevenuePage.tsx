import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardStats } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';

const AdminRevenuePage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="font-headline-lg text-headline-md text-deep-earth">Thống kê doanh thu</h1>
    <div className="bg-white rounded-xl border border-soft-clay p-6">
      <h2 className="font-semibold text-lg text-deep-earth mb-4">Doanh thu theo tháng</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={dashboardStats.admin.monthlyRevenue}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9E4D9" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
          <Tooltip formatter={(v: number) => formatCurrencyShort(v)} />
          <Bar dataKey="revenue" fill="#964824" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white rounded-xl border border-soft-clay p-6">
      <h2 className="font-semibold text-lg text-deep-earth mb-4">Tổng quan</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-soft-clay/30 rounded-xl"><p className="text-sm text-on-surface-variant">Tổng doanh thu</p><p className="text-2xl font-bold text-primary">{formatCurrencyShort(dashboardStats.admin.totalRevenue)}</p></div>
        <div className="p-4 bg-soft-clay/30 rounded-xl"><p className="text-sm text-on-surface-variant">Trung bình/tháng</p><p className="text-2xl font-bold text-primary">{formatCurrencyShort(dashboardStats.admin.totalRevenue / 6)}</p></div>
      </div>
    </div>
  </div>
);

export default AdminRevenuePage;
