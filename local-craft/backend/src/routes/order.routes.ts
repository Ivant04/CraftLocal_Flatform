import { Router } from 'express';
import { checkout, getMyOrders } from '../controllers/order.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { checkoutSchema } from '../validations/order.validation';

const router = Router();
router.use(authMiddleware, roleMiddleware('TOURIST'));

router.post('/checkout', validate(checkoutSchema), checkout);
router.get('/my-orders', getMyOrders);

export default router;
