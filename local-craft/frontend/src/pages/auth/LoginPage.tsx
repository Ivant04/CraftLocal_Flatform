import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../../schemas/loginSchema';
import { useAuth } from '../../hooks/useAuth';
import { getRoleRedirectPath } from '../../utils/roleRedirect';
import { users } from '../../utils/mockData';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setError('');
    const foundUser = users.find((u) => u.email === data.email);
    if (foundUser) {
      login('mock-token-' + foundUser._id, foundUser);
      navigate(getRoleRedirectPath(foundUser.role));
    } else {
      setError('Email hoặc mật khẩu không đúng');
    }
  };

  const handleGoogleLogin = () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        window.location.href = `${apiUrl}/auth/google`;
      } else {
        alert("Tính năng đăng nhập Google hiện đang được thử nghiệm!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto rounded-3xl border border-[#EAD8CC] bg-[#FFFDF8]/95 p-8 md:p-10 shadow-[0_24px_80px_rgba(61,43,31,0.12)] backdrop-blur">
      <h1 className="font-headline-lg text-headline-md text-[#3D2B1F] mb-1">Đăng nhập</h1>
      <p className="text-[#7A6255] mb-8 text-sm">Chào mừng bạn trở lại CraftLocal</p>

      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          icon={<Mail className="h-5 w-5" />}
          error={errors.email?.message}
          {...register('email')}
        />
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
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-[#3D2B1F]">
            <input type="checkbox" className="h-4 w-4 rounded border-[#D8C3B5] text-[#964824] focus:ring-[#964824] focus:ring-offset-0" />
            Ghi nhớ đăng nhập
          </label>
          <span className="text-[#964824] cursor-pointer hover:underline font-medium">Quên mật khẩu?</span>
        </div>
        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>Đăng nhập</Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-[#EAD8CC]" />
        <span className="text-sm text-[#7A6255]">hoặc</span>
        <div className="flex-1 h-px bg-[#EAD8CC]" />
      </div>

      {/* Google Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full h-[52px] flex items-center justify-center gap-3 rounded-2xl border-2 border-[#E3CFC2] bg-white text-[#3D2B1F] font-semibold hover:bg-[#FAF7F2] hover:border-[#964824]/30 transition-all"
      >
        <FcGoogle className="text-xl" />
        <span>Tiếp tục với Google</span>
      </button>

      <p className="text-center mt-8 text-sm text-[#7A6255]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#964824] font-semibold hover:underline">Đăng ký</Link>
      </p>
    </div>
  );
};

export default LoginPage;
