import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ShoppingBag, CheckCircle2, Truck, Box, Clock, ChevronRight } from 'lucide-react';
import orderApi from '../../api/orderApi';
import { normalizeOrder } from '../../utils/normalizers';
import type { Order } from '../../types/order.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SHIPPING' | 'COMPLETED'>('ALL');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    orderApi
      .getMyOrders()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setOrders(Array.isArray(list) ? list.map(normalizeOrder) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'PENDING') return o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PACKING';
    if (filter === 'SHIPPING') return o.status === 'SHIPPING';
    if (filter === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-craft-contour pb-20 pt-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
              Tài khoản du khách
            </span>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#3D2B1F] mt-1">
              Đơn hàng thủ công của tôi
            </h1>
            <p className="text-xs md:text-sm text-[#7A6255] mt-1">
              Theo dõi tiến độ chế tác và vận chuyển sản phẩm từ các nghệ nhân làng nghề truyền thống.
            </p>
          </div>
          <Link to="/products">
            <Button size="sm" variant="outline" className="shadow-xs">
              <ShoppingBag size={15} className="mr-1.5" /> Khám phá thêm sản phẩm
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[#EAD8CC]">
          {[
            { key: 'ALL', label: 'Tất cả đơn', count: orders.length },
            {
              key: 'PENDING',
              label: 'Chờ đóng gói',
              count: orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'PACKING').length,
            },
            {
              key: 'SHIPPING',
              label: 'Đang vận chuyển',
              count: orders.filter((o) => o.status === 'SHIPPING').length,
            },
            {
              key: 'COMPLETED',
              label: 'Đã hoàn thành',
              count: orders.filter((o) => o.status === 'COMPLETED').length,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.key
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-white border border-[#EAD8CC] text-[#7A6255] hover:text-[#3D2B1F] hover:bg-[#FAF7F2]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Loading / Error / Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm text-center">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#EAD8CC] p-12 text-center shadow-xs">
            <EmptyState
              title="Không có đơn hàng nào"
              description="Bạn chưa có đơn đặt mua sản phẩm thủ công nào trong mục này."
              icon={<Package size={48} className="text-[#964824] opacity-50" />}
              action={
                <Link to="/products">
                  <Button>Mua sắm ngay</Button>
                </Link>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 shadow-xs hover:border-[#964824]/40 hover:shadow-[0_8px_30px_rgba(61,43,31,0.06)] transition-all"
              >
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[#EAD8CC]/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#964824]/10 border border-[#964824]/20 flex items-center justify-center text-[#964824] shrink-0">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-sm md:text-base text-[#3D2B1F]">
                          Đơn hàng {o.orderCode || `#${o._id.slice(-6).toUpperCase()}`}
                        </span>
                        <Badge
                          variant={
                            o.status === 'COMPLETED'
                              ? 'success'
                              : o.status === 'SHIPPING'
                              ? 'info'
                              : o.status === 'CANCELLED'
                              ? 'danger'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {ORDER_STATUS_LABELS[o.status] || o.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-[#7A6255] flex items-center gap-1 mt-0.5">
                        <Calendar size={12} /> Đặt ngày {formatDate(o.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#7A6255] block">Tổng thanh toán</span>
                    <strong className="text-[#964824] font-bold text-base md:text-lg font-serif">
                      {formatCurrencyShort(o.totalAmount)}
                    </strong>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4">
                  {o.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC] text-xs md:text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#3D2B1F]">{item.productName}</span>
                        <span className="text-[#7A6255]">× {item.quantity}</span>
                      </div>
                      <span className="font-mono font-medium text-[#3D2B1F]">
                        {formatCurrencyShort(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAD8CC]/60 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Giao đến: {o.shippingAddress}</span>
                  </div>
                  <span className="text-[#7A6255]">
                    Phương thức: <strong className="text-[#3D2B1F]">{o.paymentMethod || 'PAYOS'}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
