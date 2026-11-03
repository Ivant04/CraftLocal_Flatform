import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ShoppingBag, CreditCard, ShieldCheck, Banknote, Loader2 } from 'lucide-react';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { useCart } from '../../hooks/useCart';
import orderApi from '../../api/orderApi';
import paymentApi from '../../api/paymentApi';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { SHIPPING_FEE } from '../../utils/constants';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import PageHeader from '../../components/common/PageHeader';
import SectionCard from '../../components/common/SectionCard';

interface CheckoutFormData {
  fullName: string;
  phone: string;
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  note: string;
  paymentMethod: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentMethod: 'PAYOS',
      ward: '',
      note: '',
    },
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'creating_order' | 'creating_payment' | 'redirecting'>('idle');

  if (cartItems.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-12">
        <EmptyState title="Giỏ hàng trống" description="Bạn chưa có sản phẩm nào trong giỏ hàng để thực hiện thanh toán." />
      </div>
    );
  }

  const onSubmit = async (formData: CheckoutFormData) => {
    setError('');
    setStep('creating_order');
    try {
      // Build items from cart
      const items = cartItems.map((item) => ({
        productId: item.product._id,
        quantity: Number(item.quantity),
      }));

      // Build shipping address matching backend schema
      const shippingAddress = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine: formData.addressLine.trim(),
        ward: formData.ward?.trim() || '',
        district: formData.district.trim(),
        city: formData.city.trim(),
        province: formData.city.trim(), // province = city for VN addresses
        country: 'Việt Nam',
        fullAddress: [formData.addressLine, formData.ward, formData.district, formData.city]
          .filter(Boolean)
          .join(', '),
        note: formData.note?.trim() || '',
      };

      // Step 1: Create order
      const orderRes = await orderApi.checkout({
        items,
        shippingAddress,
        paymentMethod: 'PAYOS',
      });
      const orderData = orderRes.data.data;
      const orders = Array.isArray(orderData) ? orderData : [orderData];

      // Step 2: Create payOS payment
      setStep('creating_payment');
      const firstOrder = orders[0];
      const paymentRes = await paymentApi.createOrderPayment(firstOrder._id);
      const paymentData = paymentRes.data.data;

      // Step 3: Clear cart
      clearCart();

      // Step 4: Redirect to payOS checkout
      setStep('redirecting');
      if (paymentData.checkoutUrl) {
        window.location.href = paymentData.checkoutUrl;
      } else {
        navigate('/my-orders');
      }
    } catch (err: any) {
      setStep('idle');
      // Extract detailed error from backend
      const errData = err.response?.data;
      if (errData?.errors && Array.isArray(errData.errors)) {
        const messages = errData.errors.map((e: any) => e.message).join('. ');
        setError(messages);
      } else {
        setError(errData?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
      }
    }
  };

  const getButtonText = () => {
    switch (step) {
      case 'creating_order': return 'Đang tạo đơn hàng...';
      case 'creating_payment': return 'Đang tạo link thanh toán...';
      case 'redirecting': return 'Đang chuyển sang payOS...';
      default: return 'Thanh toán bằng payOS';
    }
  };

  const isProcessing = step !== 'idle';

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 py-10 min-h-screen space-y-6">
      <PageHeader
        title="Thanh toán đơn hàng"
        subtitle="Vui lòng kiểm tra lại thông tin nhận hàng trước khi xác nhận đơn hàng."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form panel */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Error */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* Address */}
            <SectionCard title="Địa chỉ nhận hàng" description="Địa chỉ nhận hàng và thông tin liên lạc của người nhận." icon={<span>📍</span>}>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Họ và tên người nhận *"
                    placeholder="Nguyễn Văn A"
                    {...register('fullName', { required: 'Vui lòng nhập họ tên người nhận' })}
                  />
                  {errors.fullName && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.fullName.message}</p>}
                </div>
                <div>
                  <Input
                    label="Số điện thoại *"
                    placeholder="0901234567"
                    {...register('phone', { required: 'Vui lòng nhập số điện thoại' })}
                  />
                  {errors.phone && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.phone.message}</p>}
                </div>
                <div>
                  <Input
                    label="Địa chỉ nhận hàng *"
                    placeholder="Số nhà, tên đường"
                    {...register('addressLine', { required: 'Vui lòng nhập địa chỉ' })}
                  />
                  {errors.addressLine && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.addressLine.message}</p>}
                </div>
                <div>
                  <Input
                    label="Phường/Xã"
                    placeholder="Phường Mỹ An"
                    {...register('ward')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Quận/Huyện *"
                      placeholder="Quận Ngũ Hành Sơn"
                      {...register('district', { required: 'Vui lòng nhập quận/huyện' })}
                    />
                    {errors.district && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.district.message}</p>}
                  </div>
                  <div>
                    <Input
                      label="Tỉnh/Thành phố *"
                      placeholder="Đà Nẵng"
                      {...register('city', { required: 'Vui lòng nhập tỉnh/thành phố' })}
                    />
                    {errors.city && <p className="text-red-500 text-[11px] mt-1 font-semibold">{errors.city.message}</p>}
                  </div>
                </div>
                <div>
                  <Input
                    label="Ghi chú"
                    placeholder="Giao giờ hành chính, gọi trước khi giao..."
                    {...register('note')}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Payment Method - payOS only */}
            <SectionCard title="Phương thức thanh toán" description="Thanh toán trực tuyến qua cổng payOS." icon={<CreditCard size={18} className="text-[#A65A3A]" />}>
              <div className="p-4 border border-[#A65A3A]/30 bg-[#A65A3A]/5 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="radio"
                    value="PAYOS"
                    defaultChecked
                    {...register('paymentMethod')}
                    className="h-4 w-4 text-[#A65A3A] focus:ring-[#A65A3A]/20"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                      <Banknote size={20} className="text-[#A65A3A]" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-900 block uppercase tracking-wide">payOS</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">Quét mã VietQR hoặc chuyển khoản ngân hàng</span>
                    </div>
                  </div>
                </label>
              </div>
            </SectionCard>

            <Button
              type="submit"
              fullWidth
              size="md"
              className="shadow-2xs"
              isLoading={isProcessing}
              disabled={isProcessing || isSubmitting}
            >
              {isProcessing && <Loader2 size={16} className="animate-spin mr-2" />}
              {getButtonText()}
            </Button>
          </form>
        </div>

        {/* Order details panel */}
        <div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs h-fit sticky top-20 space-y-5">
            <h2 className="font-bold text-sm text-[#0F172A] pb-3 border-b border-gray-150 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#A65A3A]" /> Đơn hàng đặt mua
            </h2>
            
            <div className="space-y-3.5 max-h-[200px] overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.product._id} className="flex items-center justify-between text-xs sm:text-sm gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <ImageWithFallback
                      src={item.product.images?.[0] || item.product.thumbnail || ''}
                      fallbackSrc="/images/fallback-product.jpg"
                      alt={item.product.name}
                      className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <span className="truncate text-gray-900 font-bold">{item.product.name} × {item.quantity}</span>
                  </div>
                  <span className="shrink-0 text-gray-500 font-extrabold">{formatCurrencyShort(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E7EB] pt-4 space-y-3 text-xs sm:text-sm font-medium">
              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Tạm tính</span>
                <span className="text-gray-900 font-extrabold">{formatCurrencyShort(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-semibold">
                <span>Phí vận chuyển</span>
                <span className="text-gray-900 font-extrabold">{formatCurrencyShort(SHIPPING_FEE)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm sm:text-base text-gray-900 border-t border-dashed border-[#E5E7EB] pt-4">
                <span>Tổng tiền</span>
                <span className="text-[#A65A3A] font-extrabold">{formatCurrencyShort(cartTotal + SHIPPING_FEE)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold text-center border-t border-gray-150 pt-4">
              <ShieldCheck size={14} className="text-[#16A34A] shrink-0" />
              <span className="uppercase tracking-wider">Giao dịch bảo mật an toàn 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
