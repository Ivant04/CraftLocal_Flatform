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
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-deep-earth">
                        {c.touristName}
                      </p>
                      {c.status === 'PENDING' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                          Chờ thanh toán
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {c.guests} khách ·{" "}
                      {c.bookingCode ? `Mã: ${c.bookingCode}` : ""}{" "}
                      {c.touristPhone ? `· SĐT: ${c.touristPhone}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCheckedIn ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle size={15} /> Đã check-in
                    </span>
                  ) : c.status === 'PENDING' ? (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      Chưa thanh toán
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(c)}
                      disabled={checkingId === c._id}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-50 cursor-pointer"
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
