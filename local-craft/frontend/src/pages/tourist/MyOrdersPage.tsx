import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Calendar, MapPin, ArrowRight, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { orders } from '../../utils/mockData';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const MyOrdersPage: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SHIPPING' | 'COMPLETED'>('ALL');

  const filteredOrders = orders.filter((o) => {
    if (filter === 'PENDING') return o.status === 'PENDING' || o.status === 'CONFIRMED';
    if (filter === 'SHIPPING') return o.status === 'SHIPPING';
    if (filter === 'COMPLETED') return o.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen bg-surface-warm pb-20 pt-8">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tài khoản du khách</span>
            <h1 className="font-headline text-2xl md:text-3xl lg:text-4xl font-bold text-deep-earth mt-1">
              Đơn hàng thủ công của tôi
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-1">
              Theo dõi tiến độ chế tác và vận chuyển sản phẩm từ các nghệ nhân
            </p>
          </div>
          <Link to="/products">
            <Button variant="primary" size="md">
              <ShoppingBag size={16} className="mr-1.5" /> Mua thêm sản phẩm
            </Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-outline-subtle">
          {[
            { id: 'ALL', label: 'Tất cả đơn hàng', count: orders.length },
            { id: 'PENDING', label: 'Đang xử lý / Chờ xác nhận', count: orders.filter((o) => o.status === 'PENDING' || o.status === 'CONFIRMED').length },
            { id: 'SHIPPING', label: 'Đang giao hàng', count: orders.filter((o) => o.status === 'SHIPPING').length },
            { id: 'COMPLETED', label: 'Đã giao thành công', count: orders.filter((o) => o.status === 'COMPLETED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-deep-earth text-white shadow-xs'
                  : 'bg-white border border-outline-subtle text-on-surface-variant hover:text-deep-earth hover:border-outline-variant'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <EmptyState 
            title="Chưa có đơn hàng nào" 
            description="Bạn hiện chưa có đơn đặt mua tác phẩm thủ công nào trong danh mục này."
            action={
              <Link to="/products">
                <Button variant="primary">Khám phá Cửa hàng Thủ công</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((o) => {
              const statusVariant = 
                o.status === 'COMPLETED' ? 'success' :
                o.status === 'SHIPPING' ? 'earth' :
                o.status === 'CONFIRMED' ? 'heritage' : 'subtle';

              return (
                <div 
                  key={o._id} 
                  className="bg-white rounded-2xl border border-outline-subtle p-5 md:p-6 shadow-xs hover:border-primary/30 transition-all"
                >
                  {/* Top order bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-outline-subtle">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm md:text-base text-deep-earth">
                            Đơn hàng #{o._id.slice(-6).toUpperCase()}
                          </span>
                          <Badge variant={statusVariant} size="sm">
                            {ORDER_STATUS_LABELS[o.status] || o.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <Calendar size={12} /> Đặt ngày {formatDate(o.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-on-surface-variant block">Tổng thanh toán</span>
                      <strong className="text-primary font-bold text-base md:text-lg font-headline">
                        {formatCurrencyShort(o.totalAmount)}
                      </strong>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2.5 mb-4">
                    {o.items.map((item) => (
                      <div 
                        key={item.productId} 
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-warm/60 border border-outline-subtle text-xs md:text-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-primary/40 shrink-0" />
                          <span className="font-semibold text-deep-earth">{item.productName}</span>
                          <span className="text-on-surface-variant">× {item.quantity}</span>
                        </div>
                        <span className="font-mono font-medium text-deep-earth">
                          {formatCurrencyShort(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-subtle text-xs">
                    <div className="flex items-center gap-1.5 text-forest font-semibold">
                      <CheckCircle2 size={15} /> Đóng gói chống vỡ & Bảo hành làng nghề
                    </div>
                    <div className="flex gap-2">
                      <Link to="/products">
                        <Button size="sm" variant="ghost">Mua lại tác phẩm</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
