import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, RefreshCw, Ticket, ShoppingBag, ArrowRight, Home } from 'lucide-react';
import paymentApi from '../../api/paymentApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

const PaymentPayOSReturnPage: React.FC = () => {
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode');
  const payosCode = params.get('code');
  const payosStatus = params.get('status');
  const payosCancel = params.get('cancel');

  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const pollTimerRef = useRef<any>(null);

  const isExplicitCancel = payosCancel === 'true' || payosStatus === 'CANCELLED';

  const fetchStatus = async () => {
    if (!orderCode) {
      setError('Không tìm thấy mã đơn hàng trong liên kết thanh toán.');
      setLoading(false);
      return;
    }

    try {
      const res = await paymentApi.getPaymentStatus(orderCode);
      const data = res.data?.data;
      setPayment(data);

      // If status is still PENDING and we haven't reached max retries, poll again
      if (data?.paymentStatus === 'PENDING' && pollCount < 5 && !isExplicitCancel) {
        pollTimerRef.current = setTimeout(() => {
          setPollCount((prev) => prev + 1);
        }, 1500);
      }
    } catch (err: any) {
      // If payOS returned code 00 (success) but backend threw error or is still updating
      if (payosCode === '00' || payosStatus === 'PAID') {
        setPayment({
          paymentStatus: 'SUCCESS',
          orderCode,
        });
      } else {
        setError(err.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [orderCode, pollCount]);

  const handleRetry = () => {
    setLoading(true);
    setError('');
    setPollCount(0);
    fetchStatus();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loading />
        <p className="mt-4 text-sm text-on-surface-variant font-medium">
          Đang xác nhận kết quả thanh toán với cổng PayOS...
        </p>
      </div>
    );
  }

  // Explicit user cancel from query or database
  if (isExplicitCancel || payment?.paymentStatus === 'CANCELLED') {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <XCircle size={44} />
        </div>
        <h1 className="text-2xl font-bold font-headline-lg text-deep-earth mb-3">
          Thanh toán đã bị hủy
        </h1>
        <p className="text-on-surface-variant mb-3 text-sm">
          Giao dịch thanh toán đã bị hủy bỏ. Đơn hàng hoặc lịch đặt chỗ của bạn vẫn được lưu ở trạng thái chờ thanh toán.
        </p>
        {orderCode && (
          <p className="text-xs text-on-surface-variant/70 mb-8 font-mono bg-soft-clay/30 py-1.5 px-3 rounded-lg inline-block">
            Mã giao dịch: <strong>{orderCode}</strong>
          </p>
        )}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/my-bookings">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              Xem lịch đặt chỗ
            </Button>
          </Link>
          <Link to="/">
            <Button size="sm" className="w-full sm:w-auto">
              <Home size={15} className="mr-1.5" /> Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <XCircle size={44} />
        </div>
        <h1 className="text-2xl font-bold font-headline-lg text-deep-earth mb-3">
          Lỗi kiểm tra thanh toán
        </h1>
        <p className="text-on-surface-variant mb-8 text-sm">{error}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRetry}>
            <RefreshCw size={15} className="mr-1.5" /> Thử lại
          </Button>
          <Link to="/">
            <Button size="sm">
              <Home size={15} className="mr-1.5" /> Về trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const rawStatus = payment?.paymentStatus;
  const isSuccess = rawStatus === 'SUCCESS' || payosCode === '00' || payosStatus === 'PAID';
  const bookingObj = payment?.bookingId;
  const bookingId = typeof bookingObj === 'object' ? bookingObj?._id : bookingObj;
  const hasOrder = Boolean(payment?.orderId);

  // SUCCESS
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto px-5 py-16 text-center animate-fadeIn">
        <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-[0_4px_20px_rgba(16,185,129,0.25)]">
          <CheckCircle2 size={48} />
        </div>

        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
          Thanh toán thành công
        </span>

        <h1 className="text-2xl sm:text-3xl font-bold font-headline-lg text-deep-earth mb-3">
          Đặt chỗ thành công!
        </h1>

        <p className="text-on-surface-variant mb-6 text-sm max-w-sm mx-auto">
          Cảm ơn bạn đã lựa chọn trải nghiệm cùng CraftLocal. Vé điện tử và mã QR check-in của bạn đã sẵn sàng.
        </p>

        {/* Transaction details card */}
        <div className="bg-white rounded-2xl border border-soft-clay p-5 mb-8 text-left shadow-sm space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-soft-clay/60">
            <span className="text-on-surface-variant">Phương thức</span>
            <span className="font-semibold text-deep-earth">Cổng PayOS (VietQR)</span>
          </div>
          {payment?.paymentCode && (
            <div className="flex justify-between items-center text-xs pb-2 border-b border-soft-clay/60">
              <span className="text-on-surface-variant">Mã giao dịch</span>
              <span className="font-mono font-bold text-primary">{payment.paymentCode}</span>
            </div>
          )}
          {orderCode && (
            <div className="flex justify-between items-center text-xs pb-2 border-b border-soft-clay/60">
              <span className="text-on-surface-variant">Mã đơn hàng</span>
              <span className="font-mono text-deep-earth">{orderCode}</span>
            </div>
          )}
          {payment?.amount && (
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-on-surface-variant font-medium">Số tiền đã thanh toán</span>
              <span className="font-bold text-base text-primary">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {bookingId ? (
            <Link to={`/my-bookings/${bookingId}/ticket`} className="w-full sm:w-auto">
              <Button size="md" className="w-full flex items-center justify-center gap-2">
                <Ticket size={16} /> Xem vé điện tử & QR <ArrowRight size={15} />
              </Button>
            </Link>
          ) : (
            <Link to="/my-bookings" className="w-full sm:w-auto">
              <Button size="md" className="w-full flex items-center justify-center gap-2">
                <Ticket size={16} /> Xem lịch đặt chỗ
              </Button>
            </Link>
          )}

          {hasOrder && (
            <Link to="/my-orders" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full flex items-center justify-center gap-2">
                <ShoppingBag size={16} /> Xem đơn hàng
              </Button>
            </Link>
          )}

          <Link to="/" className="w-full sm:w-auto">
            <Button variant="ghost" size="md" className="w-full flex items-center justify-center gap-1.5">
              <Home size={15} /> Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // PENDING (Waiting for bank/payos callback)
  return (
    <div className="max-w-md mx-auto px-5 py-20 text-center animate-fadeIn">
      <div className="w-20 h-20 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Clock size={44} className="animate-pulse" />
      </div>

      <h1 className="text-2xl font-bold font-headline-lg text-deep-earth mb-3">
        Đang chờ xác nhận thanh toán
      </h1>

      <p className="text-on-surface-variant mb-6 text-sm">
        Giao dịch của bạn đang được ngân hàng đối soát. Hệ thống đang tự động cập nhật, vui lòng đợi trong giây lát...
      </p>

      {orderCode && (
        <p className="text-xs text-on-surface-variant/70 mb-8 font-mono bg-soft-clay/30 py-1.5 px-3 rounded-lg inline-block">
          Mã đơn: <strong>{orderCode}</strong>
        </p>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" size="sm" onClick={handleRetry}>
          <RefreshCw size={15} className="mr-1.5" /> Kiểm tra lại
        </Button>
        <Link to="/my-bookings">
          <Button size="sm">Xem lịch đặt</Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentPayOSReturnPage;
