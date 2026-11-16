import { z } from 'zod';

export const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Mã sản phẩm là bắt buộc'),
      quantity: z.coerce.number().min(1, 'Số lượng phải lớn hơn 0'),
    })
  ).min(1, 'Giỏ hàng không được để trống'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Họ tên là bắt buộc'),
    phone: z.string().min(9, 'Số điện thoại là bắt buộc'),
    addressLine: z.string().min(3, 'Địa chỉ là bắt buộc'),
    city: z.string().optional(),
    province: z.string().optional(),
    ward: z.string().optional(),
    district: z.string().optional(),
    country: z.string().optional(),
    fullAddress: z.string().optional(),
    note: z.string().optional(),
  }),
});

