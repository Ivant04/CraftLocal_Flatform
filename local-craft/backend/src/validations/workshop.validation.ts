import { z } from 'zod';

const promotion = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,32}$/),
  percentOff: z.number().int().min(1).max(99),
}).nullable().optional();

const imageSource = z.string().trim().refine((value) =>
  /^\/(?![\\/])/.test(value) || (/^https?:\/\//i.test(value) && z.string().url().safeParse(value).success),
  'Ảnh phải là URL HTTP(S) hoặc đường dẫn /images/...');

export const createWorkshopSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  categoryId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  category: z.string().optional(),
  address: z.union([z.string().trim().min(1), z.object({ fullAddress: z.string().trim().min(1) }).passthrough()]),
  locationLabel: z.string().trim().min(1),
  location: z.string().optional(),
  mapLocation: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional(),
  price: z.number().int().nonnegative(),
  duration: z.number().int().positive(),
  maxGuestsPerSlot: z.number().int().positive(),
  images: z.array(imageSource).min(1),
  promotion,
}).passthrough();

export const updateWorkshopSchema = createWorkshopSchema.partial();
