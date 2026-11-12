import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Play, Loader2, Calendar } from "lucide-react";
import tourGuideApi from "../../api/tourGuideApi";
import { normalizeTimeslot } from "../../utils/normalizers";
import { formatTime } from "../../utils/formatDate";
import { TIMESLOT_STATUS_LABELS } from "../../utils/constants";
import type { Timeslot } from "../../types/timeslot.type";

const AssignedSchedulePage: React.FC = () => {
  const [myTimeslots, setMyTimeslots] = useState<Timeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">
        Lịch phân công
      </h1>
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-on-surface-variant gap-2">
          <Loader2 size={20} className="animate-spin" /> Đang tải lịch phân công...
        </div>
      ) : myTimeslots.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-8 text-center text-on-surface-variant">
          <Calendar size={32} className="mx-auto mb-2 opacity-50" />
          <p>Bạn chưa có khung giờ nào được phân công.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myTimeslots.map((ts) => (
            <div
              key={ts._id}
              className="bg-white rounded-xl border border-soft-clay p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-on-surface">
                      {ts.workshopTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {TIMESLOT_STATUS_LABELS[ts.status] || ts.status}
                    </span>
                  </div>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {ts.date} · {ts.startTimeLabel || formatTime(ts.startTime)} -{" "}
                    {ts.endTimeLabel || formatTime(ts.endTime)}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {ts.bookedSlots} / {ts.totalSlots} khách
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/tour-guide/timeslots/${ts._id}/customers`}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all"
                  >
                    <Users size={14} /> Khách hàng
                  </Link>
                  <Link
                    to={`/tour-guide/trip-progress/${ts._id}`}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-all"
                  >
                    <Play size={14} /> Chuyến đi
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedSchedulePage;
