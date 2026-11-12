import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductFormData } from '../../schemas/productSchema';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

interface CategoryOption {
  _id: string;
  name: string;
}

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [imageUrls, setImageUrls] = useState('');
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      categoryApi.getAll({ type: 'PRODUCT' }).catch(() => null),
      id ? productApi.getById(id) : Promise.resolve(null),
    ])
      .then(([catRes, prodRes]) => {
        if (!active) return;
        const catList = catRes?.data?.data;
        if (Array.isArray(catList)) setCategories(catList);

        const prod = prodRes?.data?.data;
        if (prod) {
          const catId = typeof prod.categoryId === 'object' ? prod.categoryId?._id : prod.categoryId;
          reset({
            name: prod.name || '',
            description: prod.description || '',
            price: Number(prod.price ?? 0),
            stock: Number(prod.stock ?? 0),
            category: catId || prod.category || '',
          });
          setImageUrls(Array.isArray(prod.images) ? prod.images.join('\n') : '');
        }
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được thông tin sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, reset]);

  const onSubmit = async (data: ProductFormData) => {
    setError('');
    const images = imageUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      stock: Number(data.stock),
      category: data.category,
      categoryId: /^[a-f\d]{24}$/i.test(data.category) ? data.category : undefined,
      images,
    };

    try {
      if (id) {
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }
      navigate('/host/products');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Lưu sản phẩm thất bại. Vui lòng thử lại.');
    }
  };

  if (loading) return <div className="py-16 flex justify-center"><Loading /></div>;

  const categoryOptions =
    categories.length > 0
      ? categories.map((c) => ({ value: c._id, label: c.name }))
      : PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="max-w-2xl">
      <h1 className="font-headline-lg text-headline-md text-deep-earth mb-8">
        {id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
      </h1>
      {error && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-2xl border border-soft-clay p-6">
        <Input label="Tên sản phẩm" placeholder="Tên sản phẩm" error={errors.name?.message} {...register('name')} />
        <Textarea label="Mô tả" placeholder="Mô tả sản phẩm..." error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Input label="Giá (VND)" type="number" error={errors.price?.message} {...register('price')} />
          <Input label="Tồn kho" type="number" error={errors.stock?.message} {...register('stock')} />
          <Select label="Danh mục" options={categoryOptions} placeholder="Chọn" error={errors.category?.message} {...register('category')} />
        </div>
        <Textarea
          label="Ảnh sản phẩm (mỗi dòng một URL hoặc /images/...)"
          rows={3}
          value={imageUrls}
          onChange={(e) => setImageUrls(e.target.value)}
          placeholder="https://.../san-pham.jpg"
        />
        <div className="flex gap-3 pt-4">
          <Button type="submit" isLoading={isSubmitting}>Lưu sản phẩm</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/host/products')}>Hủy</Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
