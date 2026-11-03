import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, RefreshCw, Ticket, ShoppingBag } from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const PaymentPayOSReturnPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode');
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng');
      setLoading(false);
      return;
    }

    try {
      const res = await paymentApi.getPaymentStatus(orderCode);
      setPayment(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [orderCode]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    fetchStatus();
  };

  if (loading) return <Loading text="Đang kiểm tra trạng thái thanh toán..." />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <XCircle size={64} className="mx-auto text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Lỗi kiểm tra thanh toán</h1>
        <p className="text-gray-500 mb-8 text-sm">{error}</p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleRetry}>
            <RefreshCw size={16} className="mr-2" /> Thử lại
          </Button>
          <Link to="/"><Button>Về trang chủ</Button></Link>
        </div>
      </div>
    );
  }

  const status = payment?.paymentStatus;
  const hasBooking = !!payment?.bookingId;
  const hasOrder = !!payment?.orderId;

  // SUCCESS
  if (status === 'SUCCESS') {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Thanh toán thành công!</h1>
        <p className="text-gray-500 mb-2 text-sm">
          Cảm ơn bạn đã sử dụng CraftLocal. {hasBooking ? 'Vé điện tử của bạn đã sẵn sàng.' : 'Đơn hàng đã được xác nhận.'}
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Mã thanh toán: <span className="font-mono font-bold">{payment?.paymentCode}</span>
        </p>
        <div className="flex justify-center gap-4">
          {hasBooking && (
            <Link to="/my-bookings">
              <Button variant="outline" className="flex items-center gap-2">
                <Ticket size={16} /> Xem vé của tôi
              </Button>
            </Link>
          )}
          {hasOrder && (
            <Link to="/my-orders">
              <Button variant="outline" className="flex items-center gap-2">
                <ShoppingBag size={16} /> Xem đơn hàng
              </Button>
            </Link>
          )}
          <Link to="/"><Button>Về trang chủ</Button></Link>
        </div>
      </div>
    );
  }

  // PENDING
  if (status === 'PENDING') {
    return (
      <div className="max-w-lg mx-auto px-5 py-20 text-center">
        <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
          <Clock size={48} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Đang chờ xác nhận</h1>
        <p className="text-gray-500 mb-2 text-sm">
          Thanh toán của bạn đang được xử lý. Vui lòng đợi vài giây rồi kiểm tra lại.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Mã thanh toán: <span className="font-mono font-bold">{payment?.paymentCode}</span>
        </p>
        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={handleRetry} className="flex items-center gap-2">
            <RefreshCw size={16} /> Kiểm tra lại
          </Button>
          <Link to="/"><Button>Về trang chủ</Button></Link>
        </div>
      </div>
    );
  }

  // FAILED / CANCELLED
  return (
    <div className="max-w-lg mx-auto px-5 py-20 text-center">
      <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
        <XCircle size={48} className="text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-3">
        {status === 'CANCELLED' ? 'Thanh toán đã bị hủy' : 'Thanh toán thất bại'}
      </h1>
      <p className="text-gray-500 mb-8 text-sm">
        {status === 'CANCELLED'
          ? 'Bạn đã hủy giao dịch thanh toán. Đơn hàng/đặt chỗ của bạn vẫn ở trạng thái chờ.'
          : 'Rất tiếc, thanh toán không thành công. Vui lòng thử lại.'}
      </p>
      <div className="flex justify-center gap-4">
        {hasBooking && (
          <Link to="/my-bookings"><Button variant="outline">Xem lịch đặt</Button></Link>
        )}
        {hasOrder && (
          <Link to="/my-orders"><Button variant="outline">Xem đơn hàng</Button></Link>
        )}
        <Link to="/"><Button>Về trang chủ</Button></Link>
      </div>
    </div>
  );
};

export default PaymentPayOSReturnPage;
