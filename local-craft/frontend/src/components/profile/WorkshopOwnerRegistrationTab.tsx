import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Upload,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  ArrowRight,
  Store,
  ExternalLink,
} from 'lucide-react';
import applicationApi from '../../api/applicationApi';
import type { WorkshopOwnerApplication, ApplicationStatus } from '../../types/application.type';
import type { User as UserType } from '../../types/user.type';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

interface Props {
  user: UserType | null;
}

interface FormState {
  workshopName: string;
  ownerName: string;
  phone: string;
  email: string;
  workshopAddress: string;
  description: string;
  workshopImages: string[];
  idCardFront: string;
  idCardBack: string;
  businessLicense: string;
}

interface FormErrors {
  workshopName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  workshopAddress?: string;
  description?: string;
  general?: string;
}

const WorkshopOwnerRegistrationTab: React.FC<Props> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

  const [application, setApplication] = useState<WorkshopOwnerApplication | null>(null);
  const [appStatus, setAppStatus] = useState<'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NONE');
  const [isHost, setIsHost] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    workshopName: '',
    ownerName: '',
    phone: '',
    email: '',
    workshopAddress: '',
    description: '',
    workshopImages: [],
    idCardFront: '',
    idCardBack: '',
    businessLicense: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const workshopImagesInputRef = useRef<HTMLInputElement>(null);
  const idFrontInputRef = useRef<HTMLInputElement>(null);
  const idBackInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // Fetch current user application status
  const fetchMyApplication = async () => {
    try {
      setLoading(true);
      const res = await applicationApi.getMyApplication();
      const data = res.data?.data;

      if (data) {
        setAppStatus(data.status);
        setIsHost(Boolean(data.isHost || user?.role === 'HOST'));
        if (data.application) {
          setApplication(data.application);
          setFormData({
            workshopName: data.application.workshopName || '',
            ownerName: data.application.ownerName || '',
            phone: data.application.phone || '',
            email: data.application.email || '',
            workshopAddress: data.application.workshopAddress || '',
            description: data.application.description || '',
            workshopImages: data.application.workshopImages || [],
            idCardFront: data.application.idCardFront || '',
            idCardBack: data.application.idCardBack || '',
            businessLicense: data.application.businessLicense || '',
          });
        } else if (user) {
          // Pre-fill user profile info for fresh form
          setFormData((prev) => ({
            ...prev,
            ownerName: user.fullName || '',
            phone: user.phone || '',
            email: user.email || '',
            workshopAddress: user.address || '',
          }));
        }
      }
    } catch (err: any) {
      console.error('[Application] Error fetching application:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplication();
  }, [user]);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage('');
  };

  // Upload multiple workshop images
  const handleWorkshopImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingState((prev) => ({ ...prev, workshopImages: true }));
    setErrorMessage('');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 5 * 1024 * 1024) {
          setErrorMessage(`Ảnh "${file.name}" vượt quá dung lượng cho phép (tối đa 5MB).`);
          continue;
        }
        const url = await applicationApi.uploadImage(file);
        if (url) uploadedUrls.push(url);
      }

      setFormData((prev) => ({
        ...prev,
        workshopImages: [...prev.workshopImages, ...uploadedUrls],
      }));
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Lỗi khi tải ảnh xưởng lên máy chủ.');
    } finally {
      setUploadingState((prev) => ({ ...prev, workshopImages: false }));
      if (workshopImagesInputRef.current) workshopImagesInputRef.current.value = '';
    }
  };

  const handleRemoveWorkshopImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      workshopImages: prev.workshopImages.filter((_, i) => i !== index),
    }));
  };

  // Upload single document (CCCD, Giấy phép)
  const handleSingleDocUpload = async (
    field: 'idCardFront' | 'idCardBack' | 'businessLicense',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Kích thước file tài liệu tối đa là 5MB.');
      return;
    }

    setUploadingState((prev) => ({ ...prev, [field]: true }));
    setErrorMessage('');

    try {
      const url = await applicationApi.uploadImage(file);
      if (url) {
        setFormData((prev) => ({ ...prev, [field]: url }));
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể tải ảnh tài liệu lên.');
    } finally {
      setUploadingState((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.workshopName.trim()) {
      newErrors.workshopName = 'Vui lòng nhập tên xưởng thủ công.';
    } else if (formData.workshopName.trim().length < 3) {
      newErrors.workshopName = 'Tên xưởng phải có ít nhất 3 ký tự.';
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'Vui lòng nhập họ tên người đại diện.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại liên hệ.';
    } else {
      const phoneClean = formData.phone.trim().replace(/\s+/g, '');
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(phoneClean)) {
        newErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam.';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email liên hệ.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Email không đúng định dạng.';
    }

    if (!formData.workshopAddress.trim()) {
      newErrors.workshopAddress = 'Vui lòng nhập địa chỉ cụ thể của xưởng sản xuất.';
    } else if (formData.workshopAddress.trim().length < 5) {
      newErrors.workshopAddress = 'Địa chỉ xưởng quá ngắn (tối thiểu 5 ký tự).';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng mô tả về xưởng và quy trình sản xuất thủ công.';
    } else if (formData.description.trim().length < 15) {
      newErrors.description = 'Mô tả cần chi tiết hơn (tối thiểu 15 ký tự).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!validate()) {
      setErrorMessage('Vui lòng hoàn thiện các trường thông tin còn thiếu bên dưới.');
      return;
    }

    try {
      setSubmitting(true);
      await applicationApi.applyWorkshopOwner(formData);
      setSuccessMessage(
        appStatus === 'REJECTED'
          ? 'Cập nhật và gửi lại hồ sơ thành công! Ban quản trị sẽ tiến hành xét duyệt lại.'
          : 'Gửi hồ sơ đăng ký Chủ xưởng thành công! Ban quản trị CraftLocal sẽ liên hệ xét duyệt sớm nhất.'
      );
      // Refresh status
      await fetchMyApplication();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Lỗi khi gửi hồ sơ đăng ký. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-soft-clay p-12 text-center">
        <Loading />
        <p className="mt-3 text-sm text-on-surface-variant">Đang kiểm tra trạng thái hồ sơ của bạn...</p>
      </div>
    );
  }

  // CASE 1: Người dùng ĐÃ LÀ CHỦ XƯỞNG (HOST) hoặc APPROVED
  if (isHost || appStatus === 'APPROVED') {
    return (
      <div className="bg-white rounded-2xl border border-soft-clay p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Store size={36} />
        </div>

        <div className="text-center max-w-lg mx-auto">
          <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Đã là Chủ xưởng nghệ nhân
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-headline text-deep-earth">
            {application?.workshopName || user?.hostProfile?.workshopName || 'Xưởng thủ công của bạn'}
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
            Tài khoản của bạn đã được xác thực vai trò Chủ xưởng. Bạn có toàn quyền đăng tải workshop trải nghiệm, mở bán tác phẩm thủ công và quản lý đơn đặt chỗ.
          </p>
        </div>

        {/* Quick details */}
        <div className="bg-[#FAF7F2] rounded-xl p-4 border border-soft-clay text-xs space-y-2 max-w-lg mx-auto">
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Người đại diện:</span>
            <span className="font-semibold text-deep-earth">
              {application?.ownerName || user?.hostProfile?.ownerName || user?.fullName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Địa chỉ xưởng:</span>
            <span className="font-semibold text-deep-earth text-right max-w-[280px] truncate">
              {application?.workshopAddress || user?.hostProfile?.businessAddress?.fullAddress || 'Đang cập nhật'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-on-surface-variant">Trạng thái quyền:</span>
            <span className="font-bold text-emerald-600">ĐÃ KÍCH HOẠT (HOST)</span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/host/dashboard" className="w-full sm:w-auto">
            <Button size="md" className="w-full flex items-center justify-center gap-2">
              <Store size={16} /> Vào Bảng điều khiển Chủ xưởng <ArrowRight size={15} />
            </Button>
          </Link>
          <Link to="/host/workshops" className="w-full sm:w-auto">
            <Button variant="outline" size="md" className="w-full">
              Quản lý Workshop
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // CASE 2: HỒ SƠ ĐANG CHỜ DUYỆT (PENDING)
  if (appStatus === 'PENDING' && application) {
    return (
      <div className="bg-white rounded-2xl border border-soft-clay p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
        {/* Pending Notice Banner */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock size={24} className="animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold uppercase">
                Trạng thái: Chờ xét duyệt
              </span>
              <span className="text-xs text-amber-800">
                Gửi ngày {new Date(application.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <h3 className="text-base font-bold text-amber-900">
              Hồ sơ đăng ký của bạn đang được Ban quản trị xem xét
            </h3>
            <p className="text-xs text-amber-800/90 leading-relaxed">
              Cảm ơn bạn đã nộp hồ sơ đăng ký trở thành Chủ xưởng nghệ nhân. Đội ngũ kiểm duyệt của CraftLocal đang đối soát thông tin xưởng và giấy tờ. Kết quả sẽ được gửi tự động qua email <strong>{application.email}</strong>.
            </p>
            <p className="text-[11px] text-amber-700 font-semibold pt-1">
              ⚠️ Trong lúc hồ sơ đang chờ xét duyệt, bạn không thể gửi thêm hồ sơ mới.
            </p>
          </div>
        </div>

        {/* Submitted application preview */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-deep-earth uppercase tracking-wider border-b border-soft-clay pb-2">
            Thông tin hồ sơ đã nộp
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-soft-clay">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Tên xưởng thủ công</span>
              <p className="font-bold text-sm text-deep-earth mt-0.5">{application.workshopName}</p>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-soft-clay">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Người đại diện</span>
              <p className="font-semibold text-deep-earth mt-0.5">{application.ownerName}</p>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-soft-clay">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Số điện thoại</span>
              <p className="font-semibold text-deep-earth mt-0.5 font-mono">{application.phone}</p>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-soft-clay">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Email liên hệ</span>
              <p className="font-semibold text-deep-earth mt-0.5">{application.email}</p>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-soft-clay sm:col-span-2">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Địa chỉ xưởng sản xuất</span>
              <p className="font-medium text-deep-earth mt-0.5">{application.workshopAddress}</p>
            </div>

            <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-soft-clay sm:col-span-2">
              <span className="text-[10px] text-on-surface-variant uppercase font-bold">Mô tả về xưởng</span>
              <p className="text-deep-earth mt-0.5 whitespace-pre-wrap leading-relaxed">{application.description}</p>
            </div>
          </div>

          {/* Workshop images preview */}
          {application.workshopImages && application.workshopImages.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-deep-earth uppercase tracking-wider">
                Hình ảnh xưởng ({application.workshopImages.length})
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {application.workshopImages.map((imgUrl, idx) => (
                  <a
                    key={idx}
                    href={imgUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-video rounded-xl overflow-hidden border border-soft-clay block shadow-xs hover:opacity-90"
                  >
                    <img src={imgUrl} alt={`Ảnh xưởng ${idx + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // CASE 3: CHƯA NỘP HỒ SƠ (NONE) HOẶC BỊ TỪ CHỐI (REJECTED - ĐƯỢC PHÉP CHỈNH SỬA GỬI LẠI)
  return (
    <div className="bg-white rounded-2xl border border-soft-clay p-6 sm:p-8 shadow-sm space-y-6">
      {/* Intro Header */}
      <div className="border-b border-soft-clay pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Hợp tác đối tác</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold font-headline text-deep-earth">
          Đăng ký trở thành Chủ xưởng nghệ nhân
        </h3>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
          Tham gia mạng lưới gìn giữ di sản và phát triển làng nghề thủ công truyền thống cùng CraftLocal
        </p>
      </div>

      {/* REJECTED ALERT BANNER WITH ADMIN'S REASON */}
      {appStatus === 'REJECTED' && application && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
            <XCircle size={18} />
            <span>Hồ sơ đăng ký trước đó chưa được phê duyệt</span>
          </div>

          <div className="p-3.5 bg-white rounded-xl border border-rose-200 space-y-1">
            <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Lý do từ chối từ Ban quản trị:
            </p>
            <p className="text-sm text-rose-900 font-medium">
              {application.rejectionReason || 'Hồ sơ chưa đạt tiêu chuẩn yêu cầu xác minh.'}
            </p>
            {application.reviewedAt && (
              <p className="text-[11px] text-rose-600 pt-1">
                Thời gian xét duyệt: {new Date(application.reviewedAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          <p className="text-xs text-rose-800/90 leading-relaxed">
            👉 Bạn hãy cập nhật lại các thông tin hoặc tải lại ảnh giấy tờ/xưởng đạt yêu cầu ở form bên dưới, sau đó nhấn <strong>"Cập nhật và gửi lại hồ sơ"</strong> để Ban quản trị xét duyệt lại.
          </p>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center gap-2 shadow-xs">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Tên xưởng */}
          <div className="sm:col-span-2">
            <label htmlFor="workshopName" className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
              Tên xưởng thủ công / Cơ sở làng nghề <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                <Building2 size={16} />
              </div>
              <input
                id="workshopName"
                name="workshopName"
                type="text"
                value={formData.workshopName}
                onChange={handleChange}
                placeholder="Ví dụ: Xưởng Gốm Thủ Công Mộc An"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.workshopName ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                }`}
              />
            </div>
            {errors.workshopName && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.workshopName}</p>
            )}
          </div>

          {/* Người đại diện */}
          <div>
            <label htmlFor="ownerName" className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
              Họ tên người đại diện / Nghệ nhân <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                <User size={16} />
              </div>
              <input
                id="ownerName"
                name="ownerName"
                type="text"
                value={formData.ownerName}
                onChange={handleChange}
                placeholder="Ví dụ: Nguyễn Văn An"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.ownerName ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                }`}
              />
            </div>
            {errors.ownerName && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.ownerName}</p>
            )}
          </div>

          {/* Số điện thoại */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
              Số điện thoại liên hệ <span className="text-rose-500">*</span>
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
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.phone ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="sm:col-span-2">
            <label htmlFor="appEmail" className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
              Email nhận thông báo kết quả xét duyệt <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                <Mail size={16} />
              </div>
              <input
                id="appEmail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.email ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Địa chỉ xưởng */}
          <div className="sm:col-span-2">
            <label htmlFor="workshopAddress" className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
              Địa chỉ xưởng sản xuất / Làng nghề <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-on-surface-variant">
                <MapPin size={16} />
              </div>
              <input
                id="workshopAddress"
                name="workshopAddress"
                type="text"
                value={formData.workshopAddress}
                onChange={handleChange}
                placeholder="Số nhà, đường, thôn/xã/phường, huyện/thành phố, tỉnh..."
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                  errors.workshopAddress ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                }`}
              />
            </div>
            {errors.workshopAddress && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.workshopAddress}</p>
            )}
          </div>

          {/* Mô tả về xưởng */}
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-xs font-bold text-deep-earth uppercase tracking-wider mb-2">
              Giới thiệu về xưởng và quy trình sản xuất thủ công <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-3.5 flex items-start pointer-events-none text-on-surface-variant">
                <FileText size={16} />
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Giới thiệu về lịch sử nghề truyền thống, các dòng sản phẩm chính, không gian đón tiếp du khách trải nghiệm workshop..."
                className={`w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border rounded-xl text-sm font-medium text-deep-earth placeholder:text-on-surface-variant/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[90px] ${
                  errors.description ? 'border-rose-500 bg-rose-50/20' : 'border-soft-clay'
                }`}
              />
            </div>
            {errors.description && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Upload Hình ảnh xưởng */}
        <div className="space-y-3 pt-2 border-t border-soft-clay">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="block text-xs font-bold text-deep-earth uppercase tracking-wider">
                Hình ảnh xưởng sản xuất thực tế
              </label>
              <p className="text-[11px] text-on-surface-variant">
                Đăng tải hình ảnh không gian làm việc, dụng cụ và nghệ nhân đang chế tác để tăng độ tin cậy.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => workshopImagesInputRef.current?.click()}
              disabled={uploadingState.workshopImages}
              className="self-start sm:self-center"
            >
              {uploadingState.workshopImages ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> Đang tải lên...
                </>
              ) : (
                <>
                  <Upload size={14} className="mr-1.5" /> Thêm ảnh xưởng
                </>
              )}
            </Button>
            <input
              ref={workshopImagesInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleWorkshopImagesUpload}
              className="hidden"
            />
          </div>

          {/* Images Grid */}
          {formData.workshopImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.workshopImages.map((imgUrl, idx) => (
                <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-soft-clay group shadow-xs">
                  <img src={imgUrl} alt={`Ảnh xưởng ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveWorkshopImage(idx)}
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Xóa ảnh này"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div
              onClick={() => workshopImagesInputRef.current?.click()}
              className="border-2 border-dashed border-soft-clay rounded-2xl p-6 text-center cursor-pointer hover:bg-[#FAF7F2] transition-colors"
            >
              <ImageIcon size={32} className="mx-auto text-on-surface-variant/60 mb-1.5" />
              <p className="text-xs font-semibold text-deep-earth">Nhấn để chọn và tải lên ảnh xưởng</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB/ảnh)</p>
            </div>
          )}
        </div>

        {/* Giấy tờ xác minh (CCCD / Giấy phép) */}
        <div className="space-y-3 pt-2 border-t border-soft-clay">
          <div>
            <label className="block text-xs font-bold text-deep-earth uppercase tracking-wider">
              Giấy tờ xác minh danh tính & Hoạt động sản xuất (Khuyến nghị)
            </label>
            <p className="text-[11px] text-on-surface-variant">
              Tải ảnh CCCD hoặc Giấy chứng nhận nghệ nhân / Giấy phép kinh doanh để được xét duyệt nhanh chóng hơn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CCCD Mặt trước */}
            <div className="border border-soft-clay rounded-xl p-3 bg-[#FAF7F2] text-center space-y-2">
              <span className="text-[11px] font-bold text-deep-earth block">CCCD Mặt trước</span>
              {formData.idCardFront ? (
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border group">
                  <img src={formData.idCardFront} alt="CCCD mặt trước" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, idCardFront: '' }))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => idFrontInputRef.current?.click()}
                  disabled={uploadingState.idCardFront}
                  className="w-full text-xs"
                >
                  {uploadingState.idCardFront ? <Loader2 size={13} className="animate-spin" /> : 'Tải mặt trước'}
                </Button>
              )}
              <input
                ref={idFrontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleDocUpload('idCardFront', e)}
                className="hidden"
              />
            </div>

            {/* CCCD Mặt sau */}
            <div className="border border-soft-clay rounded-xl p-3 bg-[#FAF7F2] text-center space-y-2">
              <span className="text-[11px] font-bold text-deep-earth block">CCCD Mặt sau</span>
              {formData.idCardBack ? (
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border group">
                  <img src={formData.idCardBack} alt="CCCD mặt sau" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, idCardBack: '' }))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => idBackInputRef.current?.click()}
                  disabled={uploadingState.idCardBack}
                  className="w-full text-xs"
                >
                  {uploadingState.idCardBack ? <Loader2 size={13} className="animate-spin" /> : 'Tải mặt sau'}
                </Button>
              )}
              <input
                ref={idBackInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleDocUpload('idCardBack', e)}
                className="hidden"
              />
            </div>

            {/* Giấy phép kinh doanh / Chứng nhận */}
            <div className="border border-soft-clay rounded-xl p-3 bg-[#FAF7F2] text-center space-y-2">
              <span className="text-[11px] font-bold text-deep-earth block">Giấy phép / Chứng nhận</span>
              {formData.businessLicense ? (
                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border group">
                  <img src={formData.businessLicense} alt="Giấy phép" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, businessLicense: '' }))}
                    className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => licenseInputRef.current?.click()}
                  disabled={uploadingState.businessLicense}
                  className="w-full text-xs"
                >
                  {uploadingState.businessLicense ? <Loader2 size={13} className="animate-spin" /> : 'Tải giấy phép'}
                </Button>
              )}
              <input
                ref={licenseInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleSingleDocUpload('businessLicense', e)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-soft-clay flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={submitting}
            className="w-full sm:w-auto shadow-md"
          >
            <Send size={15} className="mr-1.5" />
            {appStatus === 'REJECTED' ? 'Cập nhật & Gửi lại hồ sơ' : 'Gửi hồ sơ đăng ký Chủ xưởng'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default WorkshopOwnerRegistrationTab;
