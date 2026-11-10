import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workshopSchema, type WorkshopFormData } from '../../schemas/workshopSchema';
import { WORKSHOP_CATEGORIES, LOCATIONS } from '../../utils/constants';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface WorkshopFormProps {
  onSubmit: (data: WorkshopFormData) => Promise<void>;
  defaultValues?: Partial<WorkshopFormData>;
}

const WorkshopForm: React.FC<WorkshopFormProps> = ({ onSubmit, defaultValues }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WorkshopFormData>({
    resolver: zodResolver(workshopSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Tiêu đề" error={errors.title?.message} {...register('title')} />
      <Textarea label="Mô tả" error={errors.description?.message} {...register('description')} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Danh mục" options={WORKSHOP_CATEGORIES.map((c) => ({ value: c, label: c }))} error={errors.category?.message} {...register('category')} />
        <Select label="Khu vực" options={LOCATIONS.map((l) => ({ value: l, label: l }))} error={errors.location?.message} {...register('location')} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input label="Giá (VND)" type="number" error={errors.price?.message} {...register('price')} />
        <Input label="Thời lượng (phút)" type="number" error={errors.duration?.message} {...register('duration')} />
        <Input label="Số khách tối đa" type="number" error={errors.maxGuests?.message} {...register('maxGuests')} />
      </div>
      <Input label="Địa chỉ" error={errors.address?.message} {...register('address')} />
      <Button type="submit" isLoading={isSubmitting}>Lưu Workshop</Button>
    </form>
  );
};

export default WorkshopForm;
