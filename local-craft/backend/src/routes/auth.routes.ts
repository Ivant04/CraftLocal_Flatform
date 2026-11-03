import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validations/auth.validation';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), updateProfile);
router.put('/change-password', authMiddleware, validate(changePasswordSchema), changePassword);

export default router;
