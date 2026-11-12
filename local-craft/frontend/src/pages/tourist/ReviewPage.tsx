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
        <h2 className="text-2xl font-headline font-bold text-deep-earth mb-2">Không tìm thấy lịch đặt</h2>
        <p className="text-on-surface-variant mb-6">Lịch đặt không tồn tại để đánh giá.</p>
        <Link to="/my-bookings">
          <Button variant="primary">Quay lại danh sách lịch đặt</Button>
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Quay lại lịch đặt
        </Link>

        <div className="bg-white rounded-3xl border border-outline-subtle p-7 md:p-10 shadow-lg relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full bg-forest-50 text-forest flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-headline text-2xl font-bold text-deep-earth mb-2">
                Cảm ơn bạn đã đóng góp đánh giá!
              </h2>
              <p className="text-on-surface-variant text-sm mb-4">
                Những chia sẻ chân thực của bạn là nguồn động viên to lớn giúp nghệ nhân ngày càng hoàn thiện workshop.
              </p>
              <span className="text-xs text-primary font-medium animate-pulse">
                Đang chuyển hướng về lịch đặt của bạn...
              </span>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8">
                <span className="text-xs uppercase font-bold tracking-wider text-primary">Đánh giá trải nghiệm</span>
                <h1 className="font-headline text-2xl md:text-3xl font-bold text-deep-earth mt-1">
                  Cảm nhận của bạn về buổi thực hành
                </h1>

                <div className="mt-4 p-4 rounded-2xl bg-surface-warm border border-outline-subtle flex items-center gap-3">
                  {booking.workshopImage && (
                    <ImageWithFallback
                      src={booking.workshopImage}
                      alt={booking.workshopTitle}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-outline-subtle"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-deep-earth text-sm truncate">{booking.workshopTitle}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Ngày trải nghiệm: {booking.timeslotDate}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-deep-earth block mb-2">
                    Mức độ hài lòng của bạn
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setRating(n)}
                        className="p-1.5 transition-transform hover:scale-115 cursor-pointer"
                      >
                        <Star
                          size={32}
                          className={`${
                            n <= currentScore
                              ? 'text-accent-gold fill-accent-gold'
                              : 'text-outline-variant'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-primary block">
                    {ratingLabels[currentScore]}
                  </span>
                </div>

                {/* Suggestions */}
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/15 text-xs text-on-surface-variant space-y-1">
                  <p className="font-bold text-deep-earth flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" /> Bạn có thể chia sẻ thêm về:
                  </p>
                  <p>• Thái độ hướng dẫn và sự nhiệt tình của nghệ nhân.</p>
                  <p>• Không gian và dụng cụ thực hành tại xưởng.</p>
                  <p>• Tác phẩm thủ công tự tay bạn mang về.</p>
                </div>

                {/* Comment Box */}
                <div>
                  <Textarea
                    label="Lời bình luận & góp ý"
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
                  variant="primary"
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
