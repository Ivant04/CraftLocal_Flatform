import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Store, MapPin, Layers, PackageCheck, ArrowUpRight } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types/product.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { useCart } from '../../hooks/useCart';
import ImageWithFallback from '../common/ImageWithFallback';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();
  const { product, quantity } = item;

  const rawHost = typeof product.hostId === 'object' && product.hostId !== null
    ? (product.hostId as { fullName?: string; hostProfile?: { workshopName?: string; ownerName?: string } })
    : null;

  const workshopName =
    product.workshopName ||
    rawHost?.hostProfile?.workshopName ||
    product.hostName ||
    rawHost?.fullName ||
    'Xưởng thủ công truyền thống';

  const ownerName =
    product.ownerName ||
    rawHost?.hostProfile?.ownerName ||
    (rawHost?.fullName && rawHost.fullName !== workshopName ? rawHost.fullName : '');

  const showOwnerSeparately = Boolean(ownerName && ownerName.trim().toLowerCase() !== workshopName.trim().toLowerCase());
  const workshopLocation = product.workshopLocation || product.origin || '';
  const summaryText = product.shortDescription?.trim() || product.description?.trim() || '';
  const lineTotal = product.price * quantity;
  const maxStock = product.stock > 0 ? product.stock : undefined;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <article className="bg-white rounded-2xl border border-[#EAD8CC] shadow-xs hover:border-[#964824]/40 transition-colors overflow-hidden">
      {/* Workshop Provenance Header Strip */}
      <div className="bg-[#FAF7F2] px-4 md:px-5 py-2.5 border-b border-[#F0E6DE] flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs md:text-sm font-bold text-[#3D2B1F] min-w-0">
            <Store size={15} className="text-[#964824] shrink-0" aria-hidden="true" />
            <span className="text-[#7A6255] font-semibold text-xs uppercase tracking-wide shrink-0">Xưởng bán:</span>
            <span className="truncate">{workshopName}</span>
          </span>

          {showOwnerSeparately && (
            <span className="text-xs text-[#5A4A41] truncate">
              · Nghệ nhân {ownerName}
            </span>
          )}

          {workshopLocation && (
            <span className="inline-flex items-center gap-1 text-xs text-[#7A6255] min-w-0">
              <MapPin size={12} className="text-[#964824]/80 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-[240px]">{workshopLocation}</span>
            </span>
          )}
        </div>

        {product.category && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#964824]/10 text-[#964824] whitespace-nowrap shrink-0">
            {product.category}
          </span>
        )}
      </div>

      {/* Product Main Summary Body */}
      <div className="p-4 md:p-5 flex gap-4 md:gap-5 items-start">
        <Link
          to={`/products/${product._id}`}
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl overflow-hidden border border-[#EAD8CC]/70 bg-[#FAF7F2] shrink-0 block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#964824]"
          aria-label={`Xem chi tiết ${product.name}`}
        >
          <ImageWithFallback
            src={product.images?.[0] || product.thumbnail || ''}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Title + Remove Action */}
          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/products/${product._id}`}
              className="font-headline font-bold text-base md:text-lg text-[#3D2B1F] hover:text-[#964824] transition-colors line-clamp-2 leading-snug"
            >
              {product.name}
            </Link>

            <button
              type="button"
              onClick={() => removeFromCart(product._id)}
              className="min-w-8 min-h-8 p-1.5 -mr-1 -mt-1 flex items-center justify-center rounded-lg text-[#7A6255] hover:text-[#DC2626] hover:bg-red-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#964824]/40 shrink-0"
              aria-label={`Xóa ${product.name} khỏi giỏ hàng`}
              title="Xóa sản phẩm"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Product Summary Excerpt */}
          <p className="text-xs md:text-sm text-[#5A4A41] leading-relaxed line-clamp-2 mt-1.5">
            {summaryText || `Sản phẩm thủ công chế tác tại ${workshopName}.`}
          </p>

          {/* Compact Specification Meta */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            {product.material && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#EAD8CC] text-[11px] font-medium text-[#3D2B1F] whitespace-nowrap">
                <Layers size={12} className="text-[#964824]" aria-hidden="true" />
                Chất liệu: {product.material}
              </span>
            )}

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold whitespace-nowrap ${
                isOutOfStock
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : isLowStock
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-[#EDF3EF] border-[#384B3F]/20 text-[#384B3F]'
              }`}
            >
              <PackageCheck size={12} aria-hidden="true" />
              {isOutOfStock ? 'Tạm hết hàng' : `Còn ${product.stock} tại xưởng`}
            </span>

            <Link
              to={`/products/${product._id}`}
              className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#964824] hover:underline whitespace-nowrap ml-auto sm:ml-1"
            >
              Xem chi tiết
              <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          </div>

          {/* Price & Quantity Stepper Row */}
          <div className="mt-4 pt-3 border-t border-[#F0E6DE] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="block text-[11px] text-[#7A6255] font-medium tabular-nums">
                Đơn giá: {formatCurrencyShort(product.price)}
              </span>
              <span className="text-[#964824] font-extrabold text-base md:text-lg tabular-nums">
                {formatCurrencyShort(lineTotal)}
              </span>
            </div>

            <div className="flex items-center gap-1 border border-[#EAD8CC] rounded-xl bg-[#FAF7F2]/70 p-1">
              <button
                type="button"
                onClick={() => updateQuantity(product._id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label={`Giảm số lượng ${product.name}`}
                className="min-w-8 min-h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#3D2B1F] transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#964824]/40"
              >
                <Minus size={13} aria-hidden="true" />
              </button>
              <span className="w-8 text-center font-bold text-sm text-[#3D2B1F] tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product._id, quantity + 1)}
                disabled={maxStock !== undefined && quantity >= maxStock}
                aria-label={`Tăng số lượng ${product.name}`}
                className="min-w-8 min-h-8 flex items-center justify-center rounded-lg hover:bg-white text-[#3D2B1F] transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#964824]/40"
              >
                <Plus size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default CartItem;
