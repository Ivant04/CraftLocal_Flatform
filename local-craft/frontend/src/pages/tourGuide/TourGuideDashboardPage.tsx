import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Users,
  Clock,
  QrCode,
  Route,
  ArrowRight,
} from "lucide-react";
import { dashboardStats } from "../../utils/mockData";

const stats = [
  {
    label: "Lịch hôm nay",
    value: dashboardStats.tourGuide.todaySchedule,
    icon: <Calendar size={22} />,
    color: "bg-blue-500",
  },
  {
    label: "Khách hôm nay",
    value: dashboardStats.tourGuide.totalCustomers,
    icon: <Users size={22} />,
    color: "bg-emerald-500",
  },
  {
    label: "Khung giờ tiếp theo",
    value: dashboardStats.tourGuide.nextTimeslot,
    icon: <Clock size={22} />,
    color: "bg-purple-500",
  },
  {
    label: "Chuyến hoàn thành",
    value: dashboardStats.tourGuide.completedTrips,
    icon: <Route size={22} />,
    color: "bg-amber-500",
  },
];

const TourGuideDashboardPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h1 className="font-headline-lg text-headline-md text-[#3D2B1F]">
        Chào mừng trở lại!
      </h1>
      <p className="text-[#7A6255] text-sm mt-1">
        Bảng điều khiển hướng dẫn viên
      </p>
    </div>
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

export default TourGuideDashboardPage;
