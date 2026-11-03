import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, EyeOff, Trash2 } from 'lucide-react';
import { workshops } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';

const ManageWorkshopsPage: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý Workshop</h1>
      <Link to="/host/workshops/create"><Button size="sm"><Plus size={16} className="mr-1" /> Thêm Workshop</Button></Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {workshops.map((ws) => (
        <div key={ws._id} className="bg-white rounded-xl border border-soft-clay overflow-hidden">
          <img src={ws.images[0] || '/src/assets/images/pottery-workshop.jpg'} alt={ws.title} className="w-full h-40 object-cover" />
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-sm line-clamp-2">{ws.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${ws.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{ws.status === 'ACTIVE' ? 'Đang hoạt động' : ws.status}</span>
            </div>
            <p className="text-primary font-bold mb-3">{formatCurrencyShort(ws.price)}</p>
            <div className="flex gap-2">
              <Link to={`/host/workshops/${ws._id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit size={12} /> Sửa</Link>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-soft-clay transition-all"><EyeOff size={12} /> Ẩn</button>
              <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-error border border-error/30 rounded-lg hover:bg-error/5 transition-all"><Trash2 size={12} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ManageWorkshopsPage;
