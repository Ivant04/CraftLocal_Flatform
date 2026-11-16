import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Sparkles, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import bookingApi from '../../api/bookingApi';
import reviewApi from '../../api/reviewApi';
import { normalizeBooking } from '../../utils/normalizers';
import type { Booking } from '../../types/booking.type';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import Loading from '../../components/common/Loading';

const ratingLabels: Record<number, string> = {
  1: 'Chưa hài lòng - Cần cải thiện nhiều',
  2: 'Tạm được - Trải nghiệm ở mức cơ bản',
  3: 'Bình thường - Đạt kỳ vọng',
  4: 'Hài lòng - Xưởng chu đáo, trải nghiệm vui',
  5: 'Tuyệt vời! Rất khuyến khích trải nghiệm',
};

const ReviewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    setLoading(true);
    bookingApi
      .getById(bookingId)
      .then((res) => {
        if (active) setBooking(normalizeBooking(res.data?.data));
      })
      .catch(() => {
        if (active) setBooking(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 flex justify-center">
        <Loading />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-5 py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-[#3D2B1F] mb-2">Không tìm thấy lịch đặt</h2>
        <p className="text-[#7A6255] text-sm mb-6">Lịch đặt không tồn tại hoặc đã bị hủy.</p>
        <Link to="/my-bookings">
          <Button>Quay lại lịch đặt chỗ</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await reviewApi.create({
        bookingId,
        workshopId: booking.workshopId,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không gửi được đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentScore = hoverRating || rating;

  return (
    <div className="min-h-screen bg-craft-contour py-12 px-5">
      <div className="max-w-xl mx-auto">
        <Link
          to="/my-bookings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6255] hover:text-[#964824] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Quay lại lịch đặt
        </Link>

        <div className="bg-white rounded-3xl border border-[#EAD8CC] p-7 md:p-10 shadow-lg relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#3D2B1F]">
                Cảm ơn bạn đã đóng góp đánh giá!
              </h2>
              <p className="text-[#7A6255] text-xs md:text-sm max-w-sm mx-auto">
                Những chia sẻ chân thực của bạn là nguồn động viên to lớn giúp nghệ nhân ngày càng hoàn thiện workshop.
              </p>
              <p className="text-xs text-[#964824] font-medium animate-pulse">
                Đang chuyển hướng về trang lịch đặt chỗ...
              </p>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
                  Cảm nhận trải nghiệm
                </span>
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
                  Đánh giá Workshop
                </h1>
                <p className="text-xs md:text-sm text-[#7A6255] mt-1">
                  Góp ý chân thành của bạn giúp giữ gìn và nâng tầm nghệ thuật thủ công truyền thống.
                </p>
              </div>

              {/* Workshop Card Mini */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAD8CC] mb-6">
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#EAD8CC]">
                  <ImageWithFallback
                    src={booking.workshopImage}
                    alt={booking.workshopTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-[#3D2B1F] line-clamp-1">
                    {booking.workshopTitle}
                  </h3>
                  <p className="text-xs text-[#7A6255] mt-0.5">
                    Mã vé: <span className="font-mono font-semibold">{booking.bookingCode}</span>
                  </p>
                  <p className="text-xs text-[#7A6255]">
                    Ngày tham gia: <span>{booking.date}</span>
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating Stars */}
                <div className="text-center space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#7A6255] block">
                    Mức độ hài lòng chung
                  </label>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(n)}
                        className="p-1.5 transition-transform hover:scale-115 cursor-pointer"
                      >
                        <Star
                          size={32}
                          className={`${
                            n <= currentScore
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-stone-300'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#964824] block">
                    {ratingLabels[currentScore]}
                  </span>
                </div>

                {/* Suggestions */}
                <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC] text-xs text-[#7A6255] space-y-1">
                  <p className="font-bold text-[#3D2B1F] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#964824]" /> Bạn có thể chia sẻ thêm về:
                  </p>
                  <p>• Thái độ hướng dẫn và sự nhiệt tình của nghệ nhân/HDV.</p>
                  <p>• Không gian xưởng và dụng cụ thực hành làng nghề.</p>
                  <p>• Tác phẩm thủ công tự tay bạn sáng tạo và mang về.</p>
                </div>

                {/* Comment Box */}
                <div>
                  <Textarea
                    label="Lời bình luận & góp ý cho xưởng"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Kể lại cảm xúc, kỷ niệm đáng nhớ hoặc góp ý để xưởng phục vụ tốt hơn..."
                    rows={4}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={submitting}
                  className="py-3.5 font-bold shadow-md"
                >
                  Gửi đánh giá trải nghiệm
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
