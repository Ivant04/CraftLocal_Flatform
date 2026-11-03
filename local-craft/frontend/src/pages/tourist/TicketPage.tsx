import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { bookings } from '../../utils/mockData';
import { formatTime } from '../../utils/formatDate';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';

const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const booking = bookings.find((b) => b._id === id);

  if (!booking) return <div className="text-center py-20">Không tìm thấy vé</div>;

  return (
    <div className="max-w-md mx-auto px-5 py-10">
      <div className="bg-white rounded-2xl border border-soft-clay overflow-hidden shadow-xl">
        <div className="bg-primary p-6 text-white text-center">
          <h1 className="font-headline-lg text-xl mb-1">Vé điện tử</h1>
          <p className="text-white/70 text-sm">CraftLocal</p>
        </div>
        <div className="p-6">
          <h2 className="font-semibold text-lg text-center mb-4">{booking.workshopTitle}</h2>
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <QRCodeSVG value={booking.qrCode || booking._id} size={180} level="H" />
            </div>
          </div>
          <p className="text-center text-xs text-on-surface-variant mb-6 font-mono">{booking.qrCode}</p>
          <p className="text-center text-sm text-on-surface-variant mb-6">Vui lòng xuất trình mã QR này để check-in</p>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-on-surface-variant">Ngày</span><span className="font-medium">{booking.timeslotDate}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Giờ</span><span className="font-medium">{formatTime(booking.timeslotStartTime)} - {formatTime(booking.timeslotEndTime)}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Số khách</span><span className="font-medium">{booking.guests}</span></div>
            <div className="flex justify-between"><span className="text-on-surface-variant">Trạng thái</span><span className="font-medium text-primary">{BOOKING_STATUS_LABELS[booking.status]}</span></div>
          </div>
        </div>
        <div className="border-t border-dashed border-soft-clay p-6 text-center">
          <Link to="/my-bookings"><Button variant="outline" fullWidth>Quay lại lịch đặt</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
