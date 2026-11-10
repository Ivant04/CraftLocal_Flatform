import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().regex(/^[a-f\d]{24}$/i, 'Booking không hợp lệ'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, 'Vui lòng nhập đánh giá').max(2000),
  images: z.array(z.string().url()).max(5).optional(),
});
