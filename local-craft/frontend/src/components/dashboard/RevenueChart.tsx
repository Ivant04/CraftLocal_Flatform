import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrencyShort } from '../../utils/formatCurrency';

interface RevenueChartProps {
  data: { month: string; revenue: number }[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#E9E4D9" />
      <XAxis dataKey="month" />
      <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
      <Tooltip formatter={(v: number) => formatCurrencyShort(v)} />
      <Bar dataKey="revenue" fill="#964824" radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export default RevenueChart;
