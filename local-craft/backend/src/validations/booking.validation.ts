import { z } from 'zod';

export const createBookingSchema = z.object({
  timeslotId: z.string().regex(/^[a-f\d]{24}$/i, 'Khung giờ không hợp lệ'),
  quantity: z.number().int().min(1),
  couponCode: z.string().trim().max(32).optional(),
});
