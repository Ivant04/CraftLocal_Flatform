import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Calendar, Clock, Users, MapPin, Printer, ArrowLeft, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import bookingApi from '../../api/bookingApi';
import { normalizeBooking } from '../../utils/normalizers';
import type { Booking } from '../../types/booking.type';
import { formatTime } from '../../utils/formatDate';
import { BOOKING_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import BrandLogo from '../../components/common/BrandLogo';

const TicketPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError('');

    bookingApi
      .getTicket(id)
      .then((res) => {
        if (active) setBooking(normalizeBooking(res.data?.data));
      })
      .catch(async (err) => {
        try {
          const fallback = await bookingApi.getById(id);
          if (active) setBooking(normalizeBooking(fallback.data?.data));
        } catch {
          if (active) setError(err?.response?.data?.message || 'Mã vé không tồn tại hoặc chưa được tạo.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-craft-contour flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-craft-contour flex flex-col items-center justify-center py-20 px-5 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-2">Không tìm thấy vé</h2>
        <p className="text-[#7A6255] text-sm mb-6">{error || 'Mã vé không tồn tại hoặc đã bị hủy.'}</p>
        <Link to="/my-bookings">
          <Button>Quay lại danh sách vé</Button>
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-craft-contour py-12 px-5">
      <div className="max-w-xl mx-auto">
        {/* Navigation & Print Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/my-bookings"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#7A6255] hover:text-[#964824] transition-colors"
          >
            <ArrowLeft size={16} /> Quay lại lịch đặt chỗ
          </Link>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-[#EAD8CC] bg-white text-xs font-semibold text-[#3D2B1F] hover:bg-[#FAF7F2] hover:text-[#964824] transition-all shadow-xs cursor-pointer"
          >
            <Printer size={15} /> In vé điện tử
          </button>
        </div>

        {/* Ticket Container */}
        <div className="bg-white rounded-3xl border border-[#EAD8CC] shadow-xl overflow-hidden relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#3D2B1F] to-[#964824] text-white p-7 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono tracking-widest uppercase opacity-80">
                Vé điện tử CraftLocal
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md">
                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
              </span>
            </div>
            <h1 className="font-serif text-2xl font-bold">Thẻ tham gia Workshop</h1>
            <p className="text-white/80 text-xs mt-1">
              Trình mã QR này cho hướng dẫn viên khi đến xưởng để thực hiện check-in.
            </p>
          </div>

          {/* Ticket Body */}
          <div className="p-7 space-y-6">
            {/* Workshop Info */}
            <div className="border-b border-[#EAD8CC] pb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#964824] bg-[#964824]/10 px-2 py-0.5 rounded-md">
                Workshop Trải nghiệm
              </span>
              <h2 className="font-serif text-xl font-bold text-[#3D2B1F] mt-2 leading-snug">
                {booking.workshopTitle}
              </h2>
              {booking.workshopLocation && (
                <div className="flex items-center gap-1.5 text-xs text-[#7A6255] mt-2">
                  <MapPin size={14} className="text-[#964824] shrink-0" />
                  <span>{booking.workshopLocation}</span>
                </div>
              )}
            </div>

            {/* QR Code Presentation */}
            <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#EAD8CC] flex flex-col items-center justify-center text-center">
              <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-[#EAD8CC] inline-block mb-3">
                <QRCodeSVG
                  value={booking.qrCode || booking.bookingCode || booking._id}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="font-mono text-xs font-bold text-[#3D2B1F] tracking-widest uppercase">
                {booking.qrCode || booking.bookingCode || booking._id}
              </p>
              <p className="text-[11px] text-[#7A6255] mt-1 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" /> Mã vé được bảo mật & xác thực tự động
              </p>
            </div>

            {/* Schedule Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC]">
                <span className="text-[#7A6255] flex items-center gap-1.5 mb-1">
                  <Calendar size={13} className="text-[#964824]" /> Ngày trải nghiệm
                </span>
                <span className="font-bold text-sm text-[#3D2B1F] block">{booking.timeslotDate}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC]">
                <span className="text-[#7A6255] flex items-center gap-1.5 mb-1">
                  <Clock size={13} className="text-[#964824]" /> Khung giờ
                </span>
                <span className="font-bold text-sm text-[#3D2B1F] block font-mono">
                  {formatTime(booking.timeslotStartTime)} - {formatTime(booking.timeslotEndTime)}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC]">
                <span className="text-[#7A6255] flex items-center gap-1.5 mb-1">
                  <Users size={13} className="text-[#964824]" /> Số lượng khách
                </span>
                <span className="font-bold text-sm text-[#3D2B1F] block">{booking.guests} người</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC]">
                <span className="text-[#7A6255] flex items-center gap-1.5 mb-1">
                  <Sparkles size={13} className="text-[#964824]" /> Trạng thái
                </span>
                <span className="font-bold text-sm text-[#964824] block">
                  {booking.checkInStatus === 'CHECKED_IN' ? 'Đã check-in' : 'Chưa check-in'}
                </span>
              </div>
            </div>

            {/* Tourist Note */}
            <div className="p-4 rounded-xl bg-[#964824]/5 border border-[#964824]/15 text-xs text-[#7A6255] leading-relaxed">
              <p className="font-bold text-[#3D2B1F] mb-1">Lưu ý trước khi đến xưởng:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Vui lòng có mặt trước giờ bắt đầu khoảng 10-15 phút để làm thủ tục check-in.</li>
                <li>Xưởng cung cấp đầy đủ tạp dề và nguyên vật liệu thực hành thủ công.</li>
                <li>Tác phẩm sau khi hoàn thiện sẽ được nghệ nhân hỗ trợ đóng gói để bạn mang về.</li>
              </ul>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-[#FAF7F2] p-5 border-t border-[#EAD8CC] text-center">
            <Link to="/my-bookings">
              <Button fullWidth>Quay lại lịch đặt chỗ</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
