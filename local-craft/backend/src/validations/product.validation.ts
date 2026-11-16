import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm phải có ít nhất 2 ký tự'),
  description: z.string().min(5, 'Mô tả phải có ít nhất 5 ký tự'),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  stock: z.coerce.number().min(0, 'Số lượng tồn kho không được âm'),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
  images: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional(),
});

export const updateProductSchema = createProductSchema.partial();

