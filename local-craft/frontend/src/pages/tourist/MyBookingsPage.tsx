import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, QrCode, Star, Sparkles } from 'lucide-react';
import bookingApi from '../../api/bookingApi';
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
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    bookingApi
      .getMyBookings()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setBookings(Array.isArray(list) ? list.map(normalizeBooking) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách đặt chỗ.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'UPCOMING') return b.status === 'PAID' || b.status === 'PENDING' || b.status === 'CHECKED_IN';
    if (filter === 'COMPLETED') return b.status === 'COMPLETED';
    if (filter === 'CANCELLED') return b.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="min-h-screen bg-craft-contour pb-20 pt-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tài khoản du khách</span>
            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-deep-earth mt-1">
              Lịch đặt workshop của tôi
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              Theo dõi lịch trải nghiệm, lấy vé điện tử và mã QR check-in tại làng nghề
            </p>
          </div>
          <Link to="/workshops">
            <Button variant="primary" size="md">
              <Sparkles size={16} className="mr-1.5" /> Đặt thêm workshop
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-outline-subtle">
          {[
            { id: 'ALL', label: 'Tất cả lịch đặt', count: bookings.length },
            { id: 'UPCOMING', label: 'Sắp diễn ra', count: bookings.filter((b) => b.status === 'PAID' || b.status === 'PENDING' || b.status === 'CHECKED_IN').length },
            { id: 'COMPLETED', label: 'Đã hoàn thành', count: bookings.filter((b) => b.status === 'COMPLETED').length },
            { id: 'CANCELLED', label: 'Đã hủy', count: bookings.filter((b) => b.status === 'CANCELLED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-deep-earth text-white shadow-xs'
                  : 'bg-white border border-outline-subtle text-on-surface-variant hover:text-deep-earth hover:border-outline-variant'
              }`}
            >
              {tab.label} ({tab.count})
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
                b.status === 'COMPLETED' ? 'success' :
                b.status === 'PAID' ? 'heritage' :
                b.status === 'CHECKED_IN' ? 'earth' : 'subtle';

              return (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-outline-subtle p-5 md:p-6 hover:shadow-md transition-all hover:border-primary/30"
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

                        <div className="mt-3 text-xs">
                          <span className="text-on-surface-variant">Tổng chi phí: </span>
                          <strong className="text-primary font-bold text-sm font-headline">
                            {formatCurrencyShort(b.totalAmount)}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-outline-subtle shrink-0">
                      {(b.status === 'PAID' || b.status === 'CHECKED_IN' || b.status === 'COMPLETED') && (
                        <Link to={`/my-bookings/${b._id}/ticket`} className="w-full sm:w-auto">
                          <Button size="sm" variant="primary" fullWidth className="font-bold">
                            <QrCode size={15} className="mr-1.5" /> Xem vé điện tử
                          </Button>
                        </Link>
                      )}

                      {(b.canReview || b.status === 'COMPLETED' || b.status === 'CHECKED_IN') && (
                        <Link to={`/review/${b._id}`} className="w-full sm:w-auto">
                          <Button size="sm" variant="secondary" fullWidth className="font-bold">
                            <Star size={15} className="mr-1.5 text-accent-gold fill-accent-gold" /> Viết đánh giá
                          </Button>
                        </Link>
                      )}

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
