import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Package,
  ArrowLeft,
  Save,
  ShoppingBag,
  Image as ImageIcon,
  DollarSign,
  Layers,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { productSchema, type ProductFormData } from '../../schemas/productSchema';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import ImageWithFallback from '../../components/common/ImageWithFallback';

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
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
        if (active) setError(err?.response?.data?.message || 'Không thể tải thông tin sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reset]);

  // Parsed image previews
  const previewImages = useMemo(() => {
    return imageUrls
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [imageUrls]);

  const onSubmit = async (data: ProductFormData) => {
    setError('');
    const images = previewImages;

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
      setError(err?.response?.data?.message || 'Lưu sản phẩm thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loading />
      </div>
    );
  }

  const categoryOptions =
    categories.length > 0
      ? categories.map((c) => ({ value: c._id, label: c.name }))
      : PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }));

  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Breadcrumb & Title */}
      <div>
        <Link
          to="/host/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7A6255] hover:text-[#964824] transition-colors mb-2"
        >
          <ArrowLeft size={14} />
          <span>Quay lại Quản lý sản phẩm</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#964824]/10 border border-[#964824]/20 flex items-center justify-center text-[#964824]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#3D2B1F]">
              {id ? 'Chỉnh sửa sản phẩm thủ công' : 'Đăng bán sản phẩm mới'}
            </h1>
            <p className="text-xs md:text-sm text-[#7A6255] mt-0.5">
              Hoàn thiện thông tin tác phẩm, xuất xứ và hình ảnh để du khách thuận tiện đặt mua.
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#EAD8CC]/60 pb-3 flex items-center gap-2">
            <Package size={18} className="text-[#964824]" />
            <h2 className="font-serif font-bold text-base text-[#3D2B1F]">Thông tin tác phẩm</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Tên sản phẩm thủ công"
              placeholder="VD: Bình gốm men lam Bát Tràng, Nón lá sen Huế..."
              error={errors.name?.message}
              {...register('name')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Danh mục thủ công"
                options={categoryOptions}
                placeholder="-- Chọn danh mục --"
                error={errors.category?.message}
                {...register('category')}
              />
            </div>

            <Textarea
              label="Mô tả chi tiết tác phẩm & câu chuyện nghệ nhân"
              placeholder="Mô tả chất liệu, kỹ thuật chế tác đặc trưng, kích thước và ý nghĩa văn hóa của sản phẩm..."
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </div>

        {/* Section 2: Pricing & Inventory */}
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#EAD8CC]/60 pb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-[#964824]" />
            <h2 className="font-serif font-bold text-base text-[#3D2B1F]">Giá bán & Số lượng tồn kho</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Đơn giá (VND)"
              type="number"
              min={0}
              placeholder="VD: 250000"
              error={errors.price?.message}
              {...register('price')}
            />

            <Input
              label="Số lượng tồn kho (cái)"
              type="number"
              min={0}
              placeholder="VD: 50"
              error={errors.stock?.message}
              {...register('stock')}
            />
          </div>
        </div>

        {/* Section 3: Product Image Gallery */}
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-5 md:p-6 shadow-xs space-y-4">
          <div className="border-b border-[#EAD8CC]/60 pb-3 flex items-center gap-2">
            <ImageIcon size={18} className="text-[#964824]" />
            <h2 className="font-serif font-bold text-base text-[#3D2B1F]">Hình ảnh sản phẩm</h2>
          </div>

          <Textarea
            label="Danh sách đường dẫn ảnh (mỗi dòng một URL hình ảnh)"
            rows={3}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://res.cloudinary.com/.../san-pham-1.jpg&#10;https://res.cloudinary.com/.../san-pham-2.jpg"
          />

          {/* Visual Previews */}
          <div>
            <p className="text-xs font-semibold text-[#7A6255] mb-2">
              Xem trước hình ảnh ({previewImages.length} ảnh):
            </p>
            {previewImages.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#FAF7F2] border border-dashed border-[#EAD8CC] text-center text-xs text-[#7A6255]">
                Chưa có hình ảnh nào. Dán các đường dẫn URL ảnh ở trên để xem trước tại đây.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previewImages.map((url, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden bg-[#FAF7F2] border border-[#EAD8CC] group"
                  >
                    <ImageWithFallback
                      src={url}
                      alt={`Ảnh ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      Ảnh {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/host/products')}
          >
            Hủy bỏ
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="px-6">
            <Save size={16} className="mr-1.5" />
            <span>{id ? 'Lưu thay đổi' : 'Đăng bán sản phẩm'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
