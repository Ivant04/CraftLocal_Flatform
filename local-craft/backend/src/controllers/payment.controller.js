const paymentService = require('../services/payment/payment.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class PaymentController {
  createOrderPayment = asyncHandler(async (req, res) => {
    const { orderId, returnUrl, cancelUrl } = req.body;
    const result = await paymentService.createOrderPayment(req.user._id, orderId, returnUrl, cancelUrl);
    return ApiResponse.success(res, 201, 'Order payment checkout link created successfully', result);
  });

  createBookingPayment = asyncHandler(async (req, res) => {
    const { bookingId, returnUrl, cancelUrl } = req.body;
    const result = await paymentService.createBookingPayment(req.user._id, bookingId, returnUrl, cancelUrl);
    return ApiResponse.success(res, 201, 'Booking payment checkout link created successfully', result);
  });

  handleWebhook = asyncHandler(async (req, res) => {
    const result = await paymentService.handleWebhook(req.body);
    return ApiResponse.success(res, 200, 'Webhook processed successfully', result);
  });

  getPaymentById = asyncHandler(async (req, res) => {
    const payment = await paymentService.getPaymentById(req.params.id);
    return ApiResponse.success(res, 200, 'Payment details retrieved successfully', payment);
  });
}

module.exports = new PaymentController();
