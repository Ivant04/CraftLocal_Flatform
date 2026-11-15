import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Play, Loader2, Calendar, CheckCircle, Clock } from "lucide-react";
import tourGuideApi from "../../api/tourGuideApi";
import { normalizeTimeslot } from "../../utils/normalizers";
import { formatTime } from "../../utils/formatDate";
import { TIMESLOT_STATUS_LABELS } from "../../utils/constants";
import type { Timeslot } from "../../types/timeslot.type";

type FilterTab = "ALL" | "UPCOMING" | "ONGOING" | "COMPLETED";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ONGOING":
      return "bg-blue-50 text-blue-700 border-blue-200 animate-pulse";
    case "FULL":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "AVAILABLE":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "CANCELLED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
};

const AssignedSchedulePage: React.FC = () => {
  const [myTimeslots, setMyTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterTab>("ALL");

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await tourGuideApi.getSchedule();
        const rawList = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setMyTimeslots(rawList.map(normalizeTimeslot));
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Không thể tải lịch phân công"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const upcomingCount = myTimeslots.filter(
    (ts) => ts.status === "AVAILABLE" || ts.status === "FULL"
  ).length;
  const ongoingCount = myTimeslots.filter((ts) => ts.status === "ONGOING").length;
  const completedCount = myTimeslots.filter((ts) => ts.status === "COMPLETED").length;

  const filteredTimeslots = myTimeslots.filter((ts) => {
    if (filter === "UPCOMING") return ts.status === "AVAILABLE" || ts.status === "FULL";
    if (filter === "ONGOING") return ts.status === "ONGOING";
    if (filter === "COMPLETED") return ts.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Không gian Hướng dẫn viên
        </span>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-deep-earth mt-1">
          Lịch phân công hướng dẫn
        </h1>
        <p className="text-xs md:text-sm text-on-surface-variant mt-1">
          Quản lý danh sách khung giờ phụ trách, điểm danh khách tham gia và cập nhật tiến trình chuyến đi.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-outline-subtle">
        {[
          { id: "ALL", label: "Tất cả", count: myTimeslots.length },
          { id: "UPCOMING", label: "Sắp diễn ra", count: upcomingCount },
          { id: "ONGOING", label: "Đang diễn ra", count: ongoingCount, highlight: ongoingCount > 0 },
          { id: "COMPLETED", label: "Đã hoàn thành", count: completedCount },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as FilterTab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              filter === tab.id
                ? "bg-deep-earth text-white shadow-xs"
                : "bg-white border border-outline-subtle text-on-surface-variant hover:text-deep-earth"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                filter === tab.id
                  ? "bg-white/20 text-white"
                  : tab.highlight
                  ? "bg-blue-100 text-blue-800"
                  : "bg-surface-warm text-on-surface-variant"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-on-surface-variant gap-2">
          <Loader2 size={22} className="animate-spin text-primary" />
          <span className="text-sm font-medium">Đang tải lịch phân công...</span>
        </div>
      ) : filteredTimeslots.length === 0 ? (
        <div className="bg-white rounded-2xl border border-outline-subtle p-12 text-center text-on-surface-variant">
          <Calendar size={36} className="mx-auto mb-3 opacity-40 text-primary" />
          <p className="font-medium text-sm">Không có khung giờ nào trong mục này.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredTimeslots.map((ts) => {
            const hasGuests = ts.bookedSlots > 0;
            const isCompleted = ts.status === "COMPLETED";
            const isOngoing = ts.status === "ONGOING";

            return (
              <div
                key={ts._id}
                className={`bg-white rounded-2xl border p-5 transition-all hover:shadow-sm ${
                  isOngoing
                    ? "border-blue-300 shadow-2xs"
                    : isCompleted
                    ? "border-outline-subtle bg-stone-50/40"
                    : "border-outline-subtle"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left Column: Workshop and Schedule Info */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-base text-deep-earth">
                        {ts.workshopTitle}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                          ts.status
                        )}`}
                      >
                        {TIMESLOT_STATUS_LABELS[ts.status] || ts.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={13} className="text-primary" />
                        {ts.date}
                      </span>
                      <span className="inline-flex items-center gap-1 font-mono">
                        <Clock size={13} className="text-primary" />
                        {ts.startTimeLabel || formatTime(ts.startTime)} -{" "}
                        {ts.endTimeLabel || formatTime(ts.endTime)}
                      </span>
                    </div>

                    <div className="text-xs flex flex-wrap items-center gap-2">
                      {hasGuests ? (
                        <span className="font-semibold text-deep-earth">
                          <strong className="text-primary font-bold">{ts.bookedSlots}</strong> /{" "}
                          {ts.totalSlots} khách đã xác nhận
                        </span>
                      ) : (
                        <span className="text-stone-400 font-medium">
                          0 / {ts.totalSlots} khách
                        </span>
                      )}

                      {Boolean(ts.pendingSlots && ts.pendingSlots > 0) && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <Clock size={11} className="text-amber-600" />
                          {ts.pendingSlots} khách đang chờ thanh toán
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                    {/* View Customers */}
                    <Link
                      to={`/tour-guide/timeslots/${ts._id}/customers`}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
                        hasGuests || (ts.pendingSlots && ts.pendingSlots > 0)
                          ? "text-primary border-primary/30 hover:bg-primary hover:text-white"
                          : "text-stone-400 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      <Users size={14} />
                      <span>
                        Khách hàng ({ts.bookedSlots + (ts.pendingSlots || 0)})
                      </span>
                    </Link>

                    {/* Dynamic Trip Button */}
                    {isCompleted ? (
                      <Link
                        to={`/tour-guide/trip-progress/${ts._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-all"
                      >
                        <CheckCircle size={14} className="text-emerald-600" />
                        <span>Đã hoàn thành</span>
                      </Link>
                    ) : isOngoing ? (
                      <Link
                        to={`/tour-guide/trip-progress/${ts._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs animate-pulse"
                      >
                        <Play size={14} className="fill-white" />
                        <span>Tiếp tục chuyến</span>
                      </Link>
                    ) : !hasGuests ? (
                      <button
                        disabled
                        title="Chưa có khách đặt vé trong khung giờ này"
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-stone-400 bg-stone-100 border border-stone-200 rounded-xl cursor-not-allowed"
                      >
                        <Play size={14} />
                        <span>Chưa có khách</span>
                      </button>
                    ) : (
                      <Link
                        to={`/tour-guide/trip-progress/${ts._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#964824] hover:bg-[#7e3a1b] rounded-xl transition-all shadow-xs"
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
