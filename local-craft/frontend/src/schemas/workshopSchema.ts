import { z } from 'zod';

export const workshopSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().min(1000, 'Price must be at least 1,000 VND'),
  duration: z.coerce.number().min(30, 'Duration must be at least 30 minutes'),
  address: z.string().min(5, 'Address is required'),
  location: z.string().min(1, 'Location is required'),
  maxGuests: z.coerce.number().min(1, 'Must allow at least 1 guest').optional(),
});

export type WorkshopFormData = z.infer<typeof workshopSchema>;
