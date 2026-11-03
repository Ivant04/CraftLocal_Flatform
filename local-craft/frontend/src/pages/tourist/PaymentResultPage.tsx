import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const PaymentResultPage: React.FC = () => {
  const [params] = useSearchParams();
  const status = params.get('status') || 'SUCCESS';
  const isSuccess = status === 'SUCCESS';

  return (
    <div className="max-w-lg mx-auto px-5 py-20 text-center">
      {isSuccess ? (
        <>
          <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
          <h1 className="font-headline-lg text-headline-md text-deep-earth mb-3">Thanh toán thành công!</h1>
          <p className="text-on-surface-variant mb-8">Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ sớm xử lý đơn hàng của bạn.</p>
          <div className="flex justify-center gap-4">
            <Link to="/my-orders"><Button variant="outline">Xem đơn hàng</Button></Link>
            <Link to="/"><Button>Về trang chủ</Button></Link>
          </div>
        </>
      ) : (
        <>
          <XCircle size={64} className="mx-auto text-error mb-6" />
          <h1 className="font-headline-lg text-headline-md text-deep-earth mb-3">Thanh toán thất bại</h1>
          <p className="text-on-surface-variant mb-8">Rất tiếc, thanh toán không thành công. Vui lòng thử lại.</p>
          <Link to="/cart"><Button>Quay lại giỏ hàng</Button></Link>
        </>
      )}
    </div>
  );
};

export default PaymentResultPage;
