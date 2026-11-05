import React from "react";
import { useParams } from "react-router-dom";
import { CheckCircle, Circle } from "lucide-react";
import { bookings } from "../../utils/mockData";

const CustomerListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const customers = bookings
    .filter((b) => b.timeslotId === id || true)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">
        Danh sách khách
      </h1>
      <div className="bg-white rounded-xl border border-soft-clay overflow-hidden">
        {customers.map((c) => (
          <div
            key={c._id}
            className="flex items-center justify-between p-4 border-b border-soft-clay/50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                {c.touristName[0]}
              </div>
              <div>
                <p className="font-medium text-on-surface">{c.touristName}</p>
                <p className="text-xs text-on-surface-variant">
                  {c.guests} khách · {c.qrCode}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.status === "CHECKED_IN" ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} /> Đã check-in
                </span>
              ) : (
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                  <Circle size={14} /> Check-in
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerListPage;
