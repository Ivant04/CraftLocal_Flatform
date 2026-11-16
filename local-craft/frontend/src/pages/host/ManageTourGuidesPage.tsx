import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  UserPlus,
  Mail,
  Phone,
  Search,
  Trash2,
  Edit2,
  Eye,
  Copy,
  Check,
  Calendar,
  Users,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import tourGuideApi from '../../api/tourGuideApi';
import type { User, UserStatus } from '../../types/user.type';
import { USER_STATUS_LABELS, TIMESLOT_STATUS_LABELS } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/formatDate';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';

interface AssignedSlot {
  _id: string;
  workshopId?: {
    _id: string;
    title: string;
    locationLabel?: string;
  };
  startTime: string;
  endTime: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  date?: string;
  bookedSlots: number;
  totalSlots: number;
  status: string;
}

const ManageTourGuidesPage: React.FC = () => {
  const [tourGuides, setTourGuides] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');

  // Modal 1: Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Modal 2: Invite
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    phone: '',
  });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{
    message: string;
    tempPassword?: string;
    guideName?: string;
    email?: string;
  } | null>(null);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Modal 3: Edit
  const [editGuide, setEditGuide] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    status: 'ACTIVE' as UserStatus,
    newPassword: '',
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Modal 4: Detail
  const [detailGuide, setDetailGuide] = useState<User | null>(null);
  const [detailSlots, setDetailSlots] = useState<AssignedSlot[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick status toggling indicator
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await tourGuideApi.getByHost();
      const list = res.data?.data;
      setTourGuides(Array.isArray(list) ? list : []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không tải được danh sách hướng dẫn viên.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showBannerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // --- CREATE ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      setError('Vui lòng điền đầy đủ họ tên, email và mật khẩu.');
      return;
    }
    if (createForm.password.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên.');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      await tourGuideApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ fullName: '', email: '', phone: '', password: '' });
      showBannerSuccess('Tạo hướng dẫn viên mới thành công!');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể tạo hướng dẫn viên.');
    } finally {
      setIsCreating(false);
    }
  };

  // --- INVITE ---
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }
    setIsInviting(true);
    setError('');
    try {
      const res = await tourGuideApi.invite(inviteForm);
      const data = res.data?.data;
      setInviteResult({
        message: res.data?.message || 'Đã thêm hướng dẫn viên vào xưởng!',
        tempPassword: data?.tempPassword,
        guideName: data?.fullName || inviteForm.fullName || inviteForm.email,
        email: data?.email || inviteForm.email,
      });
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Mời hướng dẫn viên thất bại.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleCopyPassword = () => {
    if (!inviteResult?.tempPassword) return;
    navigator.clipboard.writeText(inviteResult.tempPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2500);
  };

  // --- EDIT ---
  const handleOpenEdit = (guide: User) => {
    setEditGuide(guide);
    setEditForm({
      fullName: guide.fullName || '',
      phone: guide.phone || '',
      status: guide.status || 'ACTIVE',
      newPassword: '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuide) return;
    setIsUpdating(true);
    setError('');
    try {
      const payload: any = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        status: editForm.status,
      };
      if (editForm.newPassword.trim()) {
        if (editForm.newPassword.trim().length < 6) {
          setError('Mật khẩu mới phải từ 6 ký tự trở lên.');
          setIsUpdating(false);
          return;
        }
        payload.password = editForm.newPassword.trim();
      }
      await tourGuideApi.update(editGuide._id, payload);
      setEditGuide(null);
      showBannerSuccess('Cập nhật thông tin hướng dẫn viên thành công!');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể cập nhật hướng dẫn viên.');
    } finally {
      setIsUpdating(false);
    }
  };

  // --- QUICK TOGGLE STATUS ---
  const handleToggleStatus = async (guide: User) => {
    const nextStatus = guide.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 'mở khóa' : 'tạm khóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} hướng dẫn viên "${guide.fullName}"?`)) return;

    setTogglingId(guide._id);
    try {
      await tourGuideApi.update(guide._id, { status: nextStatus });
      setTourGuides((prev) =>
        prev.map((g) => (g._id === guide._id ? { ...g, status: nextStatus } : g))
      );
      showBannerSuccess(`Đã ${actionLabel} hướng dẫn viên thành công.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || `Không thể ${actionLabel} hướng dẫn viên.`);
    } finally {
      setTogglingId(null);
    }
  };

  // --- DELETE / UNLINK ---
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError('');
    try {
      await tourGuideApi.delete(deleteTarget._id);
      setDeleteTarget(null);
      showBannerSuccess(`Đã gỡ hướng dẫn viên "${deleteTarget.fullName}" khỏi xưởng.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Không thể gỡ hướng dẫn viên.');
    } finally {
      setIsDeleting(false);
    }
  };

  // --- VIEW DETAIL ---
  const handleOpenDetail = async (guide: User) => {
    setDetailGuide(guide);
    setLoadingDetail(true);
    setDetailSlots([]);
    try {
      const res = await tourGuideApi.getDetail(guide._id);
      const data = res.data?.data;
      if (data?.timeslots && Array.isArray(data.timeslots)) {
        setDetailSlots(data.timeslots);
      }
    } catch (err: any) {
      // Non-blocking: guide info will still show
      console.warn('Cannot fetch guide timeslots', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // --- FILTERED DATA ---
  const filteredGuides = useMemo(() => {
    return tourGuides.filter((g) => {
      const matchSearch =
        !searchTerm.trim() ||
        g.fullName?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        g.email?.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        g.phone?.includes(searchTerm.trim());

      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && g.status === 'ACTIVE') ||
        (statusFilter === 'BLOCKED' && g.status === 'BLOCKED');

      return matchSearch && matchStatus;
    });
  }, [tourGuides, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const total = tourGuides.length;
    const active = tourGuides.filter((g) => g.status === 'ACTIVE').length;
    const blocked = tourGuides.filter((g) => g.status === 'BLOCKED').length;
    const totalAssigned = tourGuides.reduce((sum, g) => sum + (g.assignedSlotsCount || 0), 0);
    return { total, active, blocked, totalAssigned };
  }, [tourGuides]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-md text-deep-earth flex items-center gap-2">
            Quản lý Hướng dẫn viên
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Đội ngũ nghệ nhân và hướng dẫn viên đồng hành trực tiếp cùng xưởng của bạn
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setError('');
              setInviteResult(null);
              setInviteForm({ email: '', fullName: '', phone: '' });
              setShowInviteModal(true);
            }}
          >
            <UserPlus size={16} className="mr-1" /> Mời qua Email
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setError('');
              setCreateForm({ fullName: '', email: '', phone: '', password: '' });
              setShowCreateModal(true);
            }}
          >
            <Plus size={16} className="mr-1" /> Thêm mới HĐV
          </Button>
        </div>
      </div>

      {/* Alert Banners */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-start gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1">{successMsg}</div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-soft-clay p-4 shadow-sm">
          <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">Tổng Hướng dẫn viên</p>
          <p className="text-2xl font-bold text-deep-earth mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-soft-clay p-4 shadow-sm">
          <p className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Đang hoạt động</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-soft-clay p-4 shadow-sm">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Tạm khóa</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.blocked}</p>
        </div>
        <div className="bg-white rounded-xl border border-soft-clay p-4 shadow-sm">
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Tổng ca phân công</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-bold text-primary">{stats.totalAssigned}</span>
            <Link
              to="/host/assign-guide"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              Phân công <Calendar size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-soft-clay p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'BLOCKED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-deep-earth text-white'
                  : 'bg-soft-clay/40 text-on-surface-variant hover:bg-soft-clay'
              }`}
            >
              {s === 'ALL' ? 'Tất cả' : s === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-20 flex justify-center"><Loading /></div>
      ) : filteredGuides.length === 0 ? (
        <div className="bg-white rounded-xl border border-soft-clay p-12 text-center text-on-surface-variant">
          <Users size={36} className="mx-auto mb-3 opacity-40 text-deep-earth" />
          <p className="text-base font-semibold text-deep-earth mb-1">
            {tourGuides.length === 0 ? 'Chưa có hướng dẫn viên nào trong xưởng' : 'Không tìm thấy kết quả phù hợp'}
          </p>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-5">
            {tourGuides.length === 0
              ? 'Mời hoặc thêm hướng dẫn viên để phân công phụ trách các buổi trải nghiệm workshop làng nghề.'
              : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái.'}
          </p>
          {tourGuides.length === 0 && (
            <div className="flex justify-center gap-3">
              <Button size="sm" variant="outline" onClick={() => setShowInviteModal(true)}>
                <UserPlus size={16} className="mr-1" /> Mời qua Email
              </Button>
              <Button size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus size={16} className="mr-1" /> Thêm tài khoản HĐV
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-soft-clay overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-soft-clay bg-soft-clay/30 text-xs font-semibold text-deep-earth">
                  <th className="p-4 text-left">Hướng dẫn viên</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Số điện thoại</th>
                  <th className="p-4 text-center">Ca phụ trách</th>
                  <th className="p-4 text-left">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft-clay/50">
                {filteredGuides.map((g) => {
                  const initial = g.fullName?.charAt(0).toUpperCase() || 'H';
                  const isBlocked = g.status === 'BLOCKED';
                  const isToggling = togglingId === g._id;

                  return (
                    <tr key={g._id} className="hover:bg-soft-clay/10 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                            {initial}
                          </div>
                          <div>
                            <p className="font-semibold text-deep-earth">{g.fullName}</p>
                            <p className="text-xs text-on-surface-variant">
                              Tham gia {formatDate(g.createdAt) || 'Gần đây'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="p-4">
                        <a
                          href={`mailto:${g.email}`}
                          className="flex items-center gap-1.5 text-on-surface hover:text-primary transition-colors"
                          title="Gửi email"
                        >
                          <Mail size={14} className="text-on-surface-variant/70 shrink-0" />
                          <span>{g.email}</span>
                        </a>
                      </td>

                      {/* Phone */}
                      <td className="p-4">
                        {g.phone ? (
                          <a
                            href={`tel:${g.phone}`}
                            className="flex items-center gap-1.5 text-on-surface hover:text-primary transition-colors"
                          >
                            <Phone size={14} className="text-on-surface-variant/70 shrink-0" />
                            <span>{g.phone}</span>
                          </a>
                        ) : (
                          <span className="text-xs text-on-surface-variant/60 italic">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Assigned Slots Count */}
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            (g.assignedSlotsCount || 0) > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <Calendar size={11} /> {g.assignedSlotsCount || 0} ca
                        </span>
                      </td>

                      {/* Status + Toggle */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(g)}
                          disabled={isToggling}
                          title={isBlocked ? 'Nhấn để mở khóa' : 'Nhấn để tạm khóa'}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105 ${
                            isBlocked
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isBlocked ? 'bg-red-600' : 'bg-emerald-600'
                            }`}
                          />
                          {isToggling ? 'Đang cập nhật...' : USER_STATUS_LABELS[g.status] || g.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(g)}
                            className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-soft-clay/50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết & lịch trình"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(g)}
                            className="p-1.5 text-on-surface-variant hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(g)}
                            className="p-1.5 text-on-surface-variant hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Gỡ khỏi xưởng"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL 1: CREATE ================= */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm Hướng dẫn viên mới"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <p className="text-xs text-on-surface-variant -mt-2">
            Tạo tài khoản đăng nhập cho hướng dẫn viên của bạn để họ có thể nhận ca và kiểm tra vé khách tham gia.
          </p>
          <Input
            label="Họ và tên"
            value={createForm.fullName}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, fullName: e.target.value }))}
            placeholder="Ví dụ: Nguyễn Văn An"
            required
          />
          <Input
            label="Email đăng nhập"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
            placeholder="hdv@gmail.com"
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={createForm.phone}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, phone: e.target.value }))}
            placeholder="0901234567"
          />
          <Input
            label="Mật khẩu khởi tạo"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, password: e.target.value }))}
            placeholder="Tối thiểu 6 ký tự"
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" size="sm" isLoading={isCreating}>
              Tạo Hướng dẫn viên
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL 2: INVITE ================= */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => {
          setShowInviteModal(false);
          setInviteResult(null);
        }}
        title="Mời Hướng dẫn viên qua Email"
      >
        {!inviteResult ? (
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck size={16} className="shrink-0 mt-0.5 text-amber-700" />
              <span>
                Nhập email của Hướng dẫn viên. Nếu người này đã có tài khoản trên CraftLocal, họ sẽ được liên kết ngay vào xưởng của bạn. Nếu chưa, hệ thống sẽ tự động tạo tài khoản kèm mật khẩu tạm thời.
              </span>
            </div>
            <Input
              label="Email Hướng dẫn viên"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="huongdanvien@gmail.com"
              required
            />
            <Input
              label="Họ và tên (Tùy chọn)"
              value={inviteForm.fullName}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, fullName: e.target.value }))}
              placeholder="Để trống nếu người dùng đã có tài khoản"
            />
            <Input
              label="Số điện thoại (Tùy chọn)"
              type="tel"
              value={inviteForm.phone}
              onChange={(e) => setInviteForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="090..."
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowInviteModal(false)}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" isLoading={isInviting}>
                Gửi lời mời / Liên kết
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-center py-2 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <h4 className="font-bold text-deep-earth text-lg">Mời thành công!</h4>
              <p className="text-xs text-on-surface-variant mt-1">{inviteResult.message}</p>
            </div>

            {inviteResult.tempPassword && (
              <div className="bg-surface border border-outline-variant rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-semibold text-deep-earth flex items-center gap-1.5">
                  <Lock size={14} className="text-primary" /> Thông tin đăng nhập cho Hướng dẫn viên:
                </p>
                <div className="text-xs text-on-surface-variant space-y-1">
                  <p><strong>Email:</strong> {inviteResult.email}</p>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-soft-clay">
                    <span>
                      <strong>Mật khẩu tạm:</strong>{' '}
                      <span className="font-mono text-primary font-bold text-sm">
                        {inviteResult.tempPassword}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                    >
                      {copiedPassword ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-600">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-amber-700 italic">
                  * Vui lòng gửi email hoặc sao chép thông tin trên để gửi cho hướng dẫn viên của bạn.
                </p>
              </div>
            )}

            <Button
              size="sm"
              fullWidth
              onClick={() => {
                setShowInviteModal(false);
                setInviteResult(null);
              }}
            >
              Hoàn tất
            </Button>
          </div>
        )}
      </Modal>

      {/* ================= MODAL 3: EDIT ================= */}
      <Modal
        isOpen={Boolean(editGuide)}
        onClose={() => setEditGuide(null)}
        title="Chỉnh sửa thông tin Hướng dẫn viên"
      >
        {editGuide && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-on-surface-variant block mb-1">Email</label>
              <input
                type="text"
                disabled
                value={editGuide.email}
                className="w-full px-3 py-2 text-sm bg-gray-100 border border-outline-variant rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
            <Input
              label="Họ và tên"
              value={editForm.fullName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
            <Input
              label="Số điện thoại"
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="090..."
            />
            <div>
              <label className="text-sm font-medium block mb-1.5">Trạng thái hoạt động</label>
              <select
                value={editForm.status}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, status: e.target.value as UserStatus }))
                }
                className="w-full px-3 py-2.5 border border-outline-variant rounded-lg text-sm bg-surface"
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="BLOCKED">Tạm khóa tài khoản</option>
              </select>
            </div>
            <Input
              label="Đặt lại mật khẩu mới (Tùy chọn)"
              type="password"
              value={editForm.newPassword}
              onChange={(e) => setEditForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Để trống nếu không muốn đổi"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditGuide(null)}
              >
                Hủy
              </Button>
              <Button type="submit" size="sm" isLoading={isUpdating}>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ================= MODAL 4: DETAIL & SCHEDULE ================= */}
      <Modal
        isOpen={Boolean(detailGuide)}
        onClose={() => setDetailGuide(null)}
        title="Hồ sơ & Lịch phân công"
        size="lg"
      >
        {detailGuide && (
          <div className="space-y-5">
            {/* Guide Card */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-soft-clay/30 border border-soft-clay">
              <div className="w-14 h-14 rounded-full bg-primary text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                {detailGuide.fullName?.charAt(0).toUpperCase() || 'H'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-deep-earth text-lg truncate">
                    {detailGuide.fullName}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      detailGuide.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {USER_STATUS_LABELS[detailGuide.status] || detailGuide.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant mt-1">
                  <span className="flex items-center gap-1">
                    <Mail size={13} /> {detailGuide.email}
                  </span>
                  {detailGuide.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={13} /> {detailGuide.phone}
                    </span>
                  )}
                  <span>Tham gia: {formatDate(detailGuide.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Assigned Timeslots Table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="font-semibold text-deep-earth text-sm flex items-center gap-1.5">
                  <Calendar size={15} className="text-primary" />
                  Danh sách ca workshop được phân công ({detailSlots.length})
                </h4>
                <Link
                  to="/host/assign-guide"
                  className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                >
                  Phân công thêm ca <Plus size={12} />
                </Link>
              </div>

              {loadingDetail ? (
                <div className="py-8 flex justify-center"><Loading /></div>
              ) : detailSlots.length === 0 ? (
                <div className="p-6 bg-surface border border-outline-variant/60 rounded-xl text-center text-on-surface-variant text-xs">
                  Hướng dẫn viên này chưa được phân công phụ trách ca workshop nào.
                </div>
              ) : (
                <div className="border border-soft-clay rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-soft-clay/30 border-b border-soft-clay font-medium text-left">
                        <th className="p-2.5">Workshop</th>
                        <th className="p-2.5">Ngày</th>
                        <th className="p-2.5">Giờ</th>
                        <th className="p-2.5 text-center">Khách</th>
                        <th className="p-2.5 text-right">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-soft-clay/40">
                      {detailSlots.map((ts) => (
                        <tr key={ts._id} className="hover:bg-soft-clay/10">
                          <td className="p-2.5 font-medium text-deep-earth truncate max-w-[160px]">
                            {ts.workshopId?.title || 'Workshop'}
                          </td>
                          <td className="p-2.5">{ts.date || formatDate(ts.startTime)}</td>
                          <td className="p-2.5 font-mono">
                            {ts.startTimeLabel && ts.endTimeLabel
                              ? `${ts.startTimeLabel} - ${ts.endTimeLabel}`
                              : `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`}
                          </td>
                          <td className="p-2.5 text-center">
                            {ts.bookedSlots}/{ts.totalSlots}
                          </td>
                          <td className="p-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                              {TIMESLOT_STATUS_LABELS[ts.status] || ts.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setDetailGuide(null)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ================= MODAL 5: DELETE CONFIRM ================= */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Xác nhận gỡ Hướng dẫn viên"
        size="sm"
      >
        {deleteTarget && (
          <div className="space-y-4">
            <p className="text-sm text-on-surface">
              Bạn có chắc chắn muốn gỡ hướng dẫn viên{' '}
              <strong className="text-deep-earth">"{deleteTarget.fullName}"</strong> (
              <span className="text-on-surface-variant text-xs">{deleteTarget.email}</span>) khỏi danh sách xưởng?
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              Lưu ý: Nếu người này đang phụ trách các ca workshop sắp diễn ra, các ca đó sẽ được tự động chuyển về trạng thái <strong>Chưa gán</strong> để bạn có thể gán người khác.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                Gỡ Hướng dẫn viên
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageTourGuidesPage;
