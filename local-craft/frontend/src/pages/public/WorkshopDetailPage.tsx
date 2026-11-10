import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Check, Calendar, Tag, ArrowLeft, Phone } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import workshopApi from '../../api/workshopApi';
import bookingApi from '../../api/bookingApi';
import paymentApi from '../../api/paymentApi';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { calculateWorkshopPrice } from '../../../../shared/workshopPricing';
import type { WorkshopDetail, WorkshopTimeslot } from '../../types/workshopDetail.type';
import Button from '../../components/common/Button';
import WorkshopGallery from '../../components/workshop/WorkshopGallery';
import WorkshopMap from '../../components/workshop/WorkshopMap';
import WorkshopReviews from '../../components/workshop/WorkshopReviews';
import './workshopDetail.css';

const money = (amount: number) => amount === 0 ? 'Miễn phí' : formatCurrencyShort(amount);
const dateTime = (value: string) => new Date(value).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

function WorkshopDetailContent({ id }: { id: string }) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(AuthContext);
  const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null);
  const [timeslots, setTimeslots] = useState<WorkshopTimeslot[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [slotError, setSlotError] = useState('');
  const [selectedTimeslot, setSelectedTimeslot] = useState('');
  const [guests, setGuests] = useState(1);
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    setSlotError('');
    workshopApi.getById(id).then((response) => { if (active) setWorkshop(response.data.data); })
      .catch((error) => { if (active) setLoadError(error.response?.status === 404 ? 'Không tìm thấy workshop.' : 'Không tải được workshop. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    workshopApi.getTimeslots(id).then((response) => {
      if (active) setTimeslots((response.data.data as WorkshopTimeslot[]).filter((slot) => new Date(slot.startTime).getTime() > Date.now()));
    }).catch(() => { if (active) setSlotError('Không tải được lịch workshop.'); });
    return () => { active = false; };
  }, [id, attempt]);

  if (loading) return <div className="workshop-detail ws-state" role="status">Đang tải workshop…</div>;
  if (loadError || !workshop) return <div className="workshop-detail ws-state"><p role="alert">{loadError || 'Không tìm thấy workshop.'}</p><Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button></div>;

  const selectedSlot = timeslots.find((slot) => slot._id === selectedTimeslot);
  const unitPrice = selectedSlot?.price ?? workshop.price;
  const maxGuests = Math.min(workshop.maxGuestsPerSlot, selectedSlot?.availableSlots ?? workshop.maxGuestsPerSlot);
  const validGuests = Number.isSafeInteger(guests) && guests >= 1 && guests <= maxGuests;
  let quote: ReturnType<typeof calculateWorkshopPrice> | null = null;
  let quoteError = '';
  try { if (validGuests) quote = calculateWorkshopPrice(unitPrice, guests, workshop.promotion, couponCode); }
  catch (error) { quoteError = (error as Error).message; }
  const category = typeof workshop.categoryId === 'object' ? workshop.categoryId.name : 'Trải nghiệm thủ công';

  function applyCoupon(event: React.FormEvent) {
    event.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) { setCouponError('Vui lòng nhập mã giảm giá.'); return; }
    try {
      const result = calculateWorkshopPrice(unitPrice, guests, workshop!.promotion, couponInput);
      setCouponCode(result.couponCode || '');
    } catch (error) { setCouponCode(''); setCouponError((error as Error).message); }
  }

  async function handleBook() {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!selectedSlot || !validGuests || submitting || !quote) return;
    setSubmitting(true);
    setBookingError('');
    try {
      let pendingId = bookingId;
      if (!pendingId) {
        const response = await bookingApi.create({ timeslotId: selectedTimeslot, quantity: guests, couponCode: couponCode || undefined });
        pendingId = response.data.data._id;
        setBookingId(pendingId);
      }
      const response = await paymentApi.createBookingPayment(pendingId);
      if (!response.data.data.checkoutUrl) throw new Error('Chưa nhận được liên kết thanh toán.');
      window.location.assign(response.data.data.checkoutUrl);
    } catch (error: any) {
      setBookingError(error.response?.data?.message || error.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
    } finally { setSubmitting(false); }
  }

  return (
    <main className="workshop-detail">
      <div className="ws-container">
        <Link className="ws-back" to="/workshops"><ArrowLeft size={16} /> Khám phá workshop</Link>
        <div className="ws-heading"><div><span className="ws-category">{category}</span><h1>{workshop.title}</h1>
          <div className="ws-meta"><span><MapPin size={16} />{workshop.locationLabel}</span><a href="#feedback"><Star size={16} />Xem đánh giá người tham gia</a><span>Cùng {workshop.hostName}</span></div>
        </div></div>
        <WorkshopGallery key={workshop.images.join('|')} images={workshop.images} title={workshop.title} />
        <div className="ws-layout">
          <div className="ws-main-content">
            <section className="ws-panel"><div className="ws-facts"><span><Clock />{workshop.duration} phút trải nghiệm</span><span><Users />Tối đa {workshop.maxGuestsPerSlot} khách</span></div>
              <h2>Một chút thủ công, một trải nghiệm đáng nhớ</h2><p className="ws-description">{workshop.description}</p>
              {!!workshop.includedItems?.length && <><h3>Trải nghiệm bao gồm</h3><ul className="ws-includes">{workshop.includedItems.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></>}
            </section>
            <WorkshopMap title={workshop.title} address={workshop.address?.fullAddress || ''} coordinates={workshop.mapLocation} />
            <section className="ws-panel" aria-labelledby="ws-schedule-title"><h2 id="ws-schedule-title"><Calendar size={21} /> Chọn lịch trải nghiệm</h2>
              {slotError ? <p role="alert">{slotError} <button type="button" onClick={() => setAttempt((value) => value + 1)}>Thử lại</button></p> : !timeslots.length ? <p className="ws-muted">Chưa có lịch sắp tới. Vui lòng liên hệ chủ xưởng để biết lịch mới.</p> : <div className="ws-slots">{timeslots.map((slot) => {
                const unavailable = slot.status !== 'AVAILABLE' || slot.availableSlots < 1;
                return <button type="button" key={slot._id} disabled={unavailable || !!bookingId || submitting} aria-pressed={selectedTimeslot === slot._id}
                  onClick={() => { setSelectedTimeslot(slot._id); setGuests(1); setCouponCode(''); setCouponError(''); setBookingError(''); }} className="ws-slot">
                  <span><strong>{dateTime(slot.startTime)}</strong><small>Đến {new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</small></span>
                  <span><strong>{money(slot.price)}</strong><small>{unavailable ? 'Hết chỗ' : `Còn ${slot.availableSlots} chỗ`}</small></span>
                </button>;
              })}</div>}
            </section>
            <WorkshopReviews workshopId={id} />
          </div>
          <aside className="ws-booking"><div className="ws-booking-card"><span className="ws-eyebrow">DÀNH THỜI GIAN CHO ĐIỀU BẠN THÍCH</span>
            <div className="ws-price">{money(unitPrice)}{unitPrice > 0 && <small>/ khách</small>}</div>
            <p className="ws-muted">{selectedSlot ? dateTime(selectedSlot.startTime) : 'Chọn lịch để xem giá chính xác.'}</p>
            <label htmlFor="ws-guests">Số khách</label><input id="ws-guests" type="number" min={1} max={maxGuests} step={1} value={Number.isNaN(guests) ? '' : guests} disabled={!!bookingId || submitting} onChange={(event) => setGuests(event.target.valueAsNumber)} />
            {!validGuests && <p role="alert" className="ws-error">Chọn từ 1 đến {maxGuests} khách.</p>}
            {unitPrice > 0 && <div className="ws-coupon">
              {workshop.promotion && <div className="ws-promotion"><Tag size={19} /><div><strong>Giảm {workshop.promotion.percentOff}% trải nghiệm</strong><p>Nhập mã <b>{workshop.promotion.code}</b> khi đặt chỗ</p></div></div>}
              <form onSubmit={applyCoupon}><label htmlFor="ws-coupon">Mã giảm giá</label><div className="ws-coupon-input"><input id="ws-coupon" value={couponInput} maxLength={32} placeholder="Nhập mã ưu đãi" disabled={!!bookingId || submitting} onChange={(event) => { setCouponInput(event.target.value); setCouponCode(''); setCouponError(''); }} /><Button type="submit" variant="outline" size="sm" disabled={!validGuests || !!bookingId || submitting}>Áp dụng</Button></div></form>
              {couponError && <p role="alert" className="ws-error">{couponError}</p>}
              {couponCode && <p role="status" className="ws-success">Đã áp dụng {couponCode}. <button type="button" disabled={!!bookingId || submitting} onClick={() => { setCouponCode(''); setCouponInput(''); }}>Bỏ mã</button></p>}
            </div>}
            <div className="ws-totals">{quote && <><div><span>{money(unitPrice)} × {guests} khách</span><span>{money(quote.subtotal)}</span></div>{quote.discountAmount > 0 && <div className="ws-success"><span>Ưu đãi {couponCode}</span><span>−{formatCurrencyShort(quote.discountAmount)}</span></div>}<div className="ws-total"><strong>Tổng cộng</strong><strong>{money(quote.totalPrice)}</strong></div></>}</div>
            {quoteError && <p role="alert" className="ws-error">{quoteError}</p>}
            {unitPrice === 0 ? <>{workshop.hostPhone ? <a className="ws-contact" href={`tel:${workshop.hostPhone}`}><Phone size={18} /> Liên hệ đăng ký miễn phí</a> : <p>Liên hệ chủ xưởng để đăng ký trải nghiệm miễn phí.</p>}</> : <Button fullWidth size="lg" disabled={!selectedSlot || !validGuests || !quote || (isAuthenticated && user?.role !== 'TOURIST')} isLoading={submitting} onClick={handleBook}>{bookingId ? 'Thử lại thanh toán' : 'Đặt trải nghiệm'}</Button>}
            {!selectedSlot && unitPrice > 0 && <p className="ws-muted ws-center">Chọn khung giờ để tiếp tục</p>}
            {isAuthenticated && user?.role !== 'TOURIST' && unitPrice > 0 && <p className="ws-muted">Đăng nhập bằng tài khoản khách để đặt chỗ.</p>}
            {bookingId && <p className="ws-muted">Đã tạo đặt chỗ. Thử lại để tiếp tục thanh toán cho cùng đặt chỗ, hoặc xem <Link to="/my-bookings">lịch đặt của bạn</Link>.</p>}
            {bookingError && <p role="alert" className="ws-error">{bookingError}</p>}
          </div></aside>
        </div>
      </div>
    </main>
  );
}

export default function WorkshopDetailPage() {
  const { id } = useParams<{ id: string }>();
  return id ? <WorkshopDetailContent key={id} id={id} /> : <p>Không tìm thấy workshop.</p>;
}
