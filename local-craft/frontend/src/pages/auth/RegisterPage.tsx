import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../schemas/registerSchema';
import { useAuth } from '../../hooks/useAuth';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import { authenticateWithGoogle } from '../../utils/googleAuth';
import authApi from '../../api/authApi';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { FcGoogle } from 'react-icons/fc';
import { User, Mail, Phone, Lock, Eye, EyeOff, Users, Info, AlertCircle } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'TOURIST' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setSuccess('');
    try {
      const res = await authApi.register(data);
      const payload = res.data?.data;
      if (data.role === 'HOST' || payload?.user?.status === 'PENDING') {
        setSuccess(res.data?.message || 'Tài khoản Chủ xưởng đang chờ Quản trị viên duyệt.');
      } else if (payload?.token && payload?.user) {
        login(payload.token, payload.user);
        navigate(getRoleRedirectPath(payload.user.role));
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      const errData = err?.response?.data;
      if (Array.isArray(errData?.errors) && errData.errors.length > 0) {
        setError(errData.errors.map((e: any) => e.message).join('. '));
      } else {
        setError(errData?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    }
  };

  const handleGoogleRegister = async () => {
    if (googleLoading) return;
    setError('');
    setSuccess('');
    setGoogleLoading(true);
    try {
      const { token, user } = await authenticateWithGoogle(selectedRole);
      if (user.role === 'HOST' && user.status === 'PENDING') {
        setSuccess('Tài khoản Chủ xưởng đang chờ Quản trị viên duyệt.');
        return;
      }
      login(token, user);
      navigate(getRoleRedirectPath(user.role));
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Đăng ký bằng Google thất bại. Vui lòng thử lại.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto rounded-3xl border border-[#EAD8CC] bg-[#FFFDF8]/95 p-8 md:p-10 shadow-[0_24px_80px_rgba(61,43,31,0.12)] backdrop-blur">
      <h1 className="font-headline-lg text-headline-md text-[#3D2B1F] mb-1">Đăng ký</h1>
      <p className="text-[#7A6255] mb-8 text-sm">Tạo tài khoản CraftLocal của bạn</p>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 bg-[#FFF4EA] border border-[#F0CDB9] text-[#7A3518] rounded-2xl text-sm flex items-center gap-2">
          <Info className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Họ và tên" placeholder="Nguyễn Văn A" icon={<User className="h-5 w-5" />} error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" placeholder="email@example.com" icon={<Mail className="h-5 w-5" />} error={errors.email?.message} {...register('email')} />
        <Input label="Số điện thoại" type="tel" placeholder="0901234567" icon={<Phone className="h-5 w-5" />} error={errors.phone?.message} {...register('phone')} />
        <Input
          label="Mật khẩu"
          type={showPwd ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="p-0.5 hover:text-[#964824] transition-colors" tabIndex={-1}>
              {showPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Xác nhận mật khẩu"
          type={showConfirmPwd ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock className="h-5 w-5" />}
          rightIcon={
            <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} className="p-0.5 hover:text-[#964824] transition-colors" tabIndex={-1}>
              {showConfirmPwd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <div>
          <Select
            label="Vai trò"
            icon={<Users className="h-5 w-5" />}
            options={[{ value: 'TOURIST', label: 'Khách du lịch' }, { value: 'HOST', label: 'Chủ xưởng' }]}
            error={errors.role?.message}
            {...register('role')}
          />
          {selectedRole === 'HOST' && (
            <div className="mt-3 p-3.5 bg-[#FFF4EA] border border-[#F0CDB9] rounded-2xl flex items-start gap-2.5 animate-[slideDown_0.2s_ease-out]">
              <Info className="h-4 w-4 text-[#964824] shrink-0 mt-0.5" />
              <p className="text-xs text-[#7A3518] leading-relaxed">
                Tài khoản Chủ xưởng cần được Quản trị viên phê duyệt trước khi có thể hoạt động.
              </p>
            </div>
          )}
        </div>
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>Tạo tài khoản</Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#EAD8CC]" />
        <span className="text-sm text-[#7A6255]">hoặc</span>
        <div className="flex-1 h-px bg-[#EAD8CC]" />
      </div>

      {/* Google Register Button */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={googleLoading}
        className="w-full h-[52px] flex items-center justify-center gap-3 rounded-2xl border-2 border-[#E3CFC2] bg-white text-[#3D2B1F] font-semibold hover:bg-[#FAF7F2] hover:border-[#964824]/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <FcGoogle className="text-xl" />
        <span>{googleLoading ? 'Đang kết nối Google...' : 'Đăng ký bằng Google'}</span>
      </button>

      <p className="text-center mt-8 text-sm text-[#7A6255]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#964824] font-semibold hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
