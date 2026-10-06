import { Router } from 'express';
import { createBooking, getMyBookings, getBookingById, getBookingTicket, cancelBooking } from '../controllers/booking.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createBookingSchema } from '../validations/booking.validation';

const router = Router();
router.use(authMiddleware, roleMiddleware('TOURIST'));

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.get('/:id/ticket', getBookingTicket);
router.put('/:id/cancel', cancelBooking);

export default router;

