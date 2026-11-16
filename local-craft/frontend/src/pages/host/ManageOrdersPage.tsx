import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Package,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  XCircle,
  Truck,
  Box,
  CreditCard,
  RefreshCw,
  Eye,
  AlertCircle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import orderApi from '../../api/orderApi';
import { normalizeOrder } from '../../utils/normalizers';
import type { Order, OrderStatus } from '../../types/order.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const STATUS_FILTERS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'ALL', label: 'Tất cả đơn', icon: <Package size={15} /> },
  { id: 'PENDING', label: 'Chờ xác nhận', icon: <Clock size={15} /> },
  { id: 'CONFIRMED', label: 'Đã xác nhận', icon: <CheckCircle2 size={15} /> },
  { id: 'PACKING', label: 'Đang đóng gói', icon: <Box size={15} /> },
  { id: 'SHIPPING', label: 'Đang vận chuyển', icon: <Truck size={15} /> },
  { id: 'COMPLETED', label: 'Hoàn thành', icon: <Sparkles size={15} /> },
  { id: 'CANCELLED', label: 'Đã hủy', icon: <XCircle size={15} /> },
];

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  CONFIRMED: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  PACKING: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  SHIPPING: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  REFUNDED: { bg: 'bg-stone-100', text: 'text-stone-700', border: 'border-stone-200' },
};

const ManageOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await orderApi.getByHost();
      const list = res.data?.data;
      setOrders(Array.isArray(list) ? list.map(normalizeOrder) : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách đơn hàng.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setBusyId(orderId);
    setError('');
    try {
      await orderApi.updateStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus as OrderStatus } : o))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as OrderStatus } : null));
      }
      setToastMessage({
        type: 'success',
        text: `Đã cập nhật trạng thái đơn sang "${ORDER_STATUS_LABELS[newStatus] || newStatus}"`,
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Cập nhật trạng thái đơn hàng thất bại.',
      });
    } finally {
      setBusyId(null);
    }
  };

  // Status Counts
  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    STATUS_FILTERS.forEach((f) => {
      if (f.id !== 'ALL') c[f.id] = 0;
    });
    orders.forEach((o) => {
      if (o.status in c) c[o.status] += 1;
    });
    return c;
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = selectedStatus === 'ALL' || o.status === selectedStatus;
      const matchSearch =
        !searchTerm.trim() ||
        o.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.touristName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.touristPhone?.includes(searchTerm);
      return matchStatus && matchSearch;
    });
  }, [orders, selectedStatus, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-semibold transition-all animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-700'
              : 'bg-rose-900/95 text-white border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
            Kênh Quản lý Xưởng
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
            Quản lý đơn hàng sản phẩm
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Theo dõi, đóng gói và cập nhật tiến độ giao các tác phẩm thủ công cho du khách.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 md:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {STATUS_FILTERS.map((tab) => {
              const isActive = selectedStatus === tab.id;
              const count = counts[tab.id] || 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#964824] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-[#EAD8CC]/60 text-[#7A6255]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 lg:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List / Empty / Loading */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loading />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EAD8CC] py-16">
          <EmptyState
            title="Chưa có đơn hàng nào"
            description="Không tìm thấy đơn hàng nào phù hợp với bộ lọc hiện tại."
            icon={<Package size={44} className="text-[#964824] opacity-50" />}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const style = statusStyles[o.status] || {
              bg: 'bg-stone-100',
              text: 'text-stone-700',
              border: 'border-stone-200',
            };
            const displayCode = o.orderCode || `#${o._id.slice(-6).toUpperCase()}`;

            return (
              <div
                key={o._id}
                className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 hover:shadow-[0_6px_24px_rgba(61,43,31,0.06)] transition-all group"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAD8CC]/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#964824]/10 border border-[#964824]/20 flex items-center justify-center text-[#964824] shrink-0 font-bold">
                      <Package size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-[#3D2B1F]">
                          {displayCode}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {ORDER_STATUS_LABELS[o.status] || o.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#7A6255] mt-0.5 flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>Đặt ngày: {formatDate(o.createdAt)}</span>
                        {o.paymentMethod && <span>• Thanh toán: {o.paymentMethod}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Status Action Selector */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs text-[#7A6255] font-medium hidden sm:inline">Trạng thái:</span>
                    <select
                      value={o.status}
                      disabled={busyId === o._id}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer disabled:opacity-50"
                    >
                      {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-2 rounded-xl text-[#7A6255] hover:text-[#964824] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                      title="Xem chi tiết đơn"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </div>

                {/* Tourist & Shipping Info */}
                <div className="py-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#7A6255]">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#964824] shrink-0" />
                    <span>
                      Người nhận: <strong className="text-[#3D2B1F]">{o.touristName}</strong>
                    </span>
                    {o.touristPhone && (
                      <span className="flex items-center gap-1 text-[#7A6255]">
                        <Phone size={12} /> {o.touristPhone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-[#964824] shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      Địa chỉ: <strong className="text-[#3D2B1F]">{o.shippingAddress}</strong>
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-3 border-t border-[#EAD8CC]/40 space-y-2">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#EAD8CC] shrink-0">
                          <ImageWithFallback
                            src={item.productImage}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-[#3D2B1F]">{item.productName}</span>
                        <span className="text-[#7A6255]">x{item.quantity}</span>
                      </div>
                      <span className="font-mono font-medium text-[#7A6255]">
                        {formatCurrencyShort(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div className="pt-3 border-t border-[#EAD8CC] flex items-center justify-between">
                  <div className="text-xs text-[#7A6255]">
                    <span>Phí vận chuyển: </span>
                    <strong className="text-[#3D2B1F]">
                      {o.shippingFee > 0 ? formatCurrencyShort(o.shippingFee) : 'Miễn phí'}
                    </strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7A6255] font-medium">Tổng thanh toán:</span>
                    <span className="font-serif font-bold text-base md:text-lg text-[#964824]">
                      {formatCurrencyShort(o.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail Order */}
      <Modal
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn hàng ${selectedOrder?.orderCode || ''}`}
      >
        {selectedOrder && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAD8CC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7A6255]">Trạng thái giao hàng</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    statusStyles[selectedOrder.status]?.bg || ''
                  } ${statusStyles[selectedOrder.status]?.text || ''} ${
                    statusStyles[selectedOrder.status]?.border || ''
                  }`}
                >
                  {ORDER_STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
              <p className="text-xs text-[#3D2B1F]">
                <strong>Khách hàng:</strong> {selectedOrder.touristName} • SĐT:{' '}
                {selectedOrder.touristPhone || 'Chưa cập nhật'}
              </p>
              <p className="text-xs text-[#3D2B1F]">
                <strong>Địa chỉ giao:</strong> {selectedOrder.shippingAddress}
              </p>
            </div>

            <div>
              <h4 className="font-serif font-bold text-sm text-[#3D2B1F] mb-2.5">Danh sách sản phẩm</h4>
              <div className="divide-y divide-[#EAD8CC] border border-[#EAD8CC] rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#EAD8CC] shrink-0">
                        <ImageWithFallback
                          src={item.productImage}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#3D2B1F]">{item.productName}</p>
                        <p className="text-[#7A6255]">
                          {formatCurrencyShort(item.price)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-[#964824]">
                      {formatCurrencyShort(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#7A6255]">
                <span>Tạm tính tiền hàng</span>
                <span className="font-mono">
                  {formatCurrencyShort(selectedOrder.totalAmount - (selectedOrder.shippingFee || 0))}
                </span>
              </div>
              <div className="flex justify-between text-[#7A6255]">
                <span>Phí vận chuyển</span>
                <span className="font-mono">
                  {selectedOrder.shippingFee ? formatCurrencyShort(selectedOrder.shippingFee) : '0 ₫'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#964824] pt-1.5 border-t border-[#EAD8CC]">
                <span>Tổng đơn hàng</span>
                <span>{formatCurrencyShort(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageOrdersPage;
