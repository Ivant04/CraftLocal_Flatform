import React from 'react';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import Button from '../common/Button';

interface BookingBoxProps {
  price: number;
  guests: number;
  onGuestsChange: (n: number) => void;
  selectedTimeslot: boolean;
  onBook: () => void;
}

const BookingBox: React.FC<BookingBoxProps> = ({ price, guests, onGuestsChange, selectedTimeslot, onBook }) => (
  <div className="sticky top-24 bg-white rounded-2xl border border-soft-clay p-6 shadow-lg">
    <div className="text-center mb-6">
      <p className="text-3xl font-bold text-primary">{formatCurrencyShort(price)}</p>
      <p className="text-sm text-on-surface-variant">per person</p>
    </div>
    <div className="mb-4">
      <label className="text-sm font-medium block mb-1.5">Guests</label>
      <input type="number" min={1} max={20} value={guests} onChange={(e) => onGuestsChange(Number(e.target.value))} className="w-full px-4 py-3 border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
    <div className="border-t border-soft-clay pt-4 mb-6">
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span className="text-primary">{formatCurrencyShort(price * guests)}</span>
      </div>
    </div>
    <Button fullWidth size="lg" disabled={!selectedTimeslot} onClick={onBook}>Book Now</Button>
  </div>
);

export default BookingBox;
