import React from 'react';
import CartSummary from './CartSummary';

const CheckoutSummary: React.FC = () => (
  <div className="bg-white rounded-xl border border-soft-clay p-6 h-fit sticky top-24">
    <h2 className="font-semibold text-lg text-deep-earth mb-4">Order Summary</h2>
    <CartSummary />
  </div>
);

export default CheckoutSummary;
