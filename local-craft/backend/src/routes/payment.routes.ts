import { Router } from 'express';
import {
  createBookingPayOSPayment,
  createOrderPayOSPayment,
  payosWebhook,
  getPayOSPaymentStatus,
  cancelPayOSPayment,
} from '../controllers/payment.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();

// payOS payment routes
router.post('/payos/create-booking-payment', authMiddleware, roleMiddleware('TOURIST'), createBookingPayOSPayment);
router.post('/payos/create-order-payment', authMiddleware, roleMiddleware('TOURIST'), createOrderPayOSPayment);
router.post('/payos/webhook', payosWebhook); // Public - no auth
router.get('/payos/status/:orderCode', optionalAuthMiddleware, getPayOSPaymentStatus);
router.post('/payos/cancel/:orderCode', authMiddleware, cancelPayOSPayment);

export default router;
