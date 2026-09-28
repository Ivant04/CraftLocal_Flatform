const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/', authenticate, reviewController.createReview);
router.get('/', reviewController.getReviews);
router.get('/my', authenticate, reviewController.getMyReviews);
router.patch('/:id/status', authenticate, authorize('ADMIN'), reviewController.updateStatus);

module.exports = router;
