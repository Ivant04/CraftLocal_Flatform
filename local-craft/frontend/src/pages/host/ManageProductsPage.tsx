import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { products } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';

const ManageProductsPage: React.FC = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý sản phẩm</h1>
      <Link to="/host/products/create"><Button size="sm"><Plus size={16} className="mr-1" /> Thêm sản phẩm</Button></Link>
    </div>
    <div className="bg-white rounded-xl border border-soft-clay overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-soft-clay bg-soft-clay/30">
          <th className="p-4 text-left font-medium">Sản phẩm</th>
          <th className="p-4 text-left font-medium">Giá</th>
          <th className="p-4 text-left font-medium">Tồn kho</th>
          <th className="p-4 text-left font-medium">Trạng thái</th>
          <th className="p-4 text-left font-medium">Thao tác</th>
        </tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b border-soft-clay/50">
              <td className="p-4"><div className="flex items-center gap-3"><img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div></td>
              <td className="p-4 text-primary font-medium">{formatCurrencyShort(p.price)}</td>
              <td className="p-4">{p.stock}</td>
              <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td>
              <td className="p-4"><div className="flex gap-2">
                <Link to={`/host/products/${p._id}/edit`} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></Link>
                <button className="p-1.5 text-error hover:bg-error/10 rounded-lg"><Trash2 size={14} /></button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ManageProductsPage;
