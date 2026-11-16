import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Compass,
  UserCheck,
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  ArrowRight,
  Phone,
  Mail,
  Users,
} from 'lucide-react';
import timeslotApi from '../../api/timeslotApi';
import tourGuideApi from '../../api/tourGuideApi';
import { normalizeTimeslot } from '../../utils/normalizers';
import type { Timeslot } from '../../types/timeslot.type';
import type { User } from '../../types/user.type';
import { formatTime } from '../../utils/formatDate';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const AssignGuidePage: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [tourGuides, setTourGuides] = useState<User[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState('');
  const [selectedGuide, setSelectedGuide] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNASSIGNED' | 'ASSIGNED'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tsRes, tgRes] = await Promise.all([timeslotApi.getByHost(), tourGuideApi.getByHost()]);
      const tsList = tsRes.data?.data;
      const tgList = tgRes.data?.data;
      setTimeslots(Array.isArray(tsList) ? tsList.map(normalizeTimeslot) : []);
      setTourGuides(Array.isArray(tgList) ? tgList : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải dữ liệu phân công.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleAssign = async () => {
    if (!selectedTimeslot || !selectedGuide || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await tourGuideApi.assignToTimeslot({
        timeslotId: selectedTimeslot,
        tourGuideId: selectedGuide,
      });
      const updated = normalizeTimeslot(res.data?.data);
      setTimeslots((prev) => prev.map((ts) => (ts._id === updated._id ? updated : ts)));

      const guideName = tourGuides.find((g) => g._id === selectedGuide)?.fullName || 'Hướng dẫn viên';
      setToastMessage({
        type: 'success',
        text: `Đã phân công ${guideName} cho khung giờ đã chọn thành công.`,
      });
      setSelectedTimeslot('');
      setSelectedGuide('');
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Gán hướng dẫn viên thất bại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = timeslots.length;
    const assigned = timeslots.filter((ts) => Boolean(ts.tourGuideId || ts.tourGuideName)).length;
    const unassigned = total - assigned;
    return { total, assigned, unassigned, totalGuides: tourGuides.length };
  }, [timeslots, tourGuides]);

  // Filtered timeslots
  const filteredTimeslots = useMemo(() => {
    return timeslots.filter((ts) => {
      const isAssigned = Boolean(ts.tourGuideId || ts.tourGuideName);
      const matchFilter =
        filterType === 'ALL' ||
        (filterType === 'ASSIGNED' && isAssigned) ||
        (filterType === 'UNASSIGNED' && !isAssigned);
      const matchSearch =
        !searchTerm.trim() ||
        ts.workshopTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ts.tourGuideName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [timeslots, filterType, searchTerm]);

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
            Phân công Hướng dẫn viên
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Gán các hướng dẫn viên địa phương phụ trách đón tiếp và hướng dẫn du khách theo từng ca trải nghiệm.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#964824] text-white flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Tổng ca trải nghiệm</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Chưa có HDV</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.unassigned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đã phân công</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.assigned}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <p className="text-xs text-[#7A6255] font-medium">Đội ngũ HDV xưởng</p>
              <p className="text-xl font-bold text-[#3D2B1F] tracking-tight">{metrics.totalGuides}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Interactive Box */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 shadow-xs space-y-4">
        <div>
          <h2 className="font-serif font-bold text-base md:text-lg text-[#3D2B1F] flex items-center gap-2">
            <UserPlus size={18} className="text-[#964824]" />
            <span>Phân công nhanh</span>
          </h2>
          <p className="text-xs text-[#7A6255] mt-0.5">
            Chọn một khung giờ và chọn hướng dẫn viên phụ trách, sau đó bấm "Gán HDV".
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-end">
          {/* Select Timeslot */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#3D2B1F] block mb-1.5">
              1. Khung giờ Workshop <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedTimeslot}
              onChange={(e) => setSelectedTimeslot(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-xs text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer"
            >
              <option value="">-- Chọn khung giờ cần gán --</option>
              {timeslots.map((ts) => {
                const assigned = ts.tourGuideName ? `[Đã gán: ${ts.tourGuideName}]` : '[Chưa gán]';
                const time =
                  ts.startTimeLabel && ts.endTimeLabel
                    ? `${ts.startTimeLabel} - ${ts.endTimeLabel}`
                    : `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`;
                return (
                  <option key={ts._id} value={ts._id}>
                    {assigned} {ts.workshopTitle} ({ts.date} • {time})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Select Guide */}
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-[#3D2B1F] block mb-1.5">
              2. Hướng dẫn viên phụ trách <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-xs text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer"
            >
              <option value="">-- Chọn Hướng dẫn viên --</option>
              {tourGuides.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.fullName} ({g.phone || g.email})
                </option>
              ))}
            </select>
          </div>

          {/* Action Button */}
          <div className="md:col-span-1">
            <Button
              type="button"
              fullWidth
              disabled={!selectedTimeslot || !selectedGuide}
              isLoading={submitting}
              onClick={handleAssign}
              className="py-2.5"
            >
              Gán HDV
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-4 md:p-5 border-b border-[#EAD8CC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo workshop, tên HDV..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Tất cả ({timeslots.length})
            </button>
            <button
              onClick={() => setFilterType('UNASSIGNED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterType === 'UNASSIGNED'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Chưa gán ({metrics.unassigned})
            </button>
            <button
              onClick={() => setFilterType('ASSIGNED')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterType === 'ASSIGNED'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Đã gán ({metrics.assigned})
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : filteredTimeslots.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Không có khung giờ nào"
              description="Không tìm thấy khung giờ nào phù hợp với bộ lọc hiện tại."
              icon={<Compass size={44} className="text-[#964824] opacity-50" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#EAD8CC] bg-[#FAF7F2]/80 text-[#7A6255] font-semibold">
                  <th className="py-3.5 px-4 md:px-6">Workshop</th>
                  <th className="py-3.5 px-4">Ngày diễn ra</th>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Hướng dẫn viên phụ trách</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD8CC]/60 text-[#3D2B1F]">
                {filteredTimeslots.map((ts) => {
                  const time =
                    ts.startTimeLabel && ts.endTimeLabel
                      ? `${ts.startTimeLabel} - ${ts.endTimeLabel}`
                      : `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`;
                  const isAssigned = Boolean(ts.tourGuideName);

                  return (
                    <tr key={ts._id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-4 md:px-6">
                        <p className="font-semibold text-[#3D2B1F] line-clamp-1">{ts.workshopTitle}</p>
                        <p className="text-[11px] text-[#7A6255] mt-0.5">
                          {ts.bookedSlots}/{ts.totalSlots} khách đã đặt
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-xs text-[#3D2B1F]">{ts.date}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#964824] bg-[#964824]/8 px-2 py-0.5 rounded-lg">
                          <Clock size={12} />
                          {time}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isAssigned ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center font-bold text-emerald-800 text-xs shrink-0">
                              {ts.tourGuideName?.charAt(0)?.toUpperCase() || 'H'}
                            </div>
                            <span className="font-semibold text-xs text-[#3D2B1F]">{ts.tourGuideName}</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200">
                            Chưa có HDV
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTimeslot(ts._id);
                            if (ts.tourGuideId) setSelectedGuide(ts.tourGuideId);
                            window.scrollTo({ top: 120, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#964824] bg-[#964824]/10 hover:bg-[#964824]/20 rounded-xl transition-colors cursor-pointer"
                        >
                          {isAssigned ? 'Đổi HDV' : 'Gán HDV'}
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
    </div>
  );
};

export default AssignGuidePage;
