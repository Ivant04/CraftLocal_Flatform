import React from 'react';
import { orders } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import EmptyState from '../../components/common/EmptyState';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPING: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const MyOrdersPage: React.FC = () => {
  if (orders.length === 0) return <EmptyState title="Chưa có đơn hàng" description="Bạn chưa có đơn hàng nào." />;

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-10">
      <h1 className="font-headline-lg text-headline-md text-deep-earth mb-8">Đơn hàng của tôi</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o._id} className="bg-white rounded-xl border border-soft-clay p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold">Đơn hàng #{o._id}</p>
                <p className="text-sm text-on-surface-variant">{formatDate(o.createdAt)}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}`}>{ORDER_STATUS_LABELS[o.status]}</span>
            </div>
            <div className="space-y-1 mb-3">
              {o.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{formatCurrencyShort(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-soft-clay pt-3 flex justify-between font-bold">
              <span>Tổng tiền</span>
              <span className="text-primary">{formatCurrencyShort(o.totalAmount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrdersPage;
