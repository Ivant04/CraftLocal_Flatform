import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
