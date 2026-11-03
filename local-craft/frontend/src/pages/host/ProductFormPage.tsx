import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '../../schemas/productSchema';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';

const ProductFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) });

  const onSubmit = async (_data: ProductFormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    navigate('/host/products');
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline-lg text-headline-md text-deep-earth mb-8">Thông tin sản phẩm</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Tên sản phẩm" placeholder="Tên" error={errors.name?.message} {...register('name')} />
        <Textarea label="Mô tả" placeholder="Mô tả sản phẩm..." error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Input label="Giá (VND)" type="number" error={errors.price?.message} {...register('price')} />
          <Input label="Tồn kho" type="number" error={errors.stock?.message} {...register('stock')} />
          <Select label="Danh mục" options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))} placeholder="Chọn" error={errors.category?.message} {...register('category')} />
        </div>
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isSubmitting}>Lưu sản phẩm</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/host/products')}>Hủy</Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
