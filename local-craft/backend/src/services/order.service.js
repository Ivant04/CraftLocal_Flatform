const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/apiError');

class OrderService {
  async createOrder(userId, { items, shippingAddress }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order must contain at least one item');
    }

    if (!shippingAddress || !shippingAddress.recipientName || !shippingAddress.phone || !shippingAddress.street) {
      throw new ApiError(400, 'Complete shipping address is required');
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new ApiError(404, `Product not found: ${item.product}`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for product ${product.name}. Available: ${product.stock}`);
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      // Reduce product stock
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.status = 'OUT_OF_STOCK';
      }
      await product.save();
    }

    const order = await Order.create({
      customer: userId,
      items: validatedItems,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentStatus: 'UNPAID',
      orderStatus: 'PENDING'
    });

    return order;
  }

  async getUserOrders(userId) {
    return await Order.find({ customer: userId })
      .populate('items.product', 'name images price')
      .populate('payment')
      .sort({ createdAt: -1 });
  }

  async getAllOrders(query = {}) {
    const filter = {};
    if (query.orderStatus) filter.orderStatus = query.orderStatus;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    return await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price')
      .populate('payment')
      .sort({ createdAt: -1 });
  }

  async getOrderById(id, userId, userRole) {
    const order = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product')
      .populate('payment');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (userRole !== 'ADMIN' && order.customer._id.toString() !== userId.toString()) {
      throw new ApiError(403, 'Access denied to this order');
    }

    return order;
  }

  async updateOrderStatus(id, status) {
    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    return order;
  }
}

module.exports = new OrderService();
