import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Image as ImageIcon,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import type { WorkshopOwnerApplication, ApplicationStatus } from '../../types/application.type';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Tất cả hồ sơ' },
  { id: 'PENDING', label: 'Chờ xét duyệt' },
  { id: 'APPROVED', label: 'Đã phê duyệt' },
  { id: 'REJECTED', label: 'Đã từ chối' },
];

const ApproveHostsPage: React.FC = () => {
  const [applications, setApplications] = useState<WorkshopOwnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });

  // Modal states
  const [selectedApp, setSelectedApp] = useState<WorkshopOwnerApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch applications from API
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getAdminApplications({
        status: statusFilter,
        search: searchTerm.trim(),
        page,
        limit: 10,
      });

      const data = res.data?.data;
      if (data) {
        setApplications(data.applications || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        if (data.counts) {
          setCounts(data.counts);
        }
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Không thể tải danh sách hồ sơ đăng ký.',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Handle Approve
  const handleApprove = async () => {
    if (!selectedApp) return;
    try {
      setActionLoading(true);
      await applicationApi.approveApplication(selectedApp._id);
      setToastMessage({
        type: 'success',
        text: `Đã phê duyệt hồ sơ xưởng "${selectedApp.workshopName}" thành công! Người dùng đã được cấp quyền Chủ xưởng.`,
      });
      setIsApproveModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedApp(null);
      fetchApplications();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi phê duyệt hồ sơ.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!selectedApp) return;
    if (!rejectionReason.trim()) {
      setReasonError('Vui lòng nhập lý do từ chối hồ sơ này.');
      return;
    }
    try {
      setActionLoading(true);
      await applicationApi.rejectApplication(selectedApp._id, rejectionReason.trim());
      setToastMessage({
        type: 'success',
        text: `Đã từ chối hồ sơ xưởng "${selectedApp.workshopName}". Hệ thống đã gửi email thông báo lý do tới người dùng.`,
      });
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
      setReasonError('');
      fetchApplications();
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err.response?.data?.message || 'Lỗi khi từ chối hồ sơ.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Đã phê duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} /> Đã từ chối
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Clock size={13} /> Chờ xét duyệt
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-deep-earth">
            Quản lý đăng ký Chủ xưởng
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
            Xét duyệt các hồ sơ người dùng đăng ký trở thành Chủ xưởng nghệ nhân trên CraftLocal
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchApplications}
          disabled={loading}
          className="self-start sm:self-center"
        >
          <RotateCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </Button>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 animate-fadeIn shadow-xs border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="shrink-0 text-rose-600 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-medium">{toastMessage.text}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-xs font-bold hover:underline opacity-80 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white rounded-2xl border border-soft-clay p-4 space-y-4 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-soft-clay/60">
          {STATUS_FILTERS.map((tab) => {
            const count =
              tab.id === 'ALL'
                ? counts.all
                : tab.id === 'PENDING'
                ? counts.pending
                : tab.id === 'APPROVED'
                ? counts.approved
                : counts.rejected;

            const isActive = statusFilter === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#964824] text-white shadow-sm'
                    : 'bg-[#FAF7F2] text-on-surface-variant hover:text-deep-earth hover:bg-white border border-soft-clay'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : tab.id === 'PENDING' && count > 0
                      ? 'bg-amber-100 text-amber-800 font-extrabold'
                      : 'bg-soft-clay/60 text-on-surface-variant'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Tìm kiếm theo tên xưởng, người đại diện, email hoặc số điện thoại..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-soft-clay rounded-xl text-sm font-medium text-deep-earth placeholder:text-on-surface-variant/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                setPage(1);
              }}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-on-surface-variant hover:text-deep-earth"
            >
              Xóa
            </button>
          )}
        </div>
      </div>

      {/* Main Table / Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-soft-clay p-12 text-center">
          <Loading />
          <p className="mt-3 text-sm text-on-surface-variant">Đang tải danh sách hồ sơ...</p>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-soft-clay p-12 text-center">
          <EmptyState
            title="Không tìm thấy hồ sơ nào"
            description={
              searchTerm
                ? `Không có hồ sơ nào khớp với từ khóa "${searchTerm}".`
                : statusFilter !== 'ALL'
                ? `Hiện tại không có hồ sơ nào trong trạng thái "${STATUS_FILTERS.find((f) => f.id === statusFilter)?.label}".`
                : 'Hiện chưa có hồ sơ đăng ký Chủ xưởng nào trên hệ thống.'
            }
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-soft-clay shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-soft-clay text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <th className="py-3.5 px-4">Xưởng thủ công</th>
                  <th className="py-3.5 px-4">Người đăng ký</th>
                  <th className="py-3.5 px-4">Thông tin liên hệ</th>
                  <th className="py-3.5 px-4">Ngày đăng ký</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-clay/60 text-xs sm:text-sm">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    {/* Tên xưởng */}
                    <td className="py-4 px-4 font-semibold text-deep-earth">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#964824]/10 text-primary flex items-center justify-center shrink-0">
                          <Building2 size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-deep-earth line-clamp-1">{app.workshopName}</p>
                          <p className="text-[11px] text-on-surface-variant line-clamp-1 font-normal">
                            {app.workshopAddress}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Người đại diện */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-deep-earth">{app.ownerName}</div>
                      <div className="text-[11px] text-on-surface-variant">
                        {typeof app.userId === 'object' && app.userId?.fullName !== app.ownerName
                          ? `TK: ${app.userId?.fullName}`
                          : ''}
                      </div>
                    </td>

                    {/* Liên hệ */}
                    <td className="py-4 px-4 text-xs">
                      <div className="flex items-center gap-1.5 text-deep-earth font-mono">
                        <Phone size={12} className="text-on-surface-variant shrink-0" />
                        <span>{app.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant mt-0.5 truncate max-w-[200px]">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate">{app.email}</span>
                      </div>
                    </td>

                    {/* Ngày đăng ký */}
                    <td className="py-4 px-4 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar size={13} className="shrink-0" />
                        <span>{new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant/70 mt-0.5">
                        {new Date(app.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-4">{getStatusBadge(app.status)}</td>

                    {/* Thao tác */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDetailModalOpen(true);
                          }}
                          title="Xem chi tiết hồ sơ"
                          className="px-2.5"
                        >
                          <Eye size={15} className="mr-1" /> Chi tiết
                        </Button>

                        {app.status === 'PENDING' && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app);
                                setIsApproveModalOpen(true);
                              }}
                              className="px-2.5 bg-emerald-600 hover:bg-emerald-700 shadow-none text-xs"
                              title="Duyệt hồ sơ"
                            >
                              <CheckCircle2 size={14} className="mr-1" /> Duyệt
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedApp(app);
                                setRejectionReason('');
                                setReasonError('');
                                setIsRejectModalOpen(true);
                              }}
                              className="px-2.5 text-xs shadow-none"
                              title="Từ chối hồ sơ"
                            >
                              <XCircle size={14} className="mr-1" /> Từ chối
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-[#FAF7F2] border-t border-soft-clay flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-on-surface-variant">
              Hiển thị <strong>{applications.length}</strong> trên tổng số <strong>{total}</strong> hồ sơ (Trang {page}/{totalPages})
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2 py-1"
                >
                  <ChevronLeft size={14} /> Trước
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      page === p
                        ? 'bg-[#964824] text-white shadow-xs'
                        : 'bg-white border border-soft-clay text-deep-earth hover:bg-neutral-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1"
                >
                  Sau <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL XEM CHI TIẾT HỒ SƠ */}
      {/* ========================================================================= */}
      {isDetailModalOpen && selectedApp && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedApp(null);
          }}
          title="Chi tiết hồ sơ đăng ký Chủ xưởng"
          size="lg"
        >
          <div className="space-y-6 text-sm">
            {/* Header info */}
            <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-soft-clay flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-on-surface-variant uppercase font-bold tracking-wider">
                  Tên xưởng thủ công
                </span>
                <h2 className="text-lg font-bold text-deep-earth">{selectedApp.workshopName}</h2>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <MapPin size={13} className="shrink-0 text-primary" /> {selectedApp.workshopAddress}
                </p>
              </div>
              <div className="self-start sm:self-center">{getStatusBadge(selectedApp.status)}</div>
            </div>

            {/* Rejection notice if rejected */}
            {selectedApp.status === 'REJECTED' && selectedApp.rejectionReason && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider text-rose-700">
                  <AlertCircle size={14} /> Lý do từ chối từ Ban quản trị:
                </p>
                <p className="text-sm">{selectedApp.rejectionReason}</p>
                {selectedApp.reviewedAt && (
                  <p className="text-[11px] text-rose-600 mt-1">
                    Ngày từ chối: {new Date(selectedApp.reviewedAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </div>
            )}

            {/* Approval notice if approved */}
            {selectedApp.status === 'APPROVED' && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                <span>
                  Hồ sơ đã được phê duyệt vào ngày{' '}
                  <strong>
                    {selectedApp.reviewedAt
                      ? new Date(selectedApp.reviewedAt).toLocaleString('vi-VN')
                      : 'Đã duyệt'}
                  </strong>
                  . Tài khoản người dùng đã mang quyền <strong>HOST</strong>.
                </span>
              </div>
            )}

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-soft-clay">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Người đại diện</span>
                <p className="font-semibold text-deep-earth mt-0.5 flex items-center gap-1.5">
                  <User size={15} className="text-primary" /> {selectedApp.ownerName}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-soft-clay">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Số điện thoại liên hệ</span>
                <p className="font-semibold text-deep-earth mt-0.5 flex items-center gap-1.5 font-mono">
                  <Phone size={15} className="text-primary" /> {selectedApp.phone}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-soft-clay">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Email liên hệ</span>
                <p className="font-semibold text-deep-earth mt-0.5 flex items-center gap-1.5 truncate">
                  <Mail size={15} className="text-primary shrink-0" /> {selectedApp.email}
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-soft-clay">
                <span className="text-[11px] text-on-surface-variant uppercase font-bold">Ngày gửi hồ sơ</span>
                <p className="font-semibold text-deep-earth mt-0.5 flex items-center gap-1.5">
                  <Calendar size={15} className="text-primary" />{' '}
                  {new Date(selectedApp.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Mô tả xưởng */}
            <div className="bg-white p-4 rounded-xl border border-soft-clay space-y-1.5">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold flex items-center gap-1.5">
                <FileText size={14} className="text-primary" /> Giới thiệu xưởng & Hoạt động sản xuất
              </span>
              <p className="text-deep-earth whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                {selectedApp.description}
              </p>
            </div>

            {/* Hình ảnh xưởng */}
            <div className="space-y-2">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold flex items-center gap-1.5">
                <ImageIcon size={14} className="text-primary" /> Hình ảnh xưởng sản xuất ({selectedApp.workshopImages?.length || 0})
              </span>
              {selectedApp.workshopImages && selectedApp.workshopImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedApp.workshopImages.map((imgUrl, idx) => (
                    <a
                      key={idx}
                      href={imgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-video rounded-xl overflow-hidden border border-soft-clay group relative shadow-xs hover:opacity-90"
                    >
                      <img src={imgUrl} alt={`Ảnh xưởng ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                        Xem ảnh lớn
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant italic">Chưa tải lên hình ảnh xưởng.</p>
              )}
            </div>

            {/* Giấy tờ xác minh */}
            <div className="space-y-2">
              <span className="text-[11px] text-on-surface-variant uppercase font-bold flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" /> Giấy tờ xác minh danh tính & chứng nhận
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedApp.idCardFront && (
                  <div className="border border-soft-clay rounded-xl p-2 bg-[#FAF7F2]">
                    <p className="text-[11px] font-bold text-deep-earth mb-1.5">CCCD mặt trước:</p>
                    <a href={selectedApp.idCardFront} target="_blank" rel="noopener noreferrer" className="block aspect-[16/10] rounded-lg overflow-hidden border">
                      <img src={selectedApp.idCardFront} alt="CCCD mặt trước" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
                {selectedApp.idCardBack && (
                  <div className="border border-soft-clay rounded-xl p-2 bg-[#FAF7F2]">
                    <p className="text-[11px] font-bold text-deep-earth mb-1.5">CCCD mặt sau:</p>
                    <a href={selectedApp.idCardBack} target="_blank" rel="noopener noreferrer" className="block aspect-[16/10] rounded-lg overflow-hidden border">
                      <img src={selectedApp.idCardBack} alt="CCCD mặt sau" className="w-full h-full object-cover" />
                    </a>
                  </div>
                )}
                {selectedApp.businessLicense && (
                  <div className="border border-soft-clay rounded-xl p-2 bg-[#FAF7F2] sm:col-span-2">
                    <p className="text-[11px] font-bold text-deep-earth mb-1.5">Giấy phép kinh doanh / Chứng nhận làng nghề:</p>
                    <a href={selectedApp.businessLicense} target="_blank" rel="noopener noreferrer" className="block max-h-48 rounded-lg overflow-hidden border">
                      <img src={selectedApp.businessLicense} alt="Giấy phép kinh doanh" className="w-full h-full object-contain bg-white" />
                    </a>
                  </div>
                )}
              </div>
              {!selectedApp.idCardFront && !selectedApp.idCardBack && !selectedApp.businessLicense && (
                <p className="text-xs text-on-surface-variant italic">Không có giấy tờ đính kèm.</p>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-4 border-t border-soft-clay flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedApp(null);
                }}
              >
                Đóng
              </Button>

              {selectedApp.status === 'PENDING' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="danger"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setRejectionReason('');
                      setReasonError('');
                      setIsRejectModalOpen(true);
                    }}
                  >
                    <XCircle size={15} className="mr-1.5" /> Từ chối hồ sơ
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setIsApproveModalOpen(true)}
                  >
                    <CheckCircle2 size={15} className="mr-1.5" /> Phê duyệt hồ sơ
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL XÁC NHẬN PHÊ DUYỆT */}
      {/* ========================================================================= */}
      {isApproveModalOpen && selectedApp && (
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title="Xác nhận phê duyệt Chủ xưởng"
          size="sm"
        >
          <div className="space-y-4 text-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>

            <div className="text-center">
              <p className="font-semibold text-deep-earth">
                Bạn có chắc chắn muốn phê duyệt hồ sơ xưởng{' '}
                <strong className="text-primary">{selectedApp.workshopName}</strong>?
              </p>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Sau khi phê duyệt, tài khoản của <strong>{selectedApp.ownerName}</strong> sẽ tự động được nâng cấp thành vai trò <strong>Chủ xưởng (HOST)</strong> và nhận được email thông báo chúc mừng kèm liên kết truy cập Bảng quản trị.
              </p>
            </div>

            <div className="pt-4 border-t border-soft-clay flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApproveModalOpen(false)}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                isLoading={actionLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Xác nhận phê duyệt
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* 3. MODAL TỪ CHỐI HỒ SƠ KÈM LÝ DO */}
      {/* ========================================================================= */}
      {isRejectModalOpen && selectedApp && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Từ chối hồ sơ Chủ xưởng"
          size="md"
        >
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý:</strong> Vui lòng nhập lý do cụ thể và rõ ràng để người đăng ký (
                <strong>{selectedApp.ownerName}</strong>) nắm được nguyên nhân, chỉnh sửa và gửi lại hồ sơ khi cần.
              </div>
            </div>

            <div>
              <label htmlFor="rejectionReason" className="block text-xs font-bold text-deep-earth uppercase mb-1.5">
                Lý do từ chối <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="rejectionReason"
                rows={4}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (reasonError) setReasonError('');
                }}
                placeholder="Ví dụ: Hình ảnh chụp xưởng chưa rõ nét, thiếu hình ảnh quy trình sản xuất thực tế, hoặc thông tin giấy tờ xác minh chưa trùng khớp..."
                className={`w-full p-3 bg-[#FAF7F2] border rounded-xl text-sm text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all ${
                  reasonError ? 'border-rose-500' : 'border-soft-clay'
                }`}
              />
              {reasonError && (
                <p className="text-xs text-rose-600 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle size={13} /> {reasonError}
                </p>
              )}
            </div>

            <p className="text-[11px] text-on-surface-variant">
              Email thông báo từ chối kèm lý do trên sẽ được tự động gửi tới địa chỉ: <strong>{selectedApp.email}</strong>. Tài khoản vẫn được giữ nguyên quyền Du khách.
            </p>

            <div className="pt-4 border-t border-soft-clay flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRejectModalOpen(false)}
                disabled={actionLoading}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReject}
                isLoading={actionLoading}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ApproveHostsPage;
