import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check } from 'lucide-react';
import type { Product } from '../../types/product.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const artisanName = product.hostName 
    ? product.hostName.trim()
    : 'Làng nghề thủ công';

  return (
    <div
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#EAD8CC] hover:border-[#964824]/40 hover:shadow-[0_16px_40px_rgba(61,43,31,0.1)] hover:-translate-y-1.5 transition-all duration-300 ${className}`}
    >
      <Link to={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-[#FAF7F2]">
        <img
          src={product.images?.[0] || '/src/assets/images/pottery-workshop.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {product.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#964824] rounded-full shadow-xs">
            {product.category}
          </span>
        )}

        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-md shadow-xs">
            Chỉ còn {product.stock}
          </span>
        )}
      </Link>

      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Artisan / Village Line - Single line with fixed height */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#7A6255] uppercase tracking-wider mb-2 min-w-0 h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#964824] shrink-0" />
            <span className="truncate" title={artisanName}>
              {artisanName}
            </span>
          </div>

          {/* Product Title - Fixed 2-line height for uniform layout */}
          <Link to={`/products/${product._id}`} className="block">
            <h3 
              className="font-semibold text-sm md:text-base text-[#3D2B1F] line-clamp-2 leading-snug group-hover:text-[#964824] transition-colors mb-2 h-11 flex items-start"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 mb-3">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-[#3D2B1F]">{product.rating || 5.0}</span>
            <span className="text-[11px] text-[#7A6255]">({product.totalReviews || 0})</span>
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-[#EAD8CC]/60 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#7A6255] block -mb-0.5">Giá</span>
            <span className="text-[#964824] font-extrabold text-base md:text-lg tracking-tight">
              {formatCurrencyShort(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm active:scale-95 ${
              added
                ? 'bg-[#384B3F] text-white'
                : 'bg-[#964824] hover:bg-[#7A3518] text-white hover:shadow-md'
            }`}
            title="Thêm vào giỏ hàng"
          >
            {added ? (
              <>
                <Check size={14} />
                <span>Đã thêm</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Mua ngay</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
