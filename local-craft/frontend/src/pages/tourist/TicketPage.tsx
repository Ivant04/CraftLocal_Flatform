import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, Users, MapPin, Printer, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { bookings, workshops } from '../../utils/mockData';
import { formatTime } from '../../utils/formatDate';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const booking = bookings.find((b) => b._id === id);

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <h2 className="text-2xl font-headline font-bold text-deep-earth mb-2">Không tìm thấy vé</h2>
        <p className="text-on-surface-variant mb-6">Mã vé không tồn tại hoặc đã bị hủy.</p>
        <Link to="/my-bookings">
          <Button variant="primary">Xem danh sách lịch đặt</Button>
        </Link>
      </div>
    );
  }

  const workshop = workshops.find((w) => w._id === booking.workshopId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-surface-warm py-12 px-5">
      <div className="max-w-lg mx-auto">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/my-bookings" 
            className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại lịch đặt
          </Link>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            <Printer size={15} /> In vé / Lưu PDF
          </button>
        </div>

        {/* Boarding Pass Ticket Card */}
        <div className="bg-white rounded-3xl border border-outline-subtle shadow-xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-deep-earth to-primary text-white p-7 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="font-headline text-lg tracking-wider font-bold text-accent-gold">
                🏺 CraftLocal
              </span>
              <span className="text-[11px] uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full text-white/90 font-mono">
                PASS #{booking._id.slice(-6).toUpperCase()}
              </span>
            </div>
            <h1 className="font-headline text-2xl font-bold leading-tight">
              Vé Điện Tử Trải Nghiệm
            </h1>
            <p className="text-white/80 text-xs mt-1">
              Xuất trình mã QR tại xưởng để xác nhận tham gia
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-7 space-y-6">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-primary">Workshop</span>
              <h2 className="font-headline text-xl font-bold text-deep-earth mt-1 leading-snug">
                {booking.workshopTitle}
              </h2>
              {workshop?.location && (
                <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-2">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span>{workshop.location}</span>
                </div>
              )}
            </div>

            {/* QR Code Container */}
            <div className="bg-surface-warm p-6 rounded-2xl border border-outline-subtle flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-outline-subtle inline-block mb-3">
                <QRCodeSVG 
                  value={booking.qrCode || `CRAFTLOCAL-TICKET-${booking._id}`} 
                  size={160} 
                  level="H" 
                  fgColor="#3D2B1F"
                />
              </div>
              <p className="font-mono text-xs font-bold text-deep-earth tracking-widest uppercase">
                {booking.qrCode || booking._id}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-forest font-semibold mt-2">
                <ShieldCheck size={14} /> Mã xác thực bảo mật CraftLocal
              </div>
            </div>

            {/* Perforated Divider */}
            <div className="relative py-2">
              <div className="border-b-2 border-dashed border-outline-variant" />
              <div className="absolute -left-10 top-0 w-6 h-6 bg-surface-warm rounded-full" />
              <div className="absolute -right-10 top-0 w-6 h-6 bg-surface-warm rounded-full" />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-warm/60 border border-outline-subtle">
                <span className="text-on-surface-variant flex items-center gap-1 mb-1">
                  <Calendar size={13} className="text-primary" /> Ngày trải nghiệm
                </span>
                <span className="font-bold text-sm text-deep-earth block">
                  {booking.timeslotDate}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-warm/60 border border-outline-subtle">
                <span className="text-on-surface-variant flex items-center gap-1 mb-1">
                  <Clock size={13} className="text-primary" /> Khung giờ
                </span>
                <span className="font-bold text-sm text-deep-earth block font-mono">
                  {formatTime(booking.timeslotStartTime)} - {formatTime(booking.timeslotEndTime)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-warm/60 border border-outline-subtle">
                <span className="text-on-surface-variant flex items-center gap-1 mb-1">
                  <Users size={13} className="text-primary" /> Số lượng khách
                </span>
                <span className="font-bold text-sm text-deep-earth block">
                  {booking.guests} người
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-warm/60 border border-outline-subtle">
                <span className="text-on-surface-variant flex items-center gap-1 mb-1">
                  <Sparkles size={13} className="text-primary" /> Trạng thái
                </span>
                <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'heritage'} size="sm">
                  {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                </Badge>
              </div>
            </div>

            {/* Note */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 text-xs text-on-surface-variant leading-relaxed">
              <p className="font-bold text-deep-earth mb-1">Lưu ý trước khi đến xưởng:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Vui lòng có mặt trước giờ bắt đầu khoảng 10-15 phút.</li>
                <li>Xưởng có sẵn tạp dề và nước uống chào đón.</li>
                <li>Mọi thắc mắc hỗ trợ gấp vui lòng liên hệ hotline: 1900-LOCAL.</li>
              </ul>
            </div>
          </div>

          {/* Ticket Footer Action */}
          <div className="bg-surface-warm p-6 border-t border-outline-subtle text-center">
            <Link to="/my-bookings">
              <Button variant="outline" fullWidth>
                Quay lại quản lý lịch đặt
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
