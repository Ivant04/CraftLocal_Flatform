import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Compass,
  AlertCircle,
  Tag,
} from 'lucide-react';
import timeslotApi from '../../api/timeslotApi';
import workshopApi from '../../api/workshopApi';
import { normalizeTimeslot, normalizeWorkshop } from '../../utils/normalizers';
import type { Timeslot } from '../../types/timeslot.type';
import type { Workshop } from '../../types/workshop.type';
import { formatTime, formatDate } from '../../utils/formatDate';
import { TIMESLOT_STATUS_LABELS } from '../../utils/constants';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const statusBadgeStyles: Record<string, string> = {
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FULL: 'bg-purple-50 text-purple-700 border-purple-200',
  ONGOING: 'bg-blue-50 text-blue-700 border-blue-200 animate-pulse',
  COMPLETED: 'bg-stone-100 text-stone-700 border-stone-200',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ManageTimeslotsPage: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Create
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    workshopId: '',
    startTime: '',
    endTime: '',
    totalSlots: '10',
    price: '0',
  });

  // Modal Delete
  const [targetTimeslotId, setTargetTimeslotId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tsRes, wsRes] = await Promise.all([timeslotApi.getByHost(), workshopApi.getByHost()]);
      const tsList = tsRes.data?.data;
      const wsList = wsRes.data?.data;
      setTimeslots(Array.isArray(tsList) ? tsList.map(normalizeTimeslot) : []);
      const normalizedWs = Array.isArray(wsList) ? wsList.map(normalizeWorkshop) : [];
      setWorkshops(normalizedWs);
      if (normalizedWs.length > 0 && !formState.workshopId) {
        setFormState((prev) => ({
          ...prev,
          workshopId: normalizedWs[0]._id,
          price: String(normalizedWs[0].price),
          totalSlots: String(normalizedWs[0].maxGuests || 10),
        }));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách khung giờ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!formState.workshopId) {
      setError('Vui lòng chọn workshop.');
      return;
    }
    if (!formState.startTime || !formState.endTime) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc.');
      return;
    }
    const start = new Date(formState.startTime);
    const end = new Date(formState.endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setError('Thời gian không hợp lệ.');
      return;
    }
    if (end <= start) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await timeslotApi.create({
        workshopId: formState.workshopId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        totalSlots: Number(formState.totalSlots),
        price: Number(formState.price),
      });
      setShowModal(false);
      setToastMessage({
        type: 'success',
        text: 'Đã tạo khung giờ trải nghiệm mới thành công.',
      });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Tạo khung giờ thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!targetTimeslotId) return;
    setDeleteLoading(true);
    try {
      await timeslotApi.delete(targetTimeslotId);
      setTimeslots((prev) => prev.filter((ts) => ts._id !== targetTimeslotId));
      setToastMessage({
        type: 'success',
        text: 'Đã hủy khung giờ thành công.',
      });
      setIsDeleteModalOpen(false);
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Không thể xóa khung giờ.',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = timeslots.length;
    const available = timeslots.filter((ts) => ts.status === 'AVAILABLE').length;
    const full = timeslots.filter((ts) => ts.status === 'FULL').length;
    const completed = timeslots.filter((ts) => ts.status === 'COMPLETED').length;
    return { total, available, full, completed };
  }, [timeslots]);

  // Filtered
  const filteredTimeslots = useMemo(() => {
    return timeslots.filter((ts) => {
      const matchWs = selectedWorkshopId === 'ALL' || ts.workshopId === selectedWorkshopId;
      const matchStatus = statusFilter === 'ALL' || ts.status === statusFilter;
      const matchSearch =
        !searchTerm.trim() ||
        ts.workshopTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.tourGuideName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchWs && matchStatus && matchSearch;
    });
  }, [timeslots, selectedWorkshopId, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Toast */}
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
            Quản lý khung giờ trải nghiệm
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Mở các ca trải nghiệm theo ngày, phân bổ số chỗ và thiết lập giá vé.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            <span>Thêm khung giờ</span>
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#964824] text-white flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tổng khung giờ</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Còn chỗ đón khách</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.available}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đã kín chỗ</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.full}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-500 text-white flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đã hoàn thành</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 md:p-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Workshop Selector */}
          <select
            value={selectedWorkshopId}
            onChange={(e) => setSelectedWorkshopId(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer"
          >
            <option value="ALL">Tất cả Workshop ({workshops.length})</option>
            {workshops.map((w) => (
              <option key={w._id} value={w._id}>
                {w.title}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-44 px-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer"
          >
            <option value="ALL">Mọi trạng thái</option>
            <option value="AVAILABLE">Còn chỗ</option>
            <option value="FULL">Đã kín chỗ</option>
            <option value="ONGOING">Đang diễn ra</option>
            <option value="COMPLETED">Đã kết thúc</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo workshop, HDV..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : filteredTimeslots.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Chưa có khung giờ nào"
              description="Chưa có ca trải nghiệm nào phù hợp với bộ lọc hiện tại."
              icon={<Clock size={44} className="text-[#964824] opacity-50" />}
              action={
                <Button size="sm" onClick={() => setShowModal(true)}>
                  <Plus size={16} className="mr-1" /> Thêm khung giờ mới
                </Button>
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#EAD8CC] bg-[#FAF7F2]/80 text-[#7A6255] font-semibold">
                  <th className="py-3.5 px-4 md:px-6">Workshop</th>
                  <th className="py-3.5 px-4">Ngày diễn ra</th>
                  <th className="py-3.5 px-4">Khung giờ</th>
                  <th className="py-3.5 px-4">Số chỗ (Đã đặt / Tổng)</th>
                  <th className="py-3.5 px-4">Giá vé</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD8CC]/60 text-[#3D2B1F]">
                {filteredTimeslots.map((ts) => {
                  const percent = Math.min(100, Math.round((ts.bookedSlots / ts.totalSlots) * 100));
                  const timeLabel =
                    ts.startTimeLabel && ts.endTimeLabel
                      ? `${ts.startTimeLabel} - ${ts.endTimeLabel}`
                      : `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`;

                  return (
                    <tr key={ts._id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      {/* Workshop */}
                      <td className="py-3.5 px-4 md:px-6">
                        <p className="font-semibold text-[#3D2B1F] line-clamp-1">{ts.workshopTitle}</p>
                        {ts.tourGuideName && (
                          <p className="text-[11px] text-[#7A6255] mt-0.5">HDV: {ts.tourGuideName}</p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-xs text-[#3D2B1F]">{ts.date}</span>
                      </td>

                      {/* Time */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#964824] bg-[#964824]/8 px-2 py-0.5 rounded-lg">
                          <Clock size={12} />
                          {timeLabel}
                        </span>
                      </td>

                      {/* Slots Capacity */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 max-w-[130px]">
                          <div className="flex justify-between text-[11px] font-semibold text-[#3D2B1F]">
                            <span>{ts.bookedSlots} đã đặt</span>
                            <span className="text-[#7A6255]">/{ts.totalSlots}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#EAD8CC]/60 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                percent >= 100
                                  ? 'bg-purple-600'
                                  : percent >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-serif font-bold text-xs md:text-sm text-[#964824]">
                          {formatCurrencyShort(ts.price)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            statusBadgeStyles[ts.status] || ''
                          }`}
                        >
                          {TIMESLOT_STATUS_LABELS[ts.status] || ts.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setTargetTimeslotId(ts._id);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hủy / Xóa khung giờ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create Timeslot */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Mở khung giờ trải nghiệm mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#3D2B1F] block mb-1.5">
              Chọn Workshop áp dụng <span className="text-rose-500">*</span>
            </label>
            <select
              value={formState.workshopId}
              onChange={(e) => {
                const ws = workshops.find((w) => w._id === e.target.value);
                setFormState((prev) => ({
                  ...prev,
                  workshopId: e.target.value,
                  price: ws ? String(ws.price) : prev.price,
                  totalSlots: ws ? String(ws.maxGuests || 10) : prev.totalSlots,
                }));
              }}
              required
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-xs text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer"
            >
              <option value="">-- Chọn Workshop --</option>
              {workshops.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Thời gian bắt đầu"
              type="datetime-local"
              value={formState.startTime}
              onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))}
              required
            />
            <Input
              label="Thời gian kết thúc"
              type="datetime-local"
              value={formState.endTime}
              onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Tổng số chỗ (người)"
              type="number"
              min={1}
              value={formState.totalSlots}
              onChange={(e) => setFormState((prev) => ({ ...prev, totalSlots: e.target.value }))}
              required
            />
            <Input
              label="Giá vé (VND)"
              type="number"
              min={0}
              value={formState.price}
              onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={submitting}>
              Tạo khung giờ
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Confirm Delete */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteLoading && setIsDeleteModalOpen(false)}
        title="Xác nhận hủy khung giờ"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3">
            <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Cảnh báo hủy khung giờ</p>
              <p className="mt-1">
                Bạn có chắc chắn muốn hủy khung giờ này? Nếu đã có khách đặt vé, hãy liên hệ hướng dẫn viên
                hoặc hỗ trợ hoàn tiền theo chính sách.
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
              Xác nhận xóa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageTimeslotsPage;
