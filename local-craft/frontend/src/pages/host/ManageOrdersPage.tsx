import React, { useEffect, useState } from 'react';
import orderApi from '../../api/orderApi';
import { normalizeOrder } from '../../utils/normalizers';
import type { Order } from '../../types/order.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import Loading from '../../components/common/Loading';

const ManageOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    orderApi
      .getByHost()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setOrders(Array.isArray(list) ? list.map(normalizeOrder) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách đơn hàng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setBusyId(orderId);
    setError('');
    try {
      await orderApi.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as Order['status'] } : o))
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý đơn hàng</h1>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-10 text-center text-on-surface-variant text-sm">
          Chưa có đơn hàng nào.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white rounded-xl border border-soft-clay p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-semibold">Đơn hàng {o.orderCode || `#${o._id.slice(-6).toUpperCase()}`}</p>
                  <p className="text-sm text-on-surface-variant">{o.touristName} · {formatDate(o.createdAt)}</p>
                </div>
                <select
                  value={o.status}
                  disabled={busyId === o._id}
                  onChange={(e) => handleStatusChange(o._id, e.target.value)}
                  className="px-3 py-2 border border-outline-variant rounded-lg text-sm font-medium cursor-pointer"
                >
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 mb-3">
                {o.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span>{item.productName} x {item.quantity}</span>
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
      )}
    </div>
  );
};

export default ManageOrdersPage;
