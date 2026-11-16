import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  RotateCcw,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Loader2,
  Trash2,
  Store,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import authApi from '../../api/authApi';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import WorkshopOwnerRegistrationTab from '../../components/profile/WorkshopOwnerRegistrationTab';

interface ProfileFormState {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  avatar: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  general?: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  HOST: 'Chủ xưởng nghệ nhân',
  TOUR_GUIDE: 'Hướng dẫn viên',
  TOURIST: 'Du khách trải nghiệm',
};

interface ProfilePageProps {
  initialTab?: 'profile' | 'host';
}

const ProfilePage: React.FC<ProfilePageProps> = ({ initialTab }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const tabQuery = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'host'>(
    initialTab === 'host' || tabQuery === 'host' ? 'host' : 'profile'
  );

  const [initialData, setInitialData] = useState<ProfileFormState>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'OTHER',
    address: '',
    avatar: '',
  });

  const [formData, setFormData] = useState<ProfileFormState>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'OTHER',
    address: '',
    avatar: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync tab with URL query parameter
  const handleTabChange = (tab: 'profile' | 'host') => {
    setActiveTab(tab);
    setSearchParams(tab === 'host' ? { tab: 'host' } : {});
  };

  // Fetch full user profile from backend on mount
  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await authApi.getProfile();
        const userData = (res.data as any)?.data || res.data;

        if (userData && isMounted) {
          let dobString = '';
          if (userData.dateOfBirth) {
            const dob = new Date(userData.dateOfBirth);
            if (!isNaN(dob.getTime())) {
              dobString = dob.toISOString().split('T')[0];
            }
          }

          const resolvedAddress =
            userData.address ||
            userData.defaultAddress?.fullAddress ||
            userData.defaultAddress?.addressLine ||
            '';

          const state: ProfileFormState = {
            fullName: userData.fullName || '',
            email: userData.email || '',
            phone: userData.phone || '',
            dateOfBirth: dobString,
            gender: userData.gender || 'OTHER',
            address: resolvedAddress,
            avatar: userData.avatar || '',
          };

          setInitialData(state);
          setFormData(state);
          updateUser(userData);
        }
      } catch (err: any) {
        if (user && isMounted) {
          const state: ProfileFormState = {
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phone || '',
            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
            gender: user.gender || 'OTHER',
            address: user.address || '',
            avatar: user.avatar || '',
          };
          setInitialData(state);
          setFormData(state);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage('');
    if (successMessage) setSuccessMessage('');
  };

  // Handle avatar upload via Cloudinary
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Kích thước ảnh tối đa cho phép là 5MB.');
      return;
    }

    try {
      setUploadingAvatar(true);
      setErrorMessage('');
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await authApi.uploadAvatar(uploadData);
      const newAvatarUrl = (res.data as any)?.data?.url || (res.data as any)?.url;

      if (newAvatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
        setSuccessMessage('Tải ảnh đại diện lên thành công! Hãy nhấn "Lưu thay đổi" để hoàn tất.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Không thể tải ảnh đại diện lên máy chủ. Vui lòng thử lại.'
      );
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống.';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    if (formData.phone.trim()) {
      const phoneClean = formData.phone.trim().replace(/\s+/g, '');
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phoneClean)) {
        newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam (ví dụ: 0912345678).';
      }
    }

    if (formData.dateOfBirth) {
      const selectedDate = new Date(formData.dateOfBirth);
      const today = new Date();
      if (isNaN(selectedDate.getTime())) {
        newErrors.dateOfBirth = 'Ngày sinh không hợp lệ.';
      } else if (selectedDate > today) {
        newErrors.dateOfBirth = 'Ngày sinh không thể lớn hơn ngày hiện tại.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validateForm()) {
      setErrorMessage('Vui lòng kiểm tra lại các trường thông tin bị lỗi bên dưới.');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        avatar: formData.avatar,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender,
        address: formData.address.trim(),
      };

      const res = await authApi.updateProfile(payload);
      const updatedUser = (res.data as any)?.data || res.data;

      if (updatedUser) {
        updateUser(updatedUser);
      } else {
        updateUser({
          fullName: payload.fullName,
          phone: payload.phone,
          avatar: payload.avatar,
          dateOfBirth: payload.dateOfBirth,
          gender: payload.gender,
          address: payload.address,
        });
      }

      setInitialData({ ...formData });
      setSuccessMessage('Cập nhật thông tin cá nhân thành công!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại sau.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Handler
  const handleCancel = () => {
    setFormData({ ...initialData });
    setErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loading />
        <p className="mt-4 text-sm font-medium text-on-surface-variant">
          Đang tải thông tin hồ sơ của bạn...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-warm py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs text-on-surface-variant">
          <Link
            to="/"
            className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={14} /> Trang chủ
          </Link>
          <span>/</span>
          <span className="font-semibold text-deep-earth">Hồ sơ cá nhân</span>
        </div>

        {/* Page Title & Intro */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>Tài khoản người dùng</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-deep-earth">
              {activeTab === 'profile' ? 'Chỉnh sửa thông tin cá nhân' : 'Đăng ký trở thành Chủ xưởng'}
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1.5">
              {activeTab === 'profile'
                ? 'Cập nhật thông tin liên hệ và hình ảnh đại diện để trải nghiệm CraftLocal trọn vẹn hơn'
                : 'Đăng ký thông tin xưởng sản xuất để trở thành đối tác nghệ nhân cùng CraftLocal'}
            </p>
          </div>

          {user?.role && (
            <div className="flex items-center gap-2 self-start sm:self-center bg-white px-3.5 py-2 rounded-xl border border-soft-clay shadow-xs">
              <ShieldCheck size={18} className="text-primary" />
              <div className="text-left">
                <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                  Vai trò
                </p>
                <p className="text-xs font-bold text-deep-earth">
                  {ROLE_LABELS[user.role] || user.role}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 mb-8 border-b border-soft-clay pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer select-none shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#964824] text-white shadow-sm'
                : 'bg-white text-on-surface-variant hover:text-deep-earth hover:bg-[#FAF7F2] border border-soft-clay'
            }`}
          >
            <UserIcon size={16} />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('host')}
            className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer select-none shrink-0 ${
              activeTab === 'host'
                ? 'bg-[#964824] text-white shadow-sm'
                : 'bg-white text-on-surface-variant hover:text-deep-earth hover:bg-[#FAF7F2] border border-soft-clay'
            }`}
          >
            <Store size={16} />
            <span>Đăng ký Chủ xưởng</span>
            {user?.role === 'HOST' ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                Chủ xưởng
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                Đối tác
              </span>
            )}
          </button>
        </div>

        {/* TAB 2: ĐĂNG KÝ CHỦ XƯỞNG */}
        {activeTab === 'host' ? (
          <WorkshopOwnerRegistrationTab user={user} />
        ) : (
          /* TAB 1: CHỈNH SỬA THÔNG TIN CÁ NHÂN */
          <>
            {/* Success Alert Banner */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-fadeIn shadow-xs">
                <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1 text-sm font-medium">{successMessage}</div>
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 animate-fadeIn shadow-xs">
                <AlertCircle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                <div className="flex-1 text-sm font-medium">{errorMessage}</div>
                <button
                  onClick={() => setErrorMessage('')}
                  className="text-rose-600 hover:text-rose-900 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* Main Profile Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Avatar & Account Summary */}
                <div className="md:col-span-1 space-y-6">
                  {/* Avatar Card */}
                  <div className="bg-white rounded-2xl border border-soft-clay p-6 shadow-sm text-center">
                    <h3 className="text-sm font-bold text-deep-earth uppercase tracking-wider mb-4">
                      Ảnh đại diện
                    </h3>

                    <div className="relative w-32 h-32 mx-auto mb-4 group">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#FAF7F2] to-[#EAD8CC] border-4 border-white shadow-md flex items-center justify-center">
                        {formData.avatar ? (
                          <img
                            src={formData.avatar}
                            alt={formData.fullName || 'User avatar'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-extrabold text-primary select-none">
                            {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>

                      {uploadingAvatar && (
                        <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center text-white text-xs font-medium backdrop-blur-xs">
                          <Loader2 size={24} className="animate-spin mb-1 text-accent" />
                          <span>Đang tải...</span>
                        </div>
                      )}

                      {!uploadingAvatar && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary hover:bg-[#7A3518] text-white flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-105"
                          title="Chọn ảnh mới"
                        >
                          <Camera size={16} />
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />

                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={uploadingAvatar}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={14} className="mr-1.5" /> Thay đổi ảnh
                      </Button>

                      {formData.avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center justify-center gap-1 py-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} /> Gỡ ảnh đại diện
                        </button>
                      )}
                    </div>

                    <p className="text-[11px] text-on-surface-variant mt-3 leading-relaxed">
                      Định dạng hỗ trợ: JPG, PNG, WEBP.
                      <br />
                      Kích thước tối đa 5MB.
                    </p>
                  </div>

                  {/* Become Host Banner (for Tourist) */}
                  {user?.role === 'TOURIST' && (
                    <div
                      onClick={() => handleTabChange('host')}
                      className="bg-gradient-to-br from-[#964824] to-[#7A3518] rounded-2xl p-5 text-white shadow-sm cursor-pointer hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Store size={18} className="text-[#E9C176]" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#E9C176]">
                          Cơ hội đối tác
                        </span>
                      </div>
                      <h4 className="font-bold text-sm">Đăng ký trở thành Chủ xưởng</h4>
                      <p className="text-[11px] text-white/85 mt-1 leading-relaxed">
                        Mở rộng kinh doanh workshop và sản phẩm thủ công truyền thống của bạn cùng CraftLocal.
                      </p>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#E9C176] mt-3 group-hover:translate-x-1 transition-transform">
                        <span>Đăng ký ngay</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  )}

                  {/* Account Quick Info Card */}
                  <div className="bg-white rounded-2xl border border-soft-clay p-5 shadow-sm space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-soft-clay/60">
                      <span className="text-on-surface-variant">Trạng thái</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Hoạt động
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-soft-clay/60">
                      <span className="text-on-surface-variant">Vai trò</span>
                      <span className="font-semibold text-deep-earth">
                        {ROLE_LABELS[user?.role || 'TOURIST'] || user?.role}
                      </span>
                    </div>
                    {user?.createdAt && (
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-on-surface-variant">Tham gia từ</span>
                        <span className="font-medium text-deep-earth">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Detailed Edit Information */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-2xl border border-soft-clay p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="border-b border-soft-clay pb-4">
                      <h3 className="text-base font-bold text-deep-earth">
                        Thông tin tài khoản & Liên hệ
                      </h3>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Các thông tin này dùng để xác nhận đơn hàng, gửi vé điện tử và hỗ trợ bạn khi tham gia workshop.
                      </p>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Họ và tên */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="fullName"
                          className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2"
                        >
                          Họ và tên <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                            <UserIcon size={16} />
                          </div>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Nhập đầy đủ họ và tên của bạn"
                            className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth placeholder:text-on-surface-variant/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                              errors.fullName ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                            }`}
                          />
                        </div>
                        {errors.fullName && (
                          <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle size={13} /> {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email (Disabled / Read-only) */}
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-2">
                          <label
                            htmlFor="email"
                            className="block text-xs font-bold text-deep-earth uppercase tracking-wider"
                          >
                            Địa chỉ Email
                          </label>
                          <span className="text-[11px] text-on-surface-variant/80 font-medium flex items-center gap-1 bg-soft-clay/40 px-2 py-0.5 rounded-md">
                            <Lock size={11} /> Không thể thay đổi
                          </span>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant/70">
                            <Mail size={16} />
                          </div>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            disabled
                            readOnly
                            className="w-full pl-10 pr-10 py-2.5 bg-neutral-100 border border-neutral-200 rounded-xl text-sm font-medium text-neutral-500 cursor-not-allowed select-none"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Lock size={15} />
                          </div>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1.5">
                          Email được sử dụng làm tên đăng nhập và nhận thông báo xác nhận giao dịch.
                        </p>
                      </div>

                      {/* Số điện thoại */}
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2"
                        >
                          Số điện thoại
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                            <Phone size={16} />
                          </div>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ví dụ: 0912345678"
                            className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth placeholder:text-on-surface-variant/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                              errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle size={13} /> {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* Ngày sinh */}
                      <div>
                        <label
                          htmlFor="dateOfBirth"
                          className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2"
                        >
                          Ngày sinh
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                            <Calendar size={16} />
                          </div>
                          <input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            max={new Date().toISOString().split('T')[0]}
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                              errors.dateOfBirth ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                            }`}
                          />
                        </div>
                        {errors.dateOfBirth && (
                          <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                            <AlertCircle size={13} /> {errors.dateOfBirth}
                          </p>
                        )}
                      </div>

                      {/* Giới tính */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
                          Giới tính
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'MALE', label: 'Nam' },
                            { id: 'FEMALE', label: 'Nữ' },
                            { id: 'OTHER', label: 'Khác' },
                          ].map((item) => (
                            <label
                              key={item.id}
                              className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer font-semibold text-xs md:text-sm transition-all select-none ${
                                formData.gender === item.id
                                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                                  : 'border-soft-clay bg-[#FAF7F2] text-on-surface-variant hover:bg-white hover:border-outline-variant'
                              }`}
                            >
                              <input
                                type="radio"
                                name="gender"
                                value={item.id}
                                checked={formData.gender === item.id}
                                onChange={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    gender: item.id as 'MALE' | 'FEMALE' | 'OTHER',
                                  }))
                                }
                                className="sr-only"
                              />
                              <span>{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Địa chỉ */}
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="address"
                          className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2"
                        >
                          Địa chỉ liên hệ
                        </label>
                        <div className="relative">
                          <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-on-surface-variant">
                            <MapPin size={16} />
                          </div>
                          <textarea
                            id="address"
                            name="address"
                            rows={3}
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-soft-clay rounded-xl text-sm font-medium text-deep-earth placeholder:text-on-surface-variant/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[80px]"
                          />
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-1.5">
                          Địa chỉ nhận hàng mặc định khi đặt mua sản phẩm thủ công từ làng nghề.
                        </p>
                      </div>
                    </div>

                    {/* Form Action Buttons */}
                    <div className="pt-6 border-t border-soft-clay flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="md"
                        className="w-full sm:w-auto"
                        onClick={handleCancel}
                        disabled={submitting || !hasChanges}
                      >
                        <RotateCcw size={15} className="mr-1.5" /> Hủy thay đổi
                      </Button>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        className="w-full sm:w-auto shadow-md"
                        isLoading={submitting}
                      >
                        <Save size={16} className="mr-1.5" /> Lưu thay đổi
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
