import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Clock, Users, Star, Check, Calendar, ShieldCheck, 
  Sparkles, Award, Heart, Share2, ArrowLeft, ChevronRight,
  Coffee, Palette, AlertCircle
} from 'lucide-react';
import { workshops, timeslots, reviews } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import { TIMESLOT_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import RatingStars from '../../components/common/RatingStars';
import WorkshopCard from '../../components/workshop/WorkshopCard';

const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedTimeslot, setSelectedTimeslot] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const workshop = workshops.find((w) => w._id === id);
  if (!workshop) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 py-24 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
          <Palette size={36} />
        </div>
        <h2 className="text-2xl font-headline font-bold text-deep-earth mb-2">Không tìm thấy workshop</h2>
        <p className="text-on-surface-variant mb-6">Workshop bạn đang tìm kiếm không tồn tại hoặc đã tạm dừng nhận khách.</p>
        <Link to="/workshops">
          <Button variant="primary">Khám phá các workshop khác</Button>
        </Link>
      </div>
    );
  }

  const wsTimeslots = timeslots.filter((ts) => ts.workshopId === id);
  const wsReviews = reviews.filter((r) => r.workshopId === id);
  const relatedWorkshops = workshops.filter((w) => w._id !== id && w.category === workshop.category).slice(0, 3);

  const selectedSlotData = wsTimeslots.find((ts) => ts._id === selectedTimeslot);

  const handleBook = () => {
    if (!isAuthenticated) { 
      navigate('/login'); 
      return; 
    }
    navigate(`/checkout?workshopId=${id}&timeslotId=${selectedTimeslot}&guests=${guests}`);
  };

  const images = workshop.images?.length > 0 
    ? workshop.images 
    : ['/src/assets/images/pottery-workshop.jpg'];

  return (
    <div className="min-h-screen bg-surface-warm pb-20">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-outline-subtle bg-white/60">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-3.5 flex items-center justify-between text-xs md:text-sm text-on-surface-variant">
          <div className="flex items-center gap-2 overflow-hidden">
            <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
            <ChevronRight size={14} className="opacity-50 shrink-0" />
            <Link to="/workshops" className="hover:text-primary transition-colors">Workshop</Link>
            <ChevronRight size={14} className="opacity-50 shrink-0" />
            <span className="text-deep-earth font-medium truncate max-w-[200px] md:max-w-[400px]">
              {workshop.title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setIsLiked(!isLiked)} 
              className={`p-2 rounded-full border border-outline-variant hover:border-primary/50 transition-colors ${isLiked ? 'text-rose-600 bg-rose-50' : 'text-on-surface-variant hover:text-primary'}`}
              title="Lưu vào danh sách yêu thích"
            >
              <Heart size={16} className={isLiked ? 'fill-rose-600' : ''} />
            </button>
            <button 
              onClick={() => navigator.clipboard?.writeText(window.location.href)}
              className="p-2 rounded-full border border-outline-variant hover:border-primary/50 transition-colors text-on-surface-variant hover:text-primary"
              title="Chia sẻ liên kết"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 pt-8">
        {/* Title Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="heritage" size="sm">
              <Sparkles size={12} className="mr-1 inline text-primary" />
              {workshop.category}
            </Badge>
            <span className="text-xs text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full font-medium">
              Di sản văn hóa địa phương
            </span>
          </div>

          <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-deep-earth leading-tight mb-3">
            {workshop.title}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-sm text-on-surface-variant">
            <div className="flex items-center gap-1.5 font-semibold text-deep-earth">
              <Star size={16} className="text-accent-gold fill-accent-gold" />
              <span>{workshop.rating?.toFixed(1) || '5.0'}</span>
              <span className="text-on-surface-variant font-normal">({workshop.totalReviews} đánh giá)</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline-block" />
            <div className="flex items-center gap-1">
              <MapPin size={16} className="text-primary" />
              <span>{workshop.location}</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline-block" />
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-primary" />
              <span>{workshop.duration} phút trải nghiệm</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:inline-block" />
            <div className="flex items-center gap-1">
              <Users size={16} className="text-primary" />
              <span>Tối đa {workshop.maxGuests} khách / nhóm</span>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 mb-10 h-[320px] md:h-[460px]">
          {/* Main Hero Image */}
          <div className="md:col-span-3 rounded-2xl overflow-hidden relative group bg-surface-container">
            <img 
              src={images[activeImageIndex] || images[0]} 
              alt={workshop.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-earth/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 text-white text-xs bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
              Ảnh thực tế tại xưởng • {workshop.location}
            </div>
          </div>

          {/* Side Thumbnail List */}
          <div className="hidden md:flex flex-col gap-3 h-full">
            {images.slice(0, 3).map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative flex-1 rounded-xl overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20 scale-98' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`${workshop.title} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {images.length < 3 && (
              <div className="flex-1 rounded-xl bg-surface-container border border-dashed border-outline-variant flex flex-col items-center justify-center p-4 text-center text-xs text-on-surface-variant">
                <Palette size={20} className="mb-1 text-primary opacity-60" />
                <span>Không gian xưởng truyền thống</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content & Sticky Booking Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Workshop Details */}
          <div className="lg:col-span-2 space-y-10">
            {/* Host highlight card */}
            <div className="p-6 bg-white rounded-2xl border border-outline-subtle shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shrink-0">
                  {workshop.hostName ? workshop.hostName[0] : 'N'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-deep-earth text-base">{workshop.hostName || 'Nghệ nhân bản địa'}</span>
                    <ShieldCheck size={16} className="text-forest" title="Nghệ nhân đã xác minh" />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">Nghệ nhân truyền thừa làng nghề truyền thống</p>
                  <p className="text-xs text-primary font-medium mt-1">★ 4.9/5 điểm hài lòng của du khách</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-forest-50 text-forest border border-forest/20">
                  Nghệ nhân tiêu biểu
                </span>
              </div>
            </div>

            {/* Experience Story & Description */}
            <div className="bg-white p-7 rounded-2xl border border-outline-subtle shadow-xs">
              <h2 className="font-headline text-xl font-bold text-deep-earth mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-primary" />
                Về trải nghiệm này
              </h2>
              <div className="prose prose-stone max-w-none text-on-surface-variant text-sm md:text-base leading-relaxed space-y-4">
                <p>{workshop.description}</p>
                <p>
                  Đến với xưởng, bạn không chỉ được quan sát các công đoạn chế tác tinh tế mà còn được trực tiếp
                  nhúng tay vào từng khâu dưới sự kèm cặp 1-1 của nghệ nhân. Bạn sẽ cảm nhận nhịp thở của làng nghề,
                  thấu hiểu giá trị của từng đường nét hoa văn và tự tay làm ra tác phẩm độc bản mang đậm dấu ấn cá nhân.
                </p>
              </div>
            </div>

            {/* What's included checklist */}
            <div className="bg-white p-7 rounded-2xl border border-outline-subtle shadow-xs">
              <h2 className="font-headline text-xl font-bold text-deep-earth mb-4 flex items-center gap-2">
                <Award size={20} className="text-primary" />
                Trải nghiệm đã bao gồm
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(workshop.includes && workshop.includes.length > 0 ? workshop.includes : [
                  'Toàn bộ nguyên vật liệu và dụng cụ chế tác',
                  'Sản phẩm tự tay làm ra được mang về làm kỷ niệm',
                  'Trà thảo mộc và bánh ngọt truyền thống địa phương',
                  'Nghệ nhân hướng dẫn trực tiếp tận tình',
                  'Hỗ trợ đóng gói an toàn để mang đi đường xa',
                  'Ảnh kỷ niệm trong suốt quá trình trải nghiệm'
                ]).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-warm/80 border border-outline-subtle">
                    <div className="w-5 h-5 rounded-full bg-forest/15 text-forest flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={13} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs md:text-sm text-on-surface font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeslots Selector */}
            <div className="bg-white p-7 rounded-2xl border border-outline-subtle shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline text-xl font-bold text-deep-earth flex items-center gap-2">
                  <Calendar size={20} className="text-primary" />
                  Chọn lịch & khung giờ trải nghiệm
                </h2>
                <span className="text-xs text-on-surface-variant font-medium">
                  {wsTimeslots.length} ca trải nghiệm khả dụng
                </span>
              </div>

              {wsTimeslots.length === 0 ? (
                <div className="p-8 text-center bg-surface-warm rounded-xl border border-dashed border-outline-variant">
                  <Calendar size={32} className="mx-auto mb-2 text-on-surface-variant opacity-40" />
                  <p className="text-sm font-medium text-deep-earth">Hiện chưa có lịch trống cho workshop này</p>
                  <p className="text-xs text-on-surface-variant mt-1">Vui lòng quay lại sau hoặc liên hệ xưởng để đặt lịch riêng.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {wsTimeslots.map((ts) => {
                    const isSelected = selectedTimeslot === ts._id;
                    const isFull = ts.status === 'FULL' || ts.availableSlots <= 0;

                    return (
                      <button
                        key={ts._id}
                        type="button"
                        onClick={() => !isFull && setSelectedTimeslot(ts._id)}
                        disabled={isFull}
                        className={`p-4 rounded-xl border text-left transition-all relative ${
                          isSelected
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm'
                            : isFull
                            ? 'border-outline-subtle bg-gray-50 opacity-50 cursor-not-allowed'
                            : 'border-outline-variant hover:border-primary/50 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                              Ngày {ts.date}
                            </span>
                            <p className="text-base font-bold text-deep-earth mt-0.5">
                              {formatTime(ts.startTime)} - {formatTime(ts.endTime)}
                            </p>
                          </div>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isFull 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-forest-50 text-forest border border-forest/20'
                          }`}>
                            {isFull ? 'Hết chỗ' : `Còn ${ts.availableSlots} chỗ`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-on-surface-variant mt-2 pt-2 border-t border-outline-subtle">
                          <span>Hướng dẫn bởi nghệ nhân</span>
                          {isSelected && (
                            <span className="text-primary font-bold flex items-center gap-1">
                              <Check size={14} /> Đã chọn
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Reviews & Ratings */}
            <div className="bg-white p-7 rounded-2xl border border-outline-subtle shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-outline-subtle">
                <div>
                  <h2 className="font-headline text-xl font-bold text-deep-earth mb-1">
                    Đánh giá từ du khách
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Trải nghiệm thực tế từ các du khách đã hoàn thành workshop
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-surface-warm px-4 py-2.5 rounded-xl border border-outline-subtle">
                  <div className="text-3xl font-extrabold text-primary font-headline">
                    {workshop.rating?.toFixed(1) || '5.0'}
                  </div>
                  <div>
                    <RatingStars rating={workshop.rating || 5} size={14} />
                    <p className="text-xs text-on-surface-variant mt-0.5 font-medium">
                      {workshop.totalReviews} đánh giá hài lòng
                    </p>
                  </div>
                </div>
              </div>

              {wsReviews.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant text-sm">
                  Chưa có đánh giá nào cho workshop này. Hãy là người đầu tiên trải nghiệm!
                </div>
              ) : (
                <div className="space-y-4">
                  {wsReviews.map((r) => (
                    <div key={r._id} className="p-4 rounded-xl bg-surface-warm/60 border border-outline-subtle">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                            {r.touristName ? r.touristName[0] : 'K'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-deep-earth">{r.touristName}</p>
                            <span className="text-[11px] text-on-surface-variant">Du khách đã trải nghiệm</span>
                          </div>
                        </div>
                        <RatingStars rating={r.rating} size={12} />
                      </div>
                      <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                        "{r.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-outline-subtle p-6 shadow-md">
              <div className="border-b border-outline-subtle pb-4 mb-5">
                <span className="text-xs uppercase tracking-wider text-on-surface-variant font-medium">Giá trải nghiệm</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-primary font-headline">
                    {formatCurrencyShort(workshop.price)}
                  </span>
                  <span className="text-xs text-on-surface-variant">/ khách</span>
                </div>
              </div>

              {/* Guest Counter */}
              <div className="mb-5">
                <label className="text-xs font-bold text-deep-earth block mb-2 uppercase tracking-wider">
                  Số lượng khách tham gia
                </label>
                <div className="flex items-center justify-between p-2 border border-outline-variant rounded-xl bg-surface-warm">
                  <button
                    type="button"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="w-10 h-10 rounded-lg bg-white border border-outline-subtle flex items-center justify-center text-deep-earth hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-deep-earth"
                  >
                    -
                  </button>
                  <div className="text-center">
                    <span className="text-base font-bold text-deep-earth">{guests} khách</span>
                    <span className="text-[11px] text-on-surface-variant block">Tối đa {workshop.maxGuests} khách</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuests(Math.min(workshop.maxGuests, guests + 1))}
                    disabled={guests >= workshop.maxGuests}
                    className="w-10 h-10 rounded-lg bg-white border border-outline-subtle flex items-center justify-center text-deep-earth hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-deep-earth"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Timeslot Summary */}
              <div className="mb-5 p-3 rounded-xl bg-surface-warm border border-outline-subtle text-xs">
                <div className="text-on-surface-variant font-medium mb-1">Khung giờ đã chọn:</div>
                {selectedSlotData ? (
                  <div className="font-bold text-deep-earth flex items-center justify-between">
                    <span>{selectedSlotData.date}</span>
                    <span className="text-primary font-mono">{formatTime(selectedSlotData.startTime)} - {formatTime(selectedSlotData.endTime)}</span>
                  </div>
                ) : (
                  <div className="text-rose-600 flex items-center gap-1.5 font-medium">
                    <AlertCircle size={14} /> Vui lòng chọn ca trải nghiệm ở danh sách bên
                  </div>
                )}
              </div>

              {/* Total Calculation */}
              <div className="border-t border-outline-subtle pt-4 mb-6 space-y-2 text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{formatCurrencyShort(workshop.price)} × {guests} khách</span>
                  <span>{formatCurrencyShort(workshop.price * guests)}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Phí bảo tồn di sản</span>
                  <span className="text-forest font-medium">Miễn phí</span>
                </div>
                <div className="flex justify-between font-extrabold text-base text-deep-earth pt-2 border-t border-outline-subtle">
                  <span>Tổng thanh toán</span>
                  <span className="text-primary text-xl font-headline font-bold">
                    {formatCurrencyShort(workshop.price * guests)}
                  </span>
                </div>
              </div>

              {/* Booking CTA */}
              <Button
                variant="primary"
                fullWidth
                size="lg"
                disabled={!selectedTimeslot}
                onClick={handleBook}
                className="py-3.5 shadow-md font-bold"
              >
                {selectedTimeslot ? 'Đặt trải nghiệm ngay' : 'Chọn khung giờ để đặt'}
              </Button>

              {/* Trust Badges in Booking Widget */}
              <div className="mt-5 space-y-2 pt-4 border-t border-outline-subtle text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-forest shrink-0" />
                  <span>Xác nhận vé điện tử & mã QR check-in ngay sau thanh toán</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-primary shrink-0" />
                  <span>Hỗ trợ hủy miễn phí trước 24 giờ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Workshops */}
        {relatedWorkshops.length > 0 && (
          <div className="mt-20 pt-12 border-t border-outline-subtle">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-bold">Trải nghiệm tương tự</span>
                <h3 className="font-headline text-2xl font-bold text-deep-earth mt-1">Các workshop cùng chuyên đề</h3>
              </div>
              <Link to="/workshops" className="text-xs md:text-sm font-semibold text-primary hover:underline">
                Xem tất cả →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedWorkshops.map((w) => (
                <WorkshopCard key={w._id} workshop={w} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
