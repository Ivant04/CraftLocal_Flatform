import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import timeslotApi from '../../api/timeslotApi';
import workshopApi from '../../api/workshopApi';
import { normalizeTimeslot, normalizeWorkshop } from '../../utils/normalizers';
import type { Timeslot } from '../../types/timeslot.type';
import type { Workshop } from '../../types/workshop.type';
import { formatTime } from '../../utils/formatDate';
import { TIMESLOT_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';

const ManageTimeslotsPage: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    workshopId: '',
    startTime: '',
    endTime: '',
    totalSlots: '10',
    price: '0',
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [tsRes, wsRes] = await Promise.all([
        timeslotApi.getByHost(),
        workshopApi.getByHost(),
      ]);
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
      setError(err?.response?.data?.message || 'Không tải được danh sách khung giờ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Tạo khung giờ thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn muốn xóa/hủy khung giờ này?')) return;
    try {
      await timeslotApi.delete(id);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể xóa khung giờ.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý khung giờ</h1>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> Thêm khung giờ
        </Button>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : timeslots.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-10 text-center text-on-surface-variant text-sm">
          Chưa có khung giờ nào được tạo.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-soft-clay overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-soft-clay bg-soft-clay/30">
              <th className="p-4 text-left font-medium">Workshop</th>
              <th className="p-4 text-left font-medium">Ngày</th>
              <th className="p-4 text-left font-medium">Giờ</th>
              <th className="p-4 text-left font-medium">Số chỗ</th>
              <th className="p-4 text-left font-medium">Hướng dẫn viên</th>
              <th className="p-4 text-left font-medium">Trạng thái</th>
              <th className="p-4 text-left font-medium">Thao tác</th>
            </tr></thead>
            <tbody>
              {timeslots.map((ts) => (
                <tr key={ts._id} className="border-b border-soft-clay/50">
                  <td className="p-4 font-medium">{ts.workshopTitle}</td>
                  <td className="p-4">{ts.date}</td>
                  <td className="p-4 font-medium text-deep-earth">
                    {ts.startTimeLabel && ts.endTimeLabel
                      ? `${ts.startTimeLabel} - ${ts.endTimeLabel}`
                      : `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`}
                  </td>
                  <td className="p-4">{ts.bookedSlots}/{ts.totalSlots}</td>
                  <td className="p-4">{ts.tourGuideName || <span className="text-amber-600 text-xs">Chưa gán</span>}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${ts.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : ts.status === 'FULL' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{TIMESLOT_STATUS_LABELS[ts.status] || ts.status}</span></td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleDelete(ts._id)}
                      className="p-1.5 text-error hover:bg-error/10 rounded-lg cursor-pointer"
                      title="Xóa / Hủy"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tạo khung giờ mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Workshop</label>
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
              className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm"
            >
              <option value="">Chọn workshop</option>
              {workshops.map((w) => (
                <option key={w._id} value={w._id}>{w.title}</option>
              ))}
            </select>
          </div>
          <Input
            label="Bắt đầu"
            type="datetime-local"
            value={formState.startTime}
            onChange={(e) => setFormState((prev) => ({ ...prev, startTime: e.target.value }))}
            required
          />
          <Input
            label="Kết thúc"
            type="datetime-local"
            value={formState.endTime}
            onChange={(e) => setFormState((prev) => ({ ...prev, endTime: e.target.value }))}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tổng số chỗ"
              type="number"
              min={1}
              value={formState.totalSlots}
              onChange={(e) => setFormState((prev) => ({ ...prev, totalSlots: e.target.value }))}
              required
            />
            <Input
              label="Giá (VND)"
              type="number"
              min={0}
              value={formState.price}
              onChange={(e) => setFormState((prev) => ({ ...prev, price: e.target.value }))}
              required
            />
          </div>
          <Button type="submit" fullWidth isLoading={submitting}>Tạo khung giờ</Button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTimeslotsPage;
