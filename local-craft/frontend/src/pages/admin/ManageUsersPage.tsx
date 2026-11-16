import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  Compass,
  Lock,
  Unlock,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import adminApi from '../../api/adminApi';
import type { User, UserRole, UserStatus } from '../../types/user.type';
import { ROLE_LABELS, USER_STATUS_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/formatDate';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const ROLE_TABS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'ALL', label: 'Tất cả', icon: <Users size={15} /> },
  { id: 'TOURIST', label: 'Du khách', icon: <Users size={15} /> },
  { id: 'HOST', label: 'Chủ xưởng', icon: <UserCheck size={15} /> },
  { id: 'TOUR_GUIDE', label: 'Hướng dẫn viên', icon: <Compass size={15} /> },
  { id: 'ADMIN', label: 'Quản trị viên', icon: <ShieldCheck size={15} /> },
];

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: 'ALL', label: 'Mọi trạng thái' },
  { id: 'ACTIVE', label: 'Đang hoạt động' },
  { id: 'BLOCKED', label: 'Đã bị khóa' },
  { id: 'PENDING', label: 'Chờ duyệt' },
];

const roleBadgeStyles: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  HOST: 'bg-[#964824]/10 text-[#964824] border-[#964824]/20',
  TOUR_GUIDE: 'bg-blue-100 text-blue-800 border-blue-200',
  TOURIST: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusBadgeStyles: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [totalCount, setTotalCount] = useState(0);

  // Modal confirm block/unblock
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        limit: 100, // Fetch up to 100 to allow client-side search & filtering smoothly
      };
      if (selectedRole !== 'ALL') params.role = selectedRole;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;

      const res = await adminApi.getUsers(params);
      const list = res.data?.data?.users ?? res.data?.data ?? [];
      const userList = Array.isArray(list) ? list : [];
      setUsers(userList);
      setTotalCount(res.data?.data?.total ?? userList.length);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setLoading(false);
    }
  }, [selectedRole, selectedStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Toast timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        !searchTerm.trim() ||
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm);
      return matchSearch;
    });
  }, [users, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Role counts
  const roleCounts = useMemo(() => {
    const counts = { ALL: users.length, TOURIST: 0, HOST: 0, TOUR_GUIDE: 0, ADMIN: 0 };
    users.forEach((u) => {
      if (u.role in counts) {
        counts[u.role as keyof typeof counts] += 1;
      }
    });
    return counts;
  }, [users]);

  const handleOpenConfirm = (u: User) => {
    setTargetUser(u);
    setIsConfirmModalOpen(true);
  };

  const handleExecuteToggleBlock = async () => {
    if (!targetUser) return;
    setActionLoading(true);
    try {
      const res =
        targetUser.status === 'BLOCKED'
          ? await adminApi.unblockUser(targetUser._id)
          : await adminApi.blockUser(targetUser._id);

      const updated = res.data?.data;
      if (updated) {
        setUsers((prev) => prev.map((item) => (item._id === targetUser._id ? updated : item)));
      } else {
        // Fallback update status locally
        setUsers((prev) =>
          prev.map((item) =>
            item._id === targetUser._id
              ? { ...item, status: targetUser.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' }
              : item
          )
        );
      }

      setToastMessage({
        type: 'success',
        text:
          targetUser.status === 'BLOCKED'
            ? `Đã mở khóa tài khoản ${targetUser.fullName}`
            : `Đã khóa tài khoản ${targetUser.fullName}`,
      });
      setIsConfirmModalOpen(false);
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Cập nhật trạng thái thất bại.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            Hệ thống Quản trị
          </span>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F] mt-1">
            Quản lý người dùng
          </h1>
          <p className="text-xs md:text-sm text-[#7A6255] mt-1">
            Quản lý, phân quyền và kiểm soát quyền truy cập của các tài khoản trên nền tảng CraftLocal.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#7A6255] bg-white border border-[#EAD8CC] hover:bg-[#FAF7F2] hover:text-[#964824] rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[
          { label: 'Tổng tài khoản', count: roleCounts.ALL, icon: <Users size={18} />, color: 'bg-[#964824]' },
          { label: 'Du khách', count: roleCounts.TOURIST, icon: <Users size={18} />, color: 'bg-emerald-600' },
          { label: 'Chủ xưởng', count: roleCounts.HOST, icon: <UserCheck size={18} />, color: 'bg-amber-600' },
          { label: 'Hướng dẫn viên', count: roleCounts.TOUR_GUIDE, icon: <Compass size={18} />, color: 'bg-blue-600' },
          { label: 'Quản trị viên', count: roleCounts.ADMIN, icon: <ShieldCheck size={18} />, color: 'bg-purple-600' },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white rounded-2xl border border-[#EAD8CC] p-4 hover:shadow-[0_4px_20px_rgba(61,43,31,0.06)] transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl ${item.color} text-white flex items-center justify-center shrink-0 shadow-2xs`}
              >
                {item.icon}
              </div>
              <div>
                <p className="text-xs text-[#7A6255] font-medium">{item.label}</p>
                <p className="text-lg font-bold text-[#3D2B1F] tracking-tight">{item.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-[#EAD8CC] overflow-hidden shadow-xs">
        {/* Controls Bar: Tabs & Search */}
        <div className="p-4 md:p-5 border-b border-[#EAD8CC] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {ROLE_TABS.map((tab) => {
                const isActive = selectedRole === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedRole(tab.id);
                      setPage(1);
                    }}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#964824] text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-[#7A6255] hover:bg-[#F2E8DF] hover:text-[#3D2B1F]'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search & Status Filter */}
            <div className="flex items-center gap-2.5">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A6255]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Tìm theo tên, email, SĐT..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] placeholder-[#7A6255]/70 focus:outline-none focus:border-[#964824] focus:bg-white transition-all"
                />
              </div>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-[#FAF7F2] border border-[#EAD8CC] rounded-xl text-[#3D2B1F] focus:outline-none focus:border-[#964824] cursor-pointer"
              >
                {STATUS_FILTERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="m-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading / Table / Empty State */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loading />
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="Không tìm thấy người dùng"
              description="Không có tài khoản nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm hiện tại."
              icon={<Users size={40} className="text-[#964824] opacity-50" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-[#EAD8CC] bg-[#FAF7F2]/80 text-[#7A6255] font-semibold">
                  <th className="py-3.5 px-4 md:px-6">Thành viên</th>
                  <th className="py-3.5 px-4">Liên hệ</th>
                  <th className="py-3.5 px-4">Vai trò</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Ngày tham gia</th>
                  <th className="py-3.5 px-4 md:px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAD8CC]/60 text-[#3D2B1F]">
                {paginatedUsers.map((u) => {
                  const roleStyle = roleBadgeStyles[u.role] || 'bg-stone-100 text-stone-700 border-stone-200';
                  const statusStyle = statusBadgeStyles[u.status] || 'bg-stone-100 text-stone-700 border-stone-200';
                  const isSelfOrAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u._id} className="hover:bg-[#FAF7F2]/60 transition-colors group">
                      {/* Member Info */}
                      <td className="py-3.5 px-4 md:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#964824]/10 border border-[#EAD8CC] flex items-center justify-center font-bold text-[#964824] text-xs shrink-0 overflow-hidden">
                            {u.avatar ? (
                              <img src={u.avatar} alt={u.fullName} className="w-full h-full object-cover" />
                            ) : (
                              u.fullName?.charAt(0)?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#3D2B1F] group-hover:text-[#964824] transition-colors">
                              {u.fullName || 'Chưa cập nhật'}
                            </p>
                            <p className="text-[11px] text-[#7A6255] font-mono mt-0.5">ID: {u._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-xs text-[#7A6255]">
                          <div className="flex items-center gap-1.5 text-[#3D2B1F]">
                            <Mail size={12} className="text-[#964824]" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-[#7A6255]">
                              <Phone size={12} />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleStyle}`}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : u.status === 'BLOCKED'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {USER_STATUS_LABELS[u.status] || u.status}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-xs text-[#7A6255]">
                        {u.createdAt ? formatDate(u.createdAt) : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 md:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setDetailUser(u);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#7A6255] hover:text-[#964824] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <UserCheck size={16} />
                          </button>

                          {!isSelfOrAdmin ? (
                            <button
                              onClick={() => handleOpenConfirm(u)}
                              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                u.status === 'BLOCKED'
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-rose-700 hover:bg-rose-50'
                              }`}
                              title={u.status === 'BLOCKED' ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            >
                              {u.status === 'BLOCKED' ? <Unlock size={16} /> : <Lock size={16} />}
                            </button>
                          ) : (
                            <span className="p-1.5 text-stone-300" title="Không thể thao tác trên tài khoản Quản trị">
                              <ShieldCheck size={16} />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        {filteredUsers.length > 0 && (
          <div className="p-4 md:px-6 border-t border-[#EAD8CC] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A6255]">
            <p>
              Hiển thị <span className="font-semibold text-[#3D2B1F]">{(page - 1) * pageSize + 1}</span> -{' '}
              <span className="font-semibold text-[#3D2B1F]">
                {Math.min(page * pageSize, filteredUsers.length)}
              </span>{' '}
              trong tổng số <span className="font-semibold text-[#3D2B1F]">{filteredUsers.length}</span> tài khoản
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-[#EAD8CC] hover:bg-[#FAF7F2] text-[#3D2B1F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-medium">
                Trang {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-[#EAD8CC] hover:bg-[#FAF7F2] text-[#3D2B1F] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Confirm Block / Unblock */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !actionLoading && setIsConfirmModalOpen(false)}
        title={targetUser?.status === 'BLOCKED' ? 'Xác nhận mở khóa tài khoản' : 'Xác nhận khóa tài khoản'}
      >
        <div className="space-y-4">
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
              targetUser?.status === 'BLOCKED'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {targetUser?.status === 'BLOCKED' ? (
              <Unlock size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Lock size={18} className="text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {targetUser?.status === 'BLOCKED'
                  ? 'Mở lại quyền truy cập cho thành viên'
                  : 'Cảnh báo tạm dừng tài khoản'}
              </p>
              <p className="mt-1">
                {targetUser?.status === 'BLOCKED'
                  ? `Người dùng "${targetUser?.fullName}" (${targetUser?.email}) sẽ có thể đăng nhập lại và sử dụng các tính năng bình thường.`
                  : `Người dùng "${targetUser?.fullName}" (${targetUser?.email}) sẽ bị từ chối đăng nhập và tạm ngưng toàn bộ phiên hoạt động.`}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={actionLoading}
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="button"
              variant={targetUser?.status === 'BLOCKED' ? 'primary' : 'danger'}
              isLoading={actionLoading}
              onClick={handleExecuteToggleBlock}
            >
              {targetUser?.status === 'BLOCKED' ? 'Mở khóa ngay' : 'Khóa tài khoản'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal View Detail User */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Thông tin chi tiết tài khoản"
      >
        {detailUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-[#EAD8CC]">
              <div className="w-14 h-14 rounded-full bg-[#964824]/10 border border-[#EAD8CC] flex items-center justify-center font-bold text-lg text-[#964824] shrink-0 overflow-hidden">
                {detailUser.avatar ? (
                  <img src={detailUser.avatar} alt={detailUser.fullName} className="w-full h-full object-cover" />
                ) : (
                  detailUser.fullName?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#3D2B1F]">{detailUser.fullName}</h3>
                <p className="text-xs text-[#7A6255] font-mono mt-0.5">ID: {detailUser._id}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      roleBadgeStyles[detailUser.role] || ''
                    }`}
                  >
                    {ROLE_LABELS[detailUser.role] || detailUser.role}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      statusBadgeStyles[detailUser.status] || ''
                    }`}
                  >
                    {USER_STATUS_LABELS[detailUser.status] || detailUser.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#EAD8CC] space-y-1">
                <span className="text-[#7A6255] font-medium">Email</span>
                <p className="font-semibold text-[#3D2B1F] break-all">{detailUser.email}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAD8CC] space-y-1">
                <span className="text-[#7A6255] font-medium">Số điện thoại</span>
                <p className="font-semibold text-[#3D2B1F]">{detailUser.phone || 'Chưa cập nhật'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAD8CC] space-y-1">
                <span className="text-[#7A6255] font-medium">Giới tính</span>
                <p className="font-semibold text-[#3D2B1F]">{detailUser.gender || 'Chưa cập nhật'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#EAD8CC] space-y-1">
                <span className="text-[#7A6255] font-medium">Ngày sinh</span>
                <p className="font-semibold text-[#3D2B1F]">
                  {detailUser.dateOfBirth ? formatDate(detailUser.dateOfBirth) : 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {detailUser.address && (
              <div className="p-3 rounded-xl bg-white border border-[#EAD8CC] text-xs space-y-1">
                <span className="text-[#7A6255] font-medium">Địa chỉ</span>
                <p className="font-semibold text-[#3D2B1F]">{detailUser.address}</p>
              </div>
            )}

            {detailUser.hostProfile && (
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#EAD8CC] text-xs space-y-2">
                <p className="font-bold text-[#964824]">Hồ sơ Chủ xưởng (Host Profile)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#3D2B1F]">
                  <p>
                    <strong>Tên xưởng:</strong> {detailUser.hostProfile.workshopName || '—'}
                  </p>
                  <p>
                    <strong>Đại diện:</strong> {detailUser.hostProfile.representativeName || '—'}
                  </p>
                  <p className="col-span-2">
                    <strong>Mô tả:</strong> {detailUser.hostProfile.description || '—'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
