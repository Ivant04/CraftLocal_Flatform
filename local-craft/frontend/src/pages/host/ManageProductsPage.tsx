import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import productApi from '../../api/productApi';
import { normalizeProduct } from '../../utils/normalizers';
import type { Product } from '../../types/product.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Loading from '../../components/common/Loading';

const ManageProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    productApi
      .getByHost()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setProducts(Array.isArray(list) ? list.map(normalizeProduct) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${p.name}"?`)) return;
    setBusyId(p._id);
    try {
      await productApi.delete(p._id);
      setProducts((prev) => prev.filter((item) => item._id !== p._id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Xóa sản phẩm thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý sản phẩm</h1>
        <Link to="/host/products/create"><Button size="sm"><Plus size={16} className="mr-1" /> Thêm sản phẩm</Button></Link>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-10 text-center text-on-surface-variant text-sm">
          Bạn chưa có sản phẩm nào.
        </div>
      ) : (
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
                  <td className="p-4"><div className="flex items-center gap-3"><ImageWithFallback src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" /><span className="font-medium">{p.name}</span></div></td>
                  <td className="p-4 text-primary font-medium">{formatCurrencyShort(p.price)}</td>
                  <td className="p-4">{p.stock}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stock > 0 ? 'Còn hàng' : 'Hết hàng'}</span></td>
                  <td className="p-4"><div className="flex gap-2">
                    <Link to={`/host/products/${p._id}/edit`} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Edit size={14} /></Link>
                    <button
                      type="button"
                      disabled={busyId === p._id}
                      onClick={() => handleDelete(p)}
                      className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageProductsPage;
