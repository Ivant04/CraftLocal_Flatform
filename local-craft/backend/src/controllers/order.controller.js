const orderService = require('../services/order.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class OrderController {
  createOrder = asyncHandler(async (req, res) => {
    const order = await orderService.createOrder(req.user._id, req.body);
    return ApiResponse.success(res, 201, 'Order placed successfully', order);
  });

  getMyOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getUserOrders(req.user._id);
    return ApiResponse.success(res, 200, 'Orders retrieved successfully', orders);
  });

  getAllOrders = asyncHandler(async (req, res) => {
    const orders = await orderService.getAllOrders(req.query);
    return ApiResponse.success(res, 200, 'All orders retrieved successfully', orders);
  });

  getOrderById = asyncHandler(async (req, res) => {
    const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
    return ApiResponse.success(res, 200, 'Order retrieved successfully', order);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    return ApiResponse.success(res, 200, 'Order status updated successfully', order);
  });
}

module.exports = new OrderController();
