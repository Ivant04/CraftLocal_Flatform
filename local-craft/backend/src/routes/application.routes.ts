import { Router } from 'express';
import { getMyApplication, applyWorkshopOwner } from '../controllers/application.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Tất cả endpoints đều cần đăng nhập
router.use(authMiddleware);

router.get('/my-application', getMyApplication);
router.post('/apply', applyWorkshopOwner);

export default router;
