import { Router } from 'express';
import { getUsers, getPendingHosts, approveHost, blockUser, unblockUser, getDashboard } from '../controllers/admin.controller';
import {
  getAdminApplications,
  getAdminApplicationById,
  approveApplication,
  rejectApplication,
} from '../controllers/application.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { roleMiddleware } from '../middlewares/role.middleware';

const router = Router();
router.use(authMiddleware, roleMiddleware('ADMIN'));

router.get('/users', getUsers);
router.get('/hosts/pending', getPendingHosts);
router.put('/hosts/:id/approve', approveHost);

// Workshop Owner Applications Management
router.get('/applications', getAdminApplications);
router.get('/applications/:id', getAdminApplicationById);
router.put('/applications/:id/approve', approveApplication);
router.put('/applications/:id/reject', rejectApplication);

router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.get('/dashboard', getDashboard);

export default router;
