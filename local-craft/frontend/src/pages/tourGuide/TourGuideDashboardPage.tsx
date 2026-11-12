import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Clock,
  QrCode,
  Route,
  ArrowRight,
  Loader2,
} from "lucide-react";
import dashboardApi from "../../api/dashboardApi";

interface TourGuideStats {
  assignedSchedules: number;
  todaySchedules: number;
  completedTrips: number;
  numberOfCustomers: number;
  checkedInCount: number;
}

const TourGuideDashboardPage: React.FC = () => {
  const [data, setData] = useState<TourGuideStats>({
    assignedSchedules: 0,
    todaySchedules: 0,
    completedTrips: 0,
    numberOfCustomers: 0,
    checkedInCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardApi.getTourGuideStats();
        const payload = res.data?.data || res.data || {};
        setData({
          assignedSchedules: Number(payload.assignedSchedules ?? 0),
          todaySchedules: Number(payload.todaySchedules ?? 0),
          completedTrips: Number(payload.completedTrips ?? 0),
          numberOfCustomers: Number(payload.numberOfCustomers ?? 0),
          checkedInCount: Number(payload.checkedInCount ?? 0),
        });
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Không thể tải thống kê hướng dẫn viên"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    {
      label: "Lịch hôm nay",
      value: data.todaySchedules,
      icon: <Calendar size={22} />,
      color: "bg-blue-500",
    },
    {
      label: "Khách được phân công",
      value: `${data.checkedInCount}/${data.numberOfCustomers}`,
      icon: <Users size={22} />,
      color: "bg-emerald-500",
    },
    {
      label: "Lịch được phân công",
      value: data.assignedSchedules,
      icon: <Clock size={22} />,
      color: "bg-purple-500",
    },
    {
      label: "Chuyến hoàn thành",
      value: data.completedTrips,
      icon: <Route size={22} />,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-md text-[#3D2B1F]">
          Chào mừng trở lại!
        </h1>
        <p className="text-[#7A6255] text-sm mt-1">
          Bảng điều khiển hướng dẫn viên
        </p>
      </div>
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-[#7A6255] gap-2">
          <Loader2 size={20} className="animate-spin" /> Đang tải dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-[#EAD8CC] p-5 hover:shadow-[0_8px_30px_rgba(61,43,31,0.08)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${s.color} text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                >
                  {s.icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#3D2B1F]">{s.value}</p>
                  <p className="text-xs text-[#7A6255]">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    <div className="space-y-3">
      <Link
        to="/tour-guide/check-in"
        className="flex items-center gap-4 p-5 bg-[#964824] text-white rounded-2xl hover:bg-[#7A3518] transition-all active:scale-[0.98] shadow-[0_10px_24px_rgba(150,72,36,0.28)] group"
      >
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
          <QrCode size={24} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg">Quét mã QR</p>
          <p className="text-white/70 text-sm">Check-in khách hàng</p>
        </div>
        <ArrowRight
          size={18}
          className="text-white/60 group-hover:translate-x-1 transition-transform"
        />
      </Link>
      <Link
        to="/tour-guide/schedules"
        className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-[#EAD8CC] hover:shadow-[0_8px_30px_rgba(61,43,31,0.08)] transition-all group"
      >
        <div className="w-12 h-12 rounded-2xl bg-[#964824]/10 flex items-center justify-center">
          <Calendar size={24} className="text-[#964824]" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-lg text-[#3D2B1F]">Lịch phân công</p>
          <p className="text-[#7A6255] text-sm">Xem khung giờ được gán</p>
        </div>
        <ArrowRight
          size={18}
          className="text-[#7A6255] opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </Link>
    </div>
  </div>
  );
};

export default TourGuideDashboardPage;
