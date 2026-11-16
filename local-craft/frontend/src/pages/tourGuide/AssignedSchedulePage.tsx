import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Play, Loader2, Calendar, CheckCircle2, Clock, RefreshCw, AlertCircle, Compass } from 'lucide-react';
import tourGuideApi from '../../api/tourGuideApi';
import { normalizeTimeslot } from '../../utils/normalizers';
import { formatTime } from '../../utils/formatDate';
import { TIMESLOT_STATUS_LABELS } from '../../utils/constants';
import type { Timeslot } from '../../types/timeslot.type';
import EmptyState from '../../components/common/EmptyState';

type FilterTab = 'ALL' | 'UPCOMING' | 'ONGOING' | 'COMPLETED';

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'ONGOING':
      return 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse';
    case 'FULL':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'AVAILABLE':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-800 border-rose-200';
    default:
      return 'bg-stone-100 text-stone-700 border-stone-200';
  }
};

const AssignedSchedulePage: React.FC = () => {
  const [myTimeslots, setMyTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<FilterTab>('ALL');

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await tourGuideApi.getSchedule();
      const rawList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setMyTimeslots(rawList.map(normalizeTimeslot));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải lịch phân công.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const upcomingCount = myTimeslots.filter(
    (ts) => ts.status === 'AVAILABLE' || ts.status === 'FULL'
  ).length;
  const ongoingCount = myTimeslots.filter((ts) => ts.status === 'ONGOING').length;
  const completedCount = myTimeslots.filter((ts) => ts.status === 'COMPLETED').length;

  const filteredTimeslots = myTimeslots.filter((ts) => {
    if (filter === 'UPCOMING') return ts.status === 'AVAILABLE' || ts.status === 'FULL';
    if (filter === 'ONGOING') return ts.status === 'ONGOING';
    if (filter === 'COMPLETED') return ts.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
            Kênh Hướng dẫn viên
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
            Lịch phân công hướng dẫn
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Quản lý các ca trải nghiệm được phân công, điểm danh khách và cập nhật tiến trình chuyến đi.
          </p>
        </div>
        <button
          onClick={fetchSchedule}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-3 shadow-xs flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'ALL', label: 'Tất cả ca', count: myTimeslots.length },
          { id: 'UPCOMING', label: 'Sắp diễn ra', count: upcomingCount },
          { id: 'ONGOING', label: 'Đang diễn ra', count: ongoingCount, highlight: ongoingCount > 0 },
          { id: 'COMPLETED', label: 'Đã hoàn thành', count: completedCount },
        ].map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EAD8CC]/60 text-[#7A6255]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Schedule List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 size={24} className="animate-spin text-[#964824]" />
        </div>
      ) : filteredTimeslots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD8CC] py-16">
          <EmptyState
            title="Chưa có ca trải nghiệm nào"
            description="Bạn hiện chưa có ca trải nghiệm nào trong danh mục này."
            icon={<Compass size={44} className="text-[#964824] opacity-50" />}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTimeslots.map((ts) => {
            const hasGuests = ts.bookedSlots > 0;
            const isCompleted = ts.status === 'COMPLETED';
            const isOngoing = ts.status === 'ONGOING';
            const badgeClass = getStatusBadgeClass(ts.status);

            return (
              <div
                key={ts._id}
                className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 hover:shadow-[0_6px_24px_rgba(61,43,31,0.06)] transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}
                      >
                        {TIMESLOT_STATUS_LABELS[ts.status] || ts.status}
                      </span>
                      <span className="text-xs text-[#7A6255]">• ID: {ts._id.slice(-6)}</span>
                    </div>

                    <h3 className="font-serif font-bold text-base md:text-lg text-[#3D2B1F] group-hover:text-[#964824] transition-colors">
                      {ts.workshopTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6255] pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="text-[#964824]" />
                        {ts.date}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[#964824]">
                        <Clock size={13} />
                        {ts.startTimeLabel && ts.endTimeLabel
                          ? `${ts.startTimeLabel} - ${ts.endTimeLabel}`
                          : `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="text-[#964824]" />
                        <strong>{ts.bookedSlots}</strong>/{ts.totalSlots} khách đã đặt
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
                    <Link
                      to={`/tour-guide/customers/${ts._id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#EAD8CC] text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] transition-colors"
                    >
                      <Users size={14} />
                      <span>Danh sách khách ({ts.bookedSlots})</span>
                    </Link>

                    {isCompleted ? (
                      <Link
                        to={`/tour-guide/trip-progress/${ts._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all"
                      >
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        <span>Xem chi tiết</span>
                      </Link>
                    ) : isOngoing ? (
                      <Link
                        to={`/tour-guide/trip-progress/${ts._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs animate-pulse"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Tiếp tục chuyến</span>
                      </Link>
                    ) : !hasGuests ? (
                      <button
                        disabled
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-400 bg-stone-100 border border-stone-200 rounded-xl cursor-not-allowed"
                      >
                        <Play size={14} />
                        <span>Chưa có khách</span>
                      </button>
                    ) : (
                      <Link
                        to={`/tour-guide/trip-progress/${ts._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#964824] hover:bg-[#7A3518] rounded-xl transition-all shadow-xs"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Vào chuyến đi</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignedSchedulePage;
