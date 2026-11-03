import { z } from 'zod';

export const createTimeslotSchema = z.object({
  workshopId: z.string().min(1, 'Workshop ID là bắt buộc'),
  startTime: z.string().min(1, 'Thời gian bắt đầu là bắt buộc'),
  endTime: z.string().min(1, 'Thời gian kết thúc là bắt buộc'),
  totalSlots: z.coerce.number().min(1, 'Số chỗ phải lớn hơn 0'),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  note: z.string().optional(),
  tourGuideId: z.string().optional(),
});

export const updateTimeslotSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  totalSlots: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  note: z.string().optional(),
  status: z.enum(['AVAILABLE', 'FULL', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
  tourGuideId: z.string().optional(),
});

