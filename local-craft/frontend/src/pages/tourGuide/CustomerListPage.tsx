import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, Circle, Loader2, Users } from "lucide-react";
import tourGuideApi from "../../api/tourGuideApi";
import { normalizeBooking } from "../../utils/normalizers";
import type { Booking } from "../../types/booking.type";

const CustomerListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkingId, setCheckingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await tourGuideApi.getCustomers(id);
        const rawList = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setCustomers(rawList.map(normalizeBooking));
      } catch (err: any) {
        setError(
          err?.response?.data?.message || "Không thể tải danh sách khách hàng"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [id]);

  const handleCheckIn = async (booking: Booking) => {
    if (!booking.qrCode) {
      navigate("/tour-guide/check-in");
      return;
    }
    try {
      setCheckingId(booking._id);
      setError("");
      await tourGuideApi.checkIn(booking.qrCode);
      setCustomers((prev) =>
        prev.map((item) =>
          item._id === booking._id ? { ...item, status: "CHECKED_IN" } : item
        )
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Check-in thất bại");
    } finally {
      setCheckingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">
        Danh sách khách
      </h1>
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="py-12 flex items-center justify-center text-on-surface-variant gap-2">
          <Loader2 size={20} className="animate-spin" /> Đang tải danh sách khách...
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-8 text-center text-on-surface-variant">
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p>Chưa có khách nào đăng ký khung giờ này.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-soft-clay overflow-hidden">
          {customers.map((c) => {
            const isCheckedIn =
              c.status === "CHECKED_IN" || c.status === "COMPLETED";
            return (
              <div
                key={c._id}
                className="flex items-center justify-between p-4 border-b border-soft-clay/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {(c.touristName || "K")[0]}
                  </div>
                  <div>
                    <p className="font-medium text-on-surface">
                      {c.touristName}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {c.guests} khách ·{" "}
                      {c.qrCode || c.bookingCode || c.touristPhone || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCheckedIn ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} /> Đã check-in
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(c)}
                      disabled={checkingId === c._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      {checkingId === c._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Circle size={14} />
                      )}{" "}
                      Check-in
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerListPage;
