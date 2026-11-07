import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Star, Check, Calendar } from 'lucide-react';
import { workshops, timeslots, reviews } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatTime } from '../../utils/formatDate';
import { useAuth } from '../../hooks/useAuth';
import { TIMESLOT_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';

const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [selectedTimeslot, setSelectedTimeslot] = useState('');
  const [guests, setGuests] = useState(1);

  const workshop = workshops.find((w) => w._id === id);
  if (!workshop) return <div className="text-center py-20">Không tìm thấy workshop</div>;

  const wsTimeslots = timeslots.filter((ts) => ts.workshopId === id);
  const wsReviews = reviews.filter((r) => r.workshopId === id);

  const handleBook = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    navigate(`/checkout?workshopId=${id}&timeslotId=${selectedTimeslot}&guests=${guests}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px]">
        <img src={workshop.images[0] || '/src/assets/images/pottery-workshop.jpg'} alt={workshop.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
          <span className="px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-primary mb-4 inline-block">{workshop.category}</span>
          <h1 className="font-headline-lg text-headline-lg text-white text-shadow-subtle">{workshop.title}</h1>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><MapPin size={16} /> {workshop.location}</span>
              <span className="flex items-center gap-1"><Clock size={16} /> {workshop.duration} phút</span>
              <span className="flex items-center gap-1"><Users size={16} /> Tối đa {workshop.maxGuests} khách</span>
              <span className="flex items-center gap-1"><Star size={16} className="text-amber-500" /> {workshop.rating} ({workshop.totalReviews} đánh giá)</span>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-deep-earth mb-4">Mô tả</h2>
              <p className="text-on-surface-variant leading-relaxed">{workshop.description}</p>
            </div>

            {workshop.includes && (
              <div>
                <h2 className="text-xl font-semibold text-deep-earth mb-4">Bao gồm</h2>
                <div className="grid grid-cols-2 gap-3">
                  {workshop.includes.map((item) => (
                    <div key={item} className="flex items-center gap-2"><Check size={16} className="text-green-500" /><span className="text-sm">{item}</span></div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeslots */}
            <div>
              <h2 className="text-xl font-semibold text-deep-earth mb-4">Chọn khung giờ</h2>
              <div className="space-y-2">
                {wsTimeslots.map((ts) => (
                  <button
                    key={ts._id}
                    onClick={() => ts.status !== 'FULL' && setSelectedTimeslot(ts._id)}
                    disabled={ts.status === 'FULL'}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${selectedTimeslot === ts._id ? 'border-primary bg-primary/5' : ts.status === 'FULL' ? 'border-outline-variant bg-gray-50 opacity-50 cursor-not-allowed' : 'border-outline-variant hover:border-primary/30'}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Calendar size={18} className="text-primary" />
                        <div>
                          <p className="font-medium">{ts.date}</p>
                          <p className="text-xs text-on-surface-variant">{formatTime(ts.startTime)} - {formatTime(ts.endTime)}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ts.status === 'FULL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {TIMESLOT_STATUS_LABELS[ts.status] || ts.status} {ts.status !== 'FULL' && `(${ts.availableSlots})`}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {wsReviews.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-deep-earth mb-4">Đánh giá ({wsReviews.length})</h2>
                <div className="space-y-4">
                  {wsReviews.map((r) => (
                    <div key={r._id} className="p-5 bg-white rounded-xl border border-soft-clay">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-soft-clay flex items-center justify-center font-semibold text-primary">{r.touristName[0]}</div>
                        <div>
                          <p className="font-medium">{r.touristName}</p>
                          <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} size={12} className="text-amber-500 fill-amber-500" />)}</div>
                        </div>
                      </div>
                      <p className="text-on-surface-variant text-sm">{r.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Box */}
          <div>
            <div className="sticky top-24 bg-white rounded-2xl border border-soft-clay p-6 shadow-lg">
              <div className="text-center mb-6">
                <p className="text-3xl font-bold text-primary">{formatCurrencyShort(workshop.price)}</p>
                <p className="text-sm text-on-surface-variant">mỗi khách</p>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium block mb-1.5">Số khách</label>
                <input type="number" min={1} max={workshop.maxGuests} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full px-4 py-3 border border-outline-variant rounded-xl" />
              </div>
              <div className="border-t border-soft-clay pt-4 mb-6">
                <div className="flex justify-between font-bold text-lg"><span>Tổng tiền</span><span className="text-primary">{formatCurrencyShort(workshop.price * guests)}</span></div>
              </div>
              <Button fullWidth size="lg" disabled={!selectedTimeslot} onClick={handleBook}>Đặt ngay</Button>
              {!selectedTimeslot && <p className="text-xs text-center text-on-surface-variant mt-2">Vui lòng chọn khung giờ</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
