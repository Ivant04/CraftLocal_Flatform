import React from 'react';
import { orders } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../../utils/constants';

const ManageOrdersPage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý đơn hàng</h1>
    <div className="space-y-4">
      {orders.map((o) => (
        <div key={o._id} className="bg-white rounded-xl border border-soft-clay p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div><p className="font-semibold">Đơn hàng #{o._id}</p><p className="text-sm text-on-surface-variant">{o.touristName} · {formatDate(o.createdAt)}</p></div>
            <select defaultValue={o.status} className="px-3 py-2 border border-outline-variant rounded-lg text-sm font-medium">
              {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </div>
          <div className="space-y-1 mb-3">{o.items.map((item) => (<div key={item.productId} className="flex justify-between text-sm"><span>{item.productName} x {item.quantity}</span><span>{formatCurrencyShort(item.price * item.quantity)}</span></div>))}</div>
          <div className="border-t border-soft-clay pt-3 flex justify-between font-bold"><span>Tổng tiền</span><span className="text-primary">{formatCurrencyShort(o.totalAmount)}</span></div>
        </div>
      ))}
    </div>
  </div>
);

export default ManageOrdersPage;
