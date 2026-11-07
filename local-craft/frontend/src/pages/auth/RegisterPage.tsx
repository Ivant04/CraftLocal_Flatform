import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../schemas/registerSchema';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { FcGoogle } from 'react-icons/fc';
import { User, Mail, Phone, Lock, Eye, EyeOff, Users, Info } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'TOURIST' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    if (data.role === 'HOST') {
      setSuccess('Tài khoản Chủ xưởng đang chờ Quản trị viên duyệt.');
    } else {
      navigate('/login');
    }
  };

  const handleGoogleRegister = () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        window.location.href = `${apiUrl}/auth/google`;
      } else {
        alert("Tính năng đăng ký bằng Google hiện đang được thử nghiệm!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto rounded-3xl border border-[#EAD8CC] bg-[#FFFDF8]/95 p-8 md:p-10 shadow-[0_24px_80px_rgba(61,43,31,0.12)] backdrop-blur">
      <h1 className="font-headline-lg text-headline-md text-[#3D2B1F] mb-1">Đăng ký</h1>
      <p className="text-[#7A6255] mb-8 text-sm">Tạo tài khoản CraftLocal của bạn</p>

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
        className="w-full h-[52px] flex items-center justify-center gap-3 rounded-2xl border-2 border-[#E3CFC2] bg-white text-[#3D2B1F] font-semibold hover:bg-[#FAF7F2] hover:border-[#964824]/30 transition-all"
      >
        <FcGoogle className="text-xl" />
        <span>Đăng ký bằng Google</span>
      </button>

      <p className="text-center mt-8 text-sm text-[#7A6255]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#964824] font-semibold hover:underline">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
