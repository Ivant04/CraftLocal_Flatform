import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workshopSchema, type WorkshopFormData } from '../../schemas/workshopSchema';
import { WORKSHOP_CATEGORIES, LOCATIONS } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import { ImagePlus } from 'lucide-react';

const WorkshopFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<WorkshopFormData>({ resolver: zodResolver(workshopSchema) });

  const onSubmit = async (_data: WorkshopFormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    navigate('/host/workshops');
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-md text-[#3D2B1F]">Thông tin Workshop</h1>
        <p className="text-[#7A6255] text-sm mt-1">Điền đầy đủ thông tin để tạo workshop mới</p>
      </div>
      <div className="bg-white rounded-3xl border border-[#EAD8CC] p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Tiêu đề" placeholder="Tên workshop" error={errors.title?.message} {...register('title')} />
          <Textarea label="Mô tả" placeholder="Mô tả chi tiết workshop..." error={errors.description?.message} {...register('description')} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Select label="Danh mục" options={WORKSHOP_CATEGORIES.map((c) => ({ value: c, label: c }))} placeholder="Chọn danh mục" error={errors.category?.message} {...register('category')} />
            <Select label="Khu vực" options={LOCATIONS.map((l) => ({ value: l, label: l }))} placeholder="Chọn khu vực" error={errors.location?.message} {...register('location')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Input label="Giá (VND)" type="number" placeholder="450000" error={errors.price?.message} {...register('price')} />
            <Input label="Thời lượng (phút)" type="number" placeholder="180" error={errors.duration?.message} {...register('duration')} />
            <Input label="Số khách tối đa" type="number" placeholder="12" error={errors.maxGuests?.message} {...register('maxGuests')} />
          </div>
          <Input label="Địa chỉ" placeholder="Địa chỉ đầy đủ" error={errors.address?.message} {...register('address')} />
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#3D2B1F]">Hình ảnh</label>
            <div className="border-2 border-dashed border-[#E3CFC2] rounded-2xl p-8 text-center hover:border-[#964824]/50 hover:bg-[#FAF7F2] transition-all cursor-pointer group">
              <ImagePlus size={32} className="mx-auto text-[#A89183] mb-3 group-hover:text-[#964824] transition-colors" />
              <p className="text-[#7A6255] text-sm font-medium">Nhấn để tải ảnh lên hoặc kéo thả</p>
              <p className="text-[#A89183] text-xs mt-1">PNG, JPG tối đa 5MB</p>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" isLoading={isSubmitting}>Lưu Workshop</Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/host/workshops')}>Hủy</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkshopFormPage;
