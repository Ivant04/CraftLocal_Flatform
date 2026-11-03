import React from 'react';
import { useCart } from '../../hooks/useCart';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { SHIPPING_FEE } from '../../utils/constants';

const CartSummary: React.FC = () => {
  const { cartItems, cartTotal } = useCart();
  return (
    <div className="space-y-3">
      {cartItems.map((item) => (
        <div key={item.product._id} className="flex justify-between text-sm">
          <span className="truncate mr-4">{item.product.name} × {item.quantity}</span>
          <span className="shrink-0 font-medium">{formatCurrencyShort(item.product.price * item.quantity)}</span>
        </div>
      ))}
      <div className="border-t border-soft-clay pt-3 space-y-2">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrencyShort(cartTotal)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{formatCurrencyShort(SHIPPING_FEE)}</span></div>
        <div className="flex justify-between font-bold text-lg border-t border-soft-clay pt-2"><span>Total</span><span className="text-primary">{formatCurrencyShort(cartTotal + SHIPPING_FEE)}</span></div>
      </div>
    </div>
  );
};

export default CartSummary;
