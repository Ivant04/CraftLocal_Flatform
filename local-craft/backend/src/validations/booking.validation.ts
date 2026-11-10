import { z } from 'zod';

export const createBookingSchema = z.object({
  timeslotId: z.string().min(1, 'Vui lòng chọn khung giờ'),
  quantity: z.coerce.number().min(1, 'Số lượng vé tối thiểu là 1'),
});

