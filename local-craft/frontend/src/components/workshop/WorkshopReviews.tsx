import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import reviewApi from '../../api/reviewApi';
import bookingApi from '../../api/bookingApi';
import type { ReviewableBooking, WorkshopReview } from '../../types/workshopDetail.type';
import Button from '../common/Button';

export default function WorkshopReviews({ workshopId }: { workshopId: string }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [reviews, setReviews] = useState<WorkshopReview[]>([]);
  const [bookings, setBookings] = useState<ReviewableBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    reviewApi.getByWorkshop(workshopId).then((response) => { if (active) setReviews(response.data.data); })
      .catch(() => { if (active) setError('Không tải được đánh giá. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [workshopId, attempt]);

  useEffect(() => {
    let active = true;
    setBookings([]);
    setBookingId('');
    setBookingError('');
    if (isAuthenticated && user?.role === 'TOURIST') {
      bookingApi.getMine().then((response) => {
        if (!active) return;
        const eligible = (response.data.data as ReviewableBooking[]).filter((booking) =>
          (typeof booking.workshopId === 'string' ? booking.workshopId : booking.workshopId?._id) === workshopId && booking.canReview);
        setBookings(eligible);
        setBookingId(eligible[0]?._id || '');
      }).catch(() => { if (active) setBookingError('Không kiểm tra được lượt tham gia của bạn.'); });
    }
    return () => { active = false; };
  }, [workshopId, isAuthenticated, user?._id, user?.role, attempt]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || !bookingId || !comment.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    setSuccess('');
    try {
      const response = await reviewApi.create({ bookingId, rating, comment: comment.trim() });
      const created = { ...response.data.data, touristId: { fullName: user?.fullName || 'Khách tham gia' } };
      setReviews((current) => [created, ...current]);
      const remaining = bookings.filter((booking) => booking._id !== bookingId);
      setBookings(remaining);
      setBookingId(remaining[0]?._id || '');
      setComment('');
      setSuccess('Đã đăng đánh giá của bạn. Cảm ơn bạn đã chia sẻ!');
    } catch (error: any) {
      setSubmitError(error.response?.data?.message || 'Không gửi được đánh giá. Nội dung của bạn vẫn được giữ lại.');
    } finally { setSubmitting(false); }
  }

  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : null;
  return (
    <section className="ws-panel" id="feedback" aria-labelledby="ws-feedback-title">
      <div className="ws-section-heading"><h2 id="ws-feedback-title"><MessageSquare size={21} /> Cảm nhận từ người tham gia</h2>
        {average && <span className="ws-rating"><Star size={18} fill="currentColor" /> {average} <small>({reviews.length} đánh giá)</small></span>}
      </div>
      {loading && <p role="status">Đang tải đánh giá…</p>}
      {error && <p role="alert" className="ws-error">{error} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Thử lại</button></p>}
      {!loading && !error && !reviews.length && <p className="ws-muted">Chưa có đánh giá. Hãy chia sẻ trải nghiệm của bạn sau khi tham gia workshop.</p>}
      <div className="ws-review-list">{reviews.map((review) => (
        <article key={review._id} className="ws-review">
          <div className="ws-review-header"><span className="ws-avatar" aria-hidden="true">{(review.touristId?.fullName || 'K')[0]}</span>
            <div><strong>{review.touristId?.fullName || 'Khách tham gia'}</strong><div className="ws-stars" aria-label={`${review.rating} trên 5 sao`}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={14} fill={value <= review.rating ? 'currentColor' : 'none'} />)}</div></div>
            <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</time>
          </div>
          <p className="ws-review-comment">{review.comment}</p>
          {review.hostReply && <div className="ws-host-reply"><strong>Phản hồi từ chủ xưởng</strong><p>{review.hostReply.message}</p></div>}
        </article>
      ))}</div>
      <div className="ws-write-review">
        <h3>Chia sẻ trải nghiệm của bạn</h3>
        {!isAuthenticated ? <p><Link to="/login">Đăng nhập</Link> để viết đánh giá sau khi tham gia.</p> : bookingError ? <p role="alert">{bookingError} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Thử lại</button></p> : !bookings.length ? <p className="ws-muted">Bạn có thể đánh giá mỗi lượt đặt chỗ một lần sau khi check-in hoặc hoàn thành workshop.</p> : (
          <form onSubmit={submit} className="ws-form">
            <label htmlFor="review-booking">Lượt tham gia</label>
            <select id="review-booking" value={bookingId} onChange={(event) => setBookingId(event.target.value)} disabled={submitting} required>{bookings.map((booking) => <option key={booking._id} value={booking._id}>{booking.bookingCode}</option>)}</select>
            <fieldset disabled={submitting}><legend>Bạn đánh giá trải nghiệm thế nào?</legend><div className="ws-rate-options">{[1, 2, 3, 4, 5].map((value) => <label key={value}><input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} /><span><Star size={17} fill={value <= rating ? 'currentColor' : 'none'} />{value} sao</span></label>)}</div></fieldset>
            <label htmlFor="review-comment">Cảm nhận của bạn</label>
            <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} required maxLength={2000} rows={4} placeholder="Điều bạn yêu thích và góp ý cho workshop…" disabled={submitting} />
            <Button type="submit" isLoading={submitting}>Đăng đánh giá</Button>
          </form>
        )}
        {submitError && <p role="alert" className="ws-error">{submitError}</p>}
        {success && <p role="status" className="ws-success">{success}</p>}
      </div>
    </section>
  );
}
