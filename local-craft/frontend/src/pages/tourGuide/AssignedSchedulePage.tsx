import React from "react";
import { Link } from "react-router-dom";
import { Users, Play } from "lucide-react";
import { timeslots } from "../../utils/mockData";
import { formatTime } from "../../utils/formatDate";

const AssignedSchedulePage: React.FC = () => {
  const myTimeslots = timeslots.filter((ts) => ts.tourGuideId);

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">
        Lịch phân công
      </h1>
      <div className="space-y-4">
        {myTimeslots.map((ts) => (
          <div
            key={ts._id}
            className="bg-white rounded-xl border border-soft-clay p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-on-surface">
                  {ts.workshopTitle}
                </h3>
                <p className="text-sm text-on-surface-variant mt-1">
                  {ts.date} · {formatTime(ts.startTime)} -{" "}
                  {formatTime(ts.endTime)}
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
    </div>
  );
};

export default AssignedSchedulePage;
