import React from 'react';
import { Link } from 'react-router-dom';
import { bookings } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate, formatTime } from '../../utils/formatDate';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const MyBookingsPage: React.FC = () => {
  if (bookings.length === 0) return <EmptyState title="Chưa có lịch đặt" description="Bạn chưa đặt workshop nào. Hãy khám phá các trải nghiệm thú vị!" />;

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-10">
      <h1 className="font-headline-lg text-headline-md text-deep-earth mb-8">Lịch đặt của tôi</h1>
      <div className="space-y-4">
        {bookings.map((b) => (
          <div key={b._id} className="bg-white rounded-xl border border-soft-clay p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-4">
              {b.workshopImage && <img src={b.workshopImage} alt={b.workshopTitle} className="w-full md:w-32 h-24 rounded-lg object-cover" />}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold">{b.workshopTitle}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold shrink-0 ${statusColors[b.status]}`}>{BOOKING_STATUS_LABELS[b.status]}</span>
                </div>
                <p className="text-sm text-on-surface-variant">{b.timeslotDate} · {formatTime(b.timeslotStartTime)} - {formatTime(b.timeslotEndTime)}</p>
                <p className="text-sm text-on-surface-variant">{b.guests} khách · {formatCurrencyShort(b.totalAmount)}</p>
              </div>
              <div className="flex md:flex-col gap-2">
                {b.status === 'PAID' && <Link to={`/my-bookings/${b._id}/ticket`}><Button size="sm" variant="outline">Xem vé</Button></Link>}
                {b.status === 'COMPLETED' && <Link to={`/review/${b._id}`}><Button size="sm" variant="secondary">Viết đánh giá</Button></Link>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookingsPage;
