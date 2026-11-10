import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(1000, 'Price must be at least 1,000 VND'),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  category: z.string().min(1, 'Category is required'),
});

export type ProductFormData = z.infer<typeof productSchema>;
