const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/', authenticate, authorize('ADMIN'), userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/profile', authenticate, userController.updateProfile);
router.patch('/:id/status', authenticate, authorize('ADMIN'), userController.updateStatus);
router.patch('/:id/role', authenticate, authorize('ADMIN'), userController.updateRole);

module.exports = router;
