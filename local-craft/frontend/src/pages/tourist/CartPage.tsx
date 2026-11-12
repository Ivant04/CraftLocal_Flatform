import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck, Store } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import productApi from '../../api/productApi';
import { normalizeProduct } from '../../utils/normalizers';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { SHIPPING_FEE } from '../../utils/constants';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import CartItem from '../../components/cart/CartItem';

const CartPage: React.FC = () => {
  const { cartItems, cartTotal, cartCount, syncCartProducts } = useCart();
  const syncedIdsRef = useRef<Set<string>>(new Set());

  // Enrich legacy localStorage cart snapshots with latest workshop and product details
  useEffect(() => {
    const idsToFetch = cartItems
      .map((item) => item.product._id)
      .filter((id) => id && !syncedIdsRef.current.has(id));

    if (idsToFetch.length === 0) return;
    idsToFetch.forEach((id) => syncedIdsRef.current.add(id));

    let active = true;
    Promise.allSettled(idsToFetch.map((id) => productApi.getById(id)))
      .then((results) => {
        if (!active) return;
        const freshProducts = results
          .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && Boolean(r.value?.data?.data))
          .map((r) => normalizeProduct(r.value.data.data));

        if (freshProducts.length > 0) {
          syncCartProducts(freshProducts);
        }
      });

    return () => {
      active = false;
    };
  }, [cartItems, syncCartProducts]);

  if (cartItems.length === 0) {
    return (
      <div className="bg-craft-contour min-h-[70vh] py-12">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
          <EmptyState
            title="Giỏ hàng trống"
            description="Giỏ hàng của bạn đang trống. Hãy khám phá các sản phẩm thủ công tuyệt đẹp từ các nghệ nhân của chúng tôi!"
            icon={<ShoppingBag size={48} className="text-[#964824] opacity-60" />}
            action={
              <Link to="/products">
                <Button>Tiếp tục mua sắm</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-craft-contour min-h-screen">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-headline-lg text-3xl font-bold text-[#3D2B1F]">Giỏ hàng của bạn</h1>
            <p className="text-xs md:text-sm text-[#5A4A41] mt-1">
              {cartCount} sản phẩm thủ công từ các xưởng làng nghề
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5A4A41] hover:text-[#964824] transition-colors"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Tiếp tục mua sắm
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} />
            ))}
          </div>

          {/* Order Summary Sticky Panel */}
          <div>
            <div className="bg-white rounded-3xl border border-[#EAD8CC] p-6 shadow-md h-fit sticky top-24 space-y-5">
              <div className="pb-4 border-b border-[#F0E6DE] flex items-center justify-between">
                <h2 className="font-bold text-lg text-[#3D2B1F] font-headline-md">
                  Tóm tắt đơn hàng
                </h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAD8CC] text-[#5A4A41] tabular-nums">
                  {cartCount} sản phẩm
                </span>
              </div>

              {/* Compact per-item summary inside order box */}
              <div className="space-y-3 max-h-52 overflow-y-auto pr-1 border-b border-[#F0E6DE] pb-4">
                {cartItems.map((item) => {
                  const workshopLabel = item.product.workshopName || item.product.hostName || 'Làng nghề thủ công';
                  return (
                    <div key={item.product._id} className="flex items-start justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#3D2B1F] truncate">
                          {item.product.name} <span className="text-[#7A6255] font-medium">× {item.quantity}</span>
                        </p>
                        <p className="inline-flex items-center gap-1 text-[11px] text-[#7A6255] truncate max-w-full mt-0.5">
                          <Store size={11} className="text-[#964824] shrink-0" aria-hidden="true" />
                          <span className="truncate">{workshopLabel}</span>
                        </p>
                      </div>
                      <span className="font-bold text-[#3D2B1F] shrink-0 tabular-nums">
                        {formatCurrencyShort(item.product.price * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm font-medium">
                <div className="flex justify-between text-[#5A4A41]">
                  <span>Tạm tính ({cartCount} sản phẩm)</span>
                  <span className="text-[#3D2B1F] font-bold tabular-nums">{formatCurrencyShort(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-[#5A4A41]">
                  <span>Phí vận chuyển</span>
                  <span className="text-[#3D2B1F] font-bold tabular-nums">{formatCurrencyShort(SHIPPING_FEE)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-lg text-[#3D2B1F] border-t border-dashed border-[#EAD8CC] pt-4">
                  <span>Tổng tiền</span>
                  <span className="text-[#964824] text-xl tabular-nums">{formatCurrencyShort(cartTotal + SHIPPING_FEE)}</span>
                </div>
              </div>

              <div className="pt-1 space-y-3">
                <Link to="/checkout" className="block">
                  <Button fullWidth size="lg" className="shadow-md flex items-center justify-center gap-2">
                    Tiến hành thanh toán <ArrowRight size={16} aria-hidden="true" />
                  </Button>
                </Link>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7A6255] font-medium">
                  <ShieldCheck size={14} className="text-[#384B3F] shrink-0" aria-hidden="true" />
                  <span>Đảm bảo chế tác thủ công chuẩn làng nghề</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
