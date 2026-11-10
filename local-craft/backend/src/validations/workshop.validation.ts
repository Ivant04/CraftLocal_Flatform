import { z } from 'zod';

export const createWorkshopSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  shortDescription: z.string().optional(),
  categoryId: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  duration: z.coerce.number().min(1, 'Thời lượng phải lớn hơn 0'),
  maxGuestsPerSlot: z.coerce.number().min(1).optional(),
  location: z.string().optional(),
  locationLabel: z.string().optional(),
  address: z.any().optional(),
  mapLocation: z.any().optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
  includedItems: z.array(z.string()).optional(),
  requiredItems: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  language: z.string().optional(),
  difficulty: z.string().optional(),
});

export const updateWorkshopSchema = createWorkshopSchema.partial();

