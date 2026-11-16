import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Users,
  Clock,
  Headphones,
  Star,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import workshopApi from '../../api/workshopApi';
import { normalizeWorkshop } from '../../utils/normalizers';
import type { Workshop } from '../../types/workshop.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

const ManageWorkshopsPage: React.FC = () => {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');

  // Modal delete state
  const [targetWorkshop, setTargetWorkshop] = useState<Workshop | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workshopApi.getByHost();
      const list = res.data?.data;
      setWorkshops(Array.isArray(list) ? list.map(normalizeWorkshop) : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách workshop.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleToggleVisibility = async (ws: Workshop) => {
    const nextStatus = ws.status === 'ACTIVE' ? 'HIDDEN' : 'ACTIVE';
    setBusyId(ws._id);
    try {
      await workshopApi.update(ws._id, { status: nextStatus } as any);
      setWorkshops((prev) =>
        prev.map((item) => (item._id === ws._id ? { ...item, status: nextStatus } : item))
      );
      setToastMessage({
        type: 'success',
        text: `Workshop "${ws.title}" đã được chuyển sang trạng thái ${
          nextStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ẩn'
        }.`,
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể cập nhật trạng thái workshop.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenDelete = (ws: Workshop) => {
    setTargetWorkshop(ws);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!targetWorkshop) return;
    setDeleteLoading(true);
    try {
      await workshopApi.delete(targetWorkshop._id);
      setWorkshops((prev) => prev.filter((item) => item._id !== targetWorkshop._id));
      setToastMessage({
        type: 'success',
        text: `Đã xóa workshop "${targetWorkshop.title}"`,
      });
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Xóa workshop thất bại.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = workshops.length;
    const active = workshops.filter((w) => w.status === 'ACTIVE').length;
    const hidden = workshops.filter((w) => w.status === 'HIDDEN').length;
    const hasAudio = workshops.filter((w) => Boolean((w as any).audioGuide?.audioUrl)).length;
    return { total, active, hidden, hasAudio };
  }, [workshops]);

  // Filtered workshops
  const filteredWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      const matchSearch =
        !searchTerm.trim() ||
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.locationLabel?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && w.status === 'ACTIVE') ||
        (statusFilter === 'HIDDEN' && w.status === 'HIDDEN');
      return matchSearch && matchStatus;
    });
  }, [workshops, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700'
              : 'bg-rose-900/95 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
            Kênh Quản lý Xưởng
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
            Quản lý Workshop trải nghiệm
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Thiết kế trải nghiệm văn hóa, tích hợp thuyết minh âm thanh AI và quản lý lịch mở lớp.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={fetchWorkshops}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <Link to="/host/workshops/create">
            <Button size="sm" className="inline-flex items-center gap-1.5 shadow-sm">
              <Plus size={16} />
              <span>Tạo Workshop mới</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#964824] text-white flex items-center justify-center shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tổng Workshop</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đang mở đón khách</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-500 text-white flex items-center justify-center shrink-0">
              <EyeOff size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đang tạm ẩn</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.hidden}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Có Audio Guide AI</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{stats.hasAudio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 md:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên workshop, địa điểm..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-[#964824] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
            }`}
          >
            Tất cả ({workshops.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-[#964824] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
            }`}
          >
            Đang hoạt động ({stats.active})
          </button>
          <button
            onClick={() => setStatusFilter('HIDDEN')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              statusFilter === 'HIDDEN'
                ? 'bg-[#964824] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
            }`}
          >
            Tạm ẩn ({stats.hidden})
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Workshop Grid Cards */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loading />
        </div>
      ) : filteredWorkshops.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD8CC] py-16">
          <EmptyState
            title="Chưa có Workshop nào"
            description="Không tìm thấy workshop nào phù hợp với bộ lọc hoặc bạn chưa thiết kế workshop nào."
            icon={<Compass size={44} className="text-[#964824] opacity-50" />}
            action={
              <Link to="/host/workshops/create">
                <Button size="sm">
                  <Plus size={16} className="mr-1" /> Tạo Workshop đầu tiên
                </Button>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWorkshops.map((ws) => {
            const hasAudioGuide = Boolean((ws as any).audioGuide?.audioUrl);
            return (
              <div
                key={ws._id}
                className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden hover:shadow-[0_8px_30px_rgba(61,43,31,0.08)] transition-all flex flex-col group"
              >
                {/* Image Banner */}
                <div className="relative h-48 w-full bg-[#FAF7F2] overflow-hidden">
                  <ImageWithFallback
                    src={ws.images?.[0]}
                    alt={ws.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-md ${
                        ws.status === 'ACTIVE'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-900/80 text-stone-300 border border-stone-600/30'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          ws.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-stone-400'
                        }`}
                      />
                      {ws.status === 'ACTIVE' ? 'Đang mở đón khách' : 'Đang tạm ẩn'}
                    </span>
                    {hasAudioGuide && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30 shadow-xs backdrop-blur-md">
                        <Headphones size={12} />
                        Audio Guide AI
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#7A6255]">
                      <span className="font-semibold text-[#964824] bg-[#964824]/10 px-2 py-0.5 rounded-md">
                        {ws.category || 'Thủ công mỹ nghệ'}
                      </span>
                      {ws.averageRating ? (
                        <div className="flex items-center gap-1 font-bold text-[#3D2B1F]">
                          <Star size={13} className="text-amber-500 fill-amber-500" />
                          <span>{ws.averageRating.toFixed(1)}</span>
                          <span className="text-[#7A6255] font-normal">({ws.reviewCount || 0})</span>
                        </div>
                      ) : (
                        <span className="text-[#7A6255]">Chưa có đánh giá</span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base text-[#3D2B1F] group-hover:text-[#964824] transition-colors line-clamp-2">
                      {ws.title}
                    </h3>

                    {ws.locationLabel && (
                      <p className="text-xs text-[#7A6255] flex items-center gap-1 line-clamp-1">
                        <MapPin size={13} className="text-[#964824] shrink-0" />
                        <span>{ws.locationLabel}</span>
                      </p>
                    )}
                  </div>

                  {/* Price & Capacity */}
                  <div className="pt-3 border-t border-[#EAD8CC]/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-[#7A6255]">Giá vé trải nghiệm</p>
                      <p className="font-serif font-bold text-lg text-[#964824]">
                        {formatCurrencyShort(ws.price)}
                      </p>
                    </div>
                    {ws.maxGuests && (
                      <div className="text-right">
                        <p className="text-[11px] text-[#7A6255]">Quy mô tối đa</p>
                        <p className="text-xs font-semibold text-[#3D2B1F] flex items-center gap-1 justify-end">
                          <Users size={12} className="text-[#964824]" />
                          <span>{ws.maxGuests} khách/buổi</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/workshops/${ws._id}`}
                      target="_blank"
                      className="p-2 rounded-xl text-[#7A6255] hover:text-[#964824] hover:bg-[#FAF7F2] border border-[#EAD8CC] transition-colors cursor-pointer"
                      title="Xem trang công khai"
                    >
                      <ExternalLink size={15} />
                    </Link>

                    <Link
                      to={`/host/workshops/${ws._id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-[#964824] bg-[#964824]/10 hover:bg-[#964824]/20 rounded-xl transition-colors"
                    >
                      <Edit size={14} />
                      <span>Chỉnh sửa</span>
                    </Link>

                    <button
                      type="button"
                      disabled={busyId === ws._id}
                      onClick={() => handleToggleVisibility(ws)}
                      className="p-2 rounded-xl text-[#7A6255] hover:text-[#3D2B1F] hover:bg-[#FAF7F2] border border-[#EAD8CC] transition-colors cursor-pointer disabled:opacity-50"
                      title={ws.status === 'ACTIVE' ? 'Tạm ẩn workshop' : 'Mở hiển thị workshop'}
                    >
                      {ws.status === 'ACTIVE' ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(ws)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                      title="Xóa workshop"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Confirm Delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteLoading && setIsDeleteModalOpen(false)}
        title="Xác nhận xóa Workshop"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Hành động này không thể hoàn tác</p>
              <p className="mt-1">
                Bạn có chắc chắn muốn xóa workshop "
                <strong className="text-rose-950">{targetWorkshop?.title}</strong>"? Toàn bộ thông tin mô tả,
                file thuyết minh và lịch khung giờ liên quan sẽ bị dỡ bỏ.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteLoading}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant="danger"
              isLoading={deleteLoading}
              onClick={handleExecuteDelete}
            >
              Xóa Workshop
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageWorkshopsPage;
