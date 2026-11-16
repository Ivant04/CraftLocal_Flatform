import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowLeft,
  Search,
  Phone,
  QrCode,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import tourGuideApi from '../../api/tourGuideApi';
import { normalizeBooking } from '../../utils/normalizers';
import type { Booking } from '../../types/booking.type';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const CustomerListPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CHECKED_IN' | 'PENDING'>('ALL');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchCustomers = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await tourGuideApi.getCustomers(id);
      const rawList = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setCustomers(rawList.map(normalizeBooking));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách khách hàng của ca trải nghiệm.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [id]);

  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const handleCheckIn = async (booking: Booking) => {
    if (!booking.qrCode) {
      navigate('/tour-guide/check-in');
      return;
    }
    setCheckingId(booking._id);
    setError('');
    try {
      await tourGuideApi.checkIn(booking.qrCode);
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === booking._id ? { ...c, checkInStatus: 'CHECKED_IN', status: 'CONFIRMED' } : c
        )
      );
      setToastMessage({
        type: 'success',
        text: `Đã check-in thành công cho khách hàng ${booking.touristName}.`,
      });
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Check-in thất bại.',
      });
    } finally {
      setCheckingId(null);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const totalBookings = customers.length;
    const totalGuests = customers.reduce((acc, c) => acc + (c.guests || 1), 0);
    const checkedInGuests = customers
      .filter((c) => c.checkInStatus === 'CHECKED_IN')
      .reduce((acc, c) => acc + (c.guests || 1), 0);
    const checkedInBookings = customers.filter((c) => c.checkInStatus === 'CHECKED_IN').length;
    const percent = totalGuests > 0 ? Math.round((checkedInGuests / totalGuests) * 100) : 0;
    return { totalBookings, totalGuests, checkedInGuests, checkedInBookings, percent };
  }, [customers]);

  // Filtered
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const isCheckedIn = c.checkInStatus === 'CHECKED_IN';
      const matchStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'CHECKED_IN' && isCheckedIn) ||
        (filterStatus === 'PENDING' && !isCheckedIn);
      const matchSearch =
        !searchTerm.trim() ||
        c.touristName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.touristPhone?.includes(searchTerm) ||
        c.bookingCode?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [customers, filterStatus, searchTerm]);

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
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div>
        <Link
          to="/tour-guide/schedules"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6255] hover:text-[#964824] transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Quay lại Lịch phân công</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#964824]/10 border border-[#964824]/20 flex items-center justify-center text-[#964824]">
              <Users size={20} />
            </div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F]">
                Danh sách khách tham gia
              </h1>
              <p className="text-xs md:text-sm text-[#7A6255] mt-0.5">
                Kiểm tra thông tin vé, check-in đón khách và chuẩn bị dụng cụ thực hành làng nghề.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={fetchCustomers}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Làm mới</span>
            </button>
            <Link to="/tour-guide/check-in">
              <Button size="sm" className="inline-flex items-center gap-1.5 shadow-sm">
                <QrCode size={16} />
                <span>Quét mã QR</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Check-in Progress Banner */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#964824]">
              Tiến độ đón khách
            </span>
            <p className="font-serif font-bold text-lg text-[#3D2B1F] mt-0.5">
              Đã check-in {metrics.checkedInGuests} / {metrics.totalGuests} khách tham gia ({metrics.percent}%)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7A6255]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 size={13} /> {metrics.checkedInBookings} vé đã vào
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <Circle size={13} /> {metrics.totalBookings - metrics.checkedInBookings} vé chờ
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#FAF7F2] border border-[#EAD8CC] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#964824] rounded-full transition-all duration-500"
            style={{ width: `${metrics.percent}%` }}
          />
        </div>
      </div>

      {/* Main Card: Controls & Customer List */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-4 md:p-5 border-b border-[#EAD8CC] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên khách, SĐT, mã vé..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterStatus === 'ALL'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Tất cả ({customers.length})
            </button>
            <button
              onClick={() => setFilterStatus('CHECKED_IN')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterStatus === 'CHECKED_IN'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Đã check-in ({metrics.checkedInBookings})
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                filterStatus === 'PENDING'
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
              }`}
            >
              Chưa check-in ({metrics.totalBookings - metrics.checkedInBookings})
            </button>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="m-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* List Content */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="Chưa có khách hàng"
              description="Không có khách hàng nào phù hợp với bộ lọc hiện tại hoặc ca này chưa có khách đăng ký."
              icon={<Users size={44} className="text-[#964824] opacity-50" />}
            />
          </div>
        ) : (
          <div className="divide-y divide-[#EAD8CC]/60">
            {filteredCustomers.map((c) => {
              const isCheckedIn = c.checkInStatus === 'CHECKED_IN';
              return (
                <div
                  key={c._id}
                  className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2]/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#964824]/10 border border-[#EAD8CC] flex items-center justify-center font-bold text-sm text-[#964824] shrink-0">
                      {c.touristName?.charAt(0)?.toUpperCase() || 'K'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-serif font-bold text-sm md:text-base text-[#3D2B1F]">
                          {c.touristName}
                        </p>
                        {c.status === 'PENDING' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            Chờ thanh toán
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#7A6255] mt-1">
                        <span className="font-semibold text-[#3D2B1F] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#EAD8CC]">
                          {c.guests || 1} khách
                        </span>
                        {c.bookingCode && (
                          <span className="font-mono text-[11px]">Mã vé: {c.bookingCode}</span>
                        )}
                        {c.touristPhone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-[#964824]" />
                            {c.touristPhone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isCheckedIn ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-800 text-xs font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Đã check-in</span>
                      </span>
                    ) : c.status === 'PENDING' ? (
                      <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                        Chưa thanh toán
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCheckIn(c)}
                        disabled={checkingId === c._id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#964824] hover:bg-[#7A3518] rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {checkingId === c._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        <span>Xác nhận Check-in</span>
                      </button>
                    )}
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

export default CustomerListPage;
