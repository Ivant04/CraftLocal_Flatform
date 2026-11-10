import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Mã đặt chỗ là bắt buộc'),
  rating: z.coerce.number().min(1).max(5, 'Đánh giá từ 1 đến 5 sao'),
  comment: z.string().min(5, 'Nội dung đánh giá ít nhất 5 ký tự'),
  images: z.array(z.string()).optional(),
});

