import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.08)] transition-all duration-300 group">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-[#7A6255] font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#3D2B1F] tracking-tight">{value}</p>
      </div>
    </div>
  </div>
);

export default StatCard;
