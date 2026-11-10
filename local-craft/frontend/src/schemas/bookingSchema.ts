import { z } from 'zod';

export const bookingSchema = z.object({
  timeslotId: z.string().min(1, 'Please select a timeslot'),
  guests: z.coerce.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests'),
});

export type BookingFormData = z.infer<typeof bookingSchema>;
