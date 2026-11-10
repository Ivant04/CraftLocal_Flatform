import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '../../schemas/productSchema';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => Promise<void>;
  defaultValues?: Partial<ProductFormData>;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, defaultValues }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input label="Tên sản phẩm" error={errors.name?.message} {...register('name')} />
      <Textarea label="Mô tả" error={errors.description?.message} {...register('description')} />
      <div className="grid grid-cols-3 gap-4">
        <Input label="Giá (VND)" type="number" error={errors.price?.message} {...register('price')} />
        <Input label="Tồn kho" type="number" error={errors.stock?.message} {...register('stock')} />
        <Select label="Danh mục" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} error={errors.category?.message} {...register('category')} />
      </div>
      <Button type="submit" isLoading={isSubmitting}>Lưu sản phẩm</Button>
    </form>
  );
};

export default ProductForm;
