import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { SHIPPING_FEE } from '../../utils/constants';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';

import ImageWithFallback from '../../components/common/ImageWithFallback';

const CartPage: React.FC = () => {
  const { cartItems, cartTotal, removeFromCart, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-12">
        <EmptyState
          title="Giỏ hàng trống"
          description="Giỏ hàng của bạn đang trống. Hãy khám phá các sản phẩm thủ công tuyệt đẹp từ các nghệ nhân của chúng tôi!"
          icon={<ShoppingBag size={48} className="text-[#A65A3A] opacity-60" />}
          action={
            <Link to="/products">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-10 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline-lg text-3xl font-bold text-[#2F2722]">Giỏ hàng của bạn</h1>
        <Link to="/products" className="flex items-center gap-1.5 text-sm font-semibold text-[#7A6A5E] hover:text-[#A65A3A] transition-colors">
          <ArrowLeft size={16} /> Tiếp tục mua sắm
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.product._id}
              className="flex gap-4 p-4 md:p-5 bg-white rounded-2xl border border-[#E6DED5] shadow-xs relative hover:border-[#A65A3A]/30 transition-colors"
            >
              <ImageWithFallback
                src={item.product.images?.[0] || item.product.thumbnail || ''}
                fallbackSrc="/images/fallback-product.jpg"
                alt={item.product.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover border border-[#E6DED5]/40 shrink-0"
              />
              <div className="flex-1 min-w-0 pr-8">
                <Link
                  to={`/products/${item.product._id}`}
                  className="font-bold text-sm md:text-base text-[#2F2722] hover:text-[#A65A3A] transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                {item.product.material && (
                  <p className="text-xs text-[#7A6A5E] mt-1 font-medium">Chất liệu: {item.product.material}</p>
                )}
                {item.product.hostId?.fullName && (
                  <p className="text-xs text-[#7A6A5E] mt-0.5 font-medium">Nghệ nhân: {item.product.hostId.fullName}</p>
                )}
                <p className="text-[#A65A3A] font-extrabold text-sm md:text-base mt-2">
                  {formatCurrencyShort(item.product.price)}
                </p>
              </div>

              {/* Action Column */}
              <div className="flex flex-col items-end justify-between shrink-0">
                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="p-1.5 hover:bg-red-50 text-[#DC2626]/60 hover:text-[#DC2626] rounded-lg transition-all"
                  title="Xóa sản phẩm"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-2 border border-[#E6DED5] rounded-xl px-1.5 py-0.5 bg-white">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1 hover:bg-[#FAF7F2] rounded-lg transition-colors disabled:opacity-35"
                  >
                    <Minus size={12} className="text-[#2F2722]" />
                  </button>
                  <span className="w-8 text-center font-bold text-[#2F2722] text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    className="p-1 hover:bg-[#FAF7F2] rounded-lg transition-colors disabled:opacity-35"
                  >
                    <Plus size={12} className="text-[#2F2722]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sticky Panel */}
        <div>
          <div className="bg-white rounded-3xl border border-[#E6DED5] p-6 shadow-md h-fit sticky top-24 space-y-6">
            <h2 className="font-bold text-lg text-[#2F2722] font-headline-md pb-4 border-b border-[#E6DED5]/60">
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-3.5 text-sm font-medium">
              <div className="flex justify-between text-[#7A6A5E]">
                <span>Tạm tính ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} sản phẩm)</span>
                <span className="text-[#2F2722] font-bold">{formatCurrencyShort(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[#7A6A5E]">
                <span>Phí vận chuyển</span>
                <span className="text-[#2F2722] font-bold">{formatCurrencyShort(SHIPPING_FEE)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-lg text-[#2F2722] border-t border-dashed border-[#E6DED5] pt-4">
                <span>Tổng tiền</span>
                <span className="text-[#A65A3A] text-xl">{formatCurrencyShort(cartTotal + SHIPPING_FEE)}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/checkout">
                <Button fullWidth size="lg" className="shadow-md flex items-center justify-center gap-2">
                  Tiến hành thanh toán <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
