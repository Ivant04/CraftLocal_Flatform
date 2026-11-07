import { Router } from 'express';
import { getUsers, getPendingHosts, approveHost, blockUser, unblockUser, getDashboard } from '../controllers/admin.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/users', getUsers);
router.get('/hosts/pending', getPendingHosts);
router.put('/hosts/:id/approve', approveHost);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.get('/dashboard', getDashboard);

export default router;
