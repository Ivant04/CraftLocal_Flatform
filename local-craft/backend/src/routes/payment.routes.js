const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/order', authenticate, paymentController.createOrderPayment);
router.post('/booking', authenticate, paymentController.createBookingPayment);
router.post('/webhook', paymentController.handleWebhook);
router.get('/:id', authenticate, paymentController.getPaymentById);

module.exports = router;
