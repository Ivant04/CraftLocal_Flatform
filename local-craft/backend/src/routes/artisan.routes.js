const express = require('express');
const router = express.Router();
const artisanController = require('../controllers/artisan.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/', artisanController.getAllArtisans);
router.get('/:id', artisanController.getArtisanById);
router.put('/profile', authenticate, authorize('ARTISAN', 'ADMIN'), artisanController.updateProfile);
router.patch('/:id/status', authenticate, authorize('ADMIN'), artisanController.updateVerificationStatus);

module.exports = router;
