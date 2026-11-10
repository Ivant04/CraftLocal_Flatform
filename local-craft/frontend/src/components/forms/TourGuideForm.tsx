import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tourGuideSchema, type TourGuideFormData } from '../../schemas/tourGuideSchema';
import Input from '../common/Input';
import Button from '../common/Button';

interface TourGuideFormProps {
  onSubmit: (data: TourGuideFormData) => Promise<void>;
}

const TourGuideForm: React.FC<TourGuideFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<TourGuideFormData>({
    resolver: zodResolver(tourGuideSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Full Name" error={errors.fullName?.message} {...register('fullName')} />
      <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
      <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
      <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
      <Button type="submit" fullWidth isLoading={isSubmitting}>Create Tour Guide</Button>
    </form>
  );
};

export default TourGuideForm;
