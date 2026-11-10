import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '../../schemas/registerSchema';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'TOURIST' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
      <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
      <Input label="Confirm Password" type="password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
      <Select label="Role" options={[{ value: 'TOURIST', label: 'Tourist' }, { value: 'HOST', label: 'Host' }]} error={errors.role?.message} {...register('role')} />
      <Button type="submit" fullWidth isLoading={isSubmitting}>Create Account</Button>
    </form>
  );
};

export default RegisterForm;
