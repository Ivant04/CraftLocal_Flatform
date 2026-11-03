import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types/product.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#EAD8CC] hover:shadow-[0_16px_48px_rgba(61,43,31,0.12)] transition-all duration-300">
      <Link to={`/products/${product._id}`} className="block relative h-56 overflow-hidden">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      <div className="p-5">
        <Link to={`/products/${product._id}`}>
          <h3 className="font-semibold text-[#3D2B1F] mb-2 line-clamp-1 group-hover:text-[#964824] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-1.5 mb-3">
          <Star size={13} className="text-amber-500 fill-amber-500" />
          <span className="text-sm font-semibold text-[#3D2B1F]">{product.rating}</span>
          <span className="text-xs text-[#7A6255]">({product.totalReviews} đánh giá)</span>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#EAD8CC]/60">
          <span className="text-[#964824] font-bold text-lg">{formatCurrencyShort(product.price)}</span>
          <button
            onClick={() => addToCart(product)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#964824] rounded-xl hover:bg-[#7A3518] transition-all shadow-sm active:scale-95"
          >
            <ShoppingCart size={14} />
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
