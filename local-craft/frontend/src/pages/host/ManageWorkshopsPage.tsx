import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import workshopApi from '../../api/workshopApi';
import { normalizeWorkshop } from '../../utils/normalizers';
import type { Workshop } from '../../types/workshop.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Loading from '../../components/common/Loading';

const ManageWorkshopsPage: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    workshopApi
      .getByHost()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setWorkshops(Array.isArray(list) ? list.map(normalizeWorkshop) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách workshop.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleToggleVisibility = async (ws: Workshop) => {
    const nextStatus = ws.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    setBusyId(ws._id);
    try {
      await workshopApi.update(ws._id, { status: nextStatus });
      setWorkshops((prev) => prev.map((item) => (item._id === ws._id ? { ...item, status: nextStatus } : item)));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cập nhật trạng thái thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (ws: Workshop) => {
    if (!window.confirm(`Bạn có chắc muốn xóa workshop "${ws.title}"?`)) return;
    setBusyId(ws._id);
    try {
      await workshopApi.delete(ws._id);
      setWorkshops((prev) => prev.filter((item) => item._id !== ws._id));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Xóa workshop thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý Workshop</h1>
        <Link to="/host/workshops/create"><Button size="sm"><Plus size={16} className="mr-1" /> Thêm Workshop</Button></Link>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : workshops.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-10 text-center text-on-surface-variant text-sm">
          Bạn chưa tạo workshop nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workshops.map((ws) => (
            <div key={ws._id} className="bg-white rounded-xl border border-soft-clay overflow-hidden">
              <ImageWithFallback src={ws.images[0]} alt={ws.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-sm line-clamp-2">{ws.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${ws.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {ws.status === 'ACTIVE' ? 'Đang hoạt động' : ws.status === 'HIDDEN' ? 'Đang ẩn' : ws.status}
                  </span>
                </div>
                <p className="text-primary font-bold mb-3">{formatCurrencyShort(ws.price)}</p>
                <div className="flex gap-2">
                  <Link to={`/host/workshops/${ws._id}/edit`} className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Edit size={12} /> Sửa</Link>
                  <button
                    type="button"
                    disabled={busyId === ws._id}
                    onClick={() => handleToggleVisibility(ws)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-soft-clay transition-all cursor-pointer disabled:opacity-50"
                  >
                    {ws.status === 'ACTIVE' ? <><EyeOff size={12} /> Ẩn</> : <><Eye size={12} /> Hiện</>}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === ws._id}
                    onClick={() => handleDelete(ws)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-error border border-error/30 rounded-lg hover:bg-error/5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageWorkshopsPage;
