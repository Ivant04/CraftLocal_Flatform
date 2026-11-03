import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types/product.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';

const CartItem: React.FC<{ item: CartItemType }> = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  return (
    <div className="flex gap-4 p-4 bg-white rounded-xl border border-soft-clay">
      <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-24 rounded-lg object-cover" />
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product._id}`} className="font-semibold text-on-surface hover:text-primary truncate block">{item.product.name}</Link>
        <p className="text-primary font-bold mt-1">{formatCurrencyShort(item.product.price)}</p>
      </div>
      <div className="flex flex-col items-end justify-between">
        <button onClick={() => removeFromCart(item.product._id)} className="p-1.5 text-error/60 hover:text-error"><Trash2 size={16} /></button>
        <div className="flex items-center gap-2">
          <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="w-8 h-8 rounded-lg border flex items-center justify-center"><Minus size={14} /></button>
          <span className="w-8 text-center font-medium">{item.quantity}</span>
          <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="w-8 h-8 rounded-lg border flex items-center justify-center"><Plus size={14} /></button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
