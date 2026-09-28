const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.post('/', authenticate, orderController.createOrder);
router.get('/my', authenticate, orderController.getMyOrders);
router.get('/', authenticate, authorize('ADMIN'), orderController.getAllOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.patch('/:id/status', authenticate, authorize('ARTISAN', 'ADMIN'), orderController.updateStatus);

module.exports = router;
