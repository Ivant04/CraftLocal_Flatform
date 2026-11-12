import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  stock: z.coerce.number().min(0, 'Số lượng tồn kho không được âm'),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  origin: z.string().optional(),
  material: z.string().optional(),
  status: z.enum(['ACTIVE', 'HIDDEN', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
}).refine((data) => Boolean(data.category || data.categoryId), {
  message: 'Danh mục là bắt buộc',
  path: ['category'],
});

export const updateProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự').optional(),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự').optional(),
  price: z.coerce.number().min(0, 'Giá không được âm').optional(),
  stock: z.coerce.number().min(0, 'Số lượng tồn kho không được âm').optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  images: z.array(z.string()).optional(),
  origin: z.string().optional(),
  material: z.string().optional(),
  status: z.enum(['ACTIVE', 'HIDDEN', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
});

