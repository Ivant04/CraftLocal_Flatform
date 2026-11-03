import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const PaymentPayOSCancelPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode');

  return (
    <div className="max-w-lg mx-auto px-5 py-20 text-center">
      <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
        <XCircle size={48} className="text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Thanh toán đã bị hủy</h1>
      <p className="text-gray-500 mb-2 text-sm">
        Bạn đã hủy giao dịch thanh toán. Đơn hàng hoặc đặt chỗ của bạn vẫn ở trạng thái chờ thanh toán.
      </p>
      {orderCode && (
        <p className="text-xs text-gray-400 mb-8">
          Mã đơn: <span className="font-mono font-bold">{orderCode}</span>
        </p>
      )}
      <div className="flex justify-center gap-4 flex-wrap">
        <Link to="/my-bookings"><Button variant="outline">Xem lịch đặt</Button></Link>
        <Link to="/my-orders"><Button variant="outline">Xem đơn hàng</Button></Link>
        <Link to="/"><Button>Về trang chủ</Button></Link>
      </div>
    </div>
  );
};

export default PaymentPayOSCancelPage;
