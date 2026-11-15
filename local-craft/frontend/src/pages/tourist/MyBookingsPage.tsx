import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  QrCode,
  Star,
  Sparkles,
  CreditCard,
  XCircle,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import bookingApi from '../../api/bookingApi';
import paymentApi from '../../api/paymentApi';
import { normalizeBooking } from '../../utils/normalizers';
import type { Booking } from '../../types/booking.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Loading from '../../components/common/Loading';

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    setError('');
    bookingApi
      .getMyBookings()
      .then((res) => {
        const list = res.data?.data;
        setBookings(Array.isArray(list) ? list.map(normalizeBooking) : []);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Không tải được danh sách đặt chỗ.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayNow = async (bookingId: string) => {
    try {
      setPayingId(bookingId);
      setActionMessage(null);
      const res = await paymentApi.createBookingPayment(bookingId);
      const checkoutUrl = res.data?.data?.checkoutUrl;
      if (checkoutUrl) {
        window.location.assign(checkoutUrl);
      } else {
        throw new Error('Chưa nhận được liên kết thanh toán từ PayOS');
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setPayingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string, bookingCode?: string) => {
    const confirmText = `Bạn có chắc chắn muốn hủy đơn đặt chỗ ${bookingCode ? `"${bookingCode}"` : ''} không?`;
    if (!window.confirm(confirmText)) return;

    try {
      setCancelingId(bookingId);
      setActionMessage(null);
      await bookingApi.cancel(bookingId, 'Khách hủy đơn chờ thanh toán');
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
      setActionMessage({ type: 'success', text: 'Đã hủy lịch đặt chỗ thành công.' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể hủy lịch đặt. Vui lòng thử lại.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setCancelingId(null);
    }
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const upcomingCount = bookings.filter((b) => b.status === 'PAID' || b.status === 'CHECKED_IN').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'PENDING') return b.status === 'PENDING';
    if (filter === 'UPCOMING') return b.status === 'PAID' || b.status === 'CHECKED_IN';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-craft-contour pb-20 pt-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tài khoản du khách</span>
            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-deep-earth mt-1">
              Lịch đặt workshop của tôi
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              Theo dõi lịch trải nghiệm, thanh toán giữ chỗ và nhận vé điện tử check-in
            </p>
          </div>
          <Link to="/workshops">
            <Button variant="primary" size="md">
              <Sparkles size={16} className="mr-1.5" /> Đặt thêm workshop
            </Button>
          </Link>
        </div>

        {/* Global Action Toast / Alert */}
        {actionMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm animate-fadeIn border ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
            <button
              onClick={() => setActionMessage(null)}
              className="text-xs font-semibold underline hover:opacity-75 cursor-pointer ml-4"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-outline-subtle">
          {[
            { id: 'ALL', label: 'Tất cả lịch đặt', count: bookings.length },
            { id: 'PENDING', label: 'Chờ thanh toán', count: pendingCount, highlight: pendingCount > 0 },
            { id: 'UPCOMING', label: 'Đã xác nhận', count: upcomingCount },
            { id: 'COMPLETED', label: 'Đã hoàn thành', count: completedCount },
            { id: 'CANCELLED', label: 'Đã hủy', count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-deep-earth text-white shadow-xs'
                  : 'bg-white border border-outline-subtle text-on-surface-variant hover:text-deep-earth hover:border-outline-variant'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                  filter === tab.id
                    ? 'bg-white/20 text-white'
                    : tab.highlight
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-surface-warm text-on-surface-variant'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-700 text-sm">
            {error}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="Chưa có lịch đặt phù hợp"
            description="Bạn hiện không có workshop nào trong mục này. Hãy khám phá và đặt chỗ cho chuyến đi sắp tới!"
            action={
              <Link to="/workshops">
                <Button variant="primary">Khám phá Workshop</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const statusVariant =
                b.status === 'COMPLETED'
                  ? 'success'
                  : b.status === 'PAID'
                  ? 'heritage'
                  : b.status === 'CHECKED_IN'
                  ? 'earth'
                  : b.status === 'PENDING'
                  ? 'warning'
                  : 'subtle';

              const isPending = b.status === 'PENDING';

              return (
                <div
                  key={b._id}
                  className={`bg-white rounded-2xl border p-5 md:p-6 transition-all hover:shadow-md ${
                    isPending
                      ? 'border-amber-300/80 shadow-2xs hover:border-amber-500'
                      : 'border-outline-subtle hover:border-primary/30'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between">
                    {/* Workshop Info */}
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-container shrink-0 border border-outline-subtle">
                        <ImageWithFallback
                          src={b.workshopImage}
                          alt={b.workshopTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <Badge variant={statusVariant} size="sm">
                            {BOOKING_STATUS_LABELS[b.status] || b.status}
                          </Badge>
                          <span className="text-xs text-on-surface-variant font-mono">
                            Mã đặt: {b.bookingCode || `#${b._id.slice(-6).toUpperCase()}`}
                          </span>
                        </div>

                        <Link
                          to={`/workshops/${b.workshopId}`}
                          className="font-headline font-bold text-base md:text-lg text-deep-earth hover:text-primary transition-colors line-clamp-1 block"
                        >
                          {b.workshopTitle}
                        </Link>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant mt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar size={13} className="text-primary" /> {b.timeslotDate}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={13} className="text-primary" /> {formatTime(b.timeslotStartTime)} - {formatTime(b.timeslotEndTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-primary" /> {b.guests} khách
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                          <div>
                            <span className="text-on-surface-variant">Tổng chi phí: </span>
                            <strong className="text-primary font-bold text-sm font-headline">
                              {formatCurrencyShort(b.totalAmount)}
                            </strong>
                          </div>

                          {isPending && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Clock size={12} className="text-amber-600" />
                              Chờ thanh toán để xác nhận giữ chỗ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-subtle shrink-0">
                      {/* PENDING: Thanh toán ngay & Hủy đặt chỗ */}
                      {isPending && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            className="w-full sm:w-auto font-bold bg-[#964824] hover:bg-[#7e3a1b] text-white shadow-xs"
                            onClick={() => handlePayNow(b._id)}
                            disabled={payingId === b._id || cancelingId === b._id}
                          >
                            <CreditCard size={15} className="mr-1.5" />
                            {payingId === b._id ? 'Đang chuyển...' : 'Thanh toán ngay'}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                            onClick={() => handleCancelBooking(b._id, b.bookingCode)}
                            disabled={cancelingId === b._id || payingId === b._id}
                          >
                            <XCircle size={15} className="mr-1.5" />
                            {cancelingId === b._id ? 'Đang hủy...' : 'Hủy đặt chỗ'}
                          </Button>
                        </>
                      )}

                      {/* PAID / CHECKED_IN / COMPLETED: Xem vé điện tử */}
                      {(b.status === 'PAID' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED') && (
                        <Link to={`/my-bookings/${b._id}/ticket`} className="w-full sm:w-auto">
                          <Button size="sm" variant="primary" fullWidth className="font-bold">
                            <QrCode size={15} className="mr-1.5" /> Xem vé điện tử
                          </Button>
                        </Link>
                      )}

                      {/* Review */}
                      {(b.canReview || b.status === 'COMPLETED' || b.status === 'CHECKED_IN') && (
                        <Link to={`/review/${b._id}`} className="w-full sm:w-auto">
                          <Button size="sm" variant="secondary" fullWidth className="font-bold">
                            <Star size={15} className="mr-1.5 text-accent-gold fill-accent-gold" /> Viết đánh giá
                          </Button>
                        </Link>
                      )}

                      {/* Chi tiết workshop */}
                      <Link to={`/workshops/${b.workshopId}`} className="w-full sm:w-auto">
                        <Button size="sm" variant="ghost" fullWidth>
                          Chi tiết workshop
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
