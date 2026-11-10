import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import Product from '../models/product.model';
import Order from '../models/order.model';
import { v4 as uuidv4 } from 'uuid';
import { SHIPPING_FEE } from '../utils/constants';

export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const { items, shippingAddress } = req.body;

  // Tải tất cả products
  const productIds = items.map((i: any) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, status: 'ACTIVE' });

  if (products.length !== items.length) {
    return sendError(res, 'Một số sản phẩm không khả dụng');
  }

  // Gom nhóm sản phẩm theo hostId
  const itemsByHost: Record<string, any[]> = {};
  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.productId);
    if (!product) return sendError(res, `Sản phẩm ${item.productId} không tồn tại`);
    if (product.stock < item.quantity) {
      return sendError(res, `Sản phẩm "${product.name}" không đủ số lượng (còn ${product.stock})`);
    }

    const hId = product.hostId.toString();
    if (!itemsByHost[hId]) {
      itemsByHost[hId] = [];
    }

    const subtotal = product.price * item.quantity;
    itemsByHost[hId].push({
      productId: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price,
      quantity: item.quantity,
      subtotal,
    });
  }

  const createdOrders = [];
  const entries = Object.entries(itemsByHost);

  for (let i = 0; i < entries.length; i++) {
    const [hId, hostItems] = entries[i];
    const productTotal = hostItems.reduce((sum, item) => sum + item.subtotal, 0);
    const orderCode = `ORD-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}-${i}`;
    const totalAmount = productTotal + SHIPPING_FEE;

    const order = await Order.create({
      orderCode,
      touristId: req.user!._id,
      hostId: hId,
      items: hostItems,
      shippingAddress,
      productTotal,
      shippingFee: SHIPPING_FEE,
      totalAmount,
      orderStatus: 'PENDING',
    });
    createdOrders.push(order);
  }

  sendSuccess(res, 'Đặt hàng thành công! Vui lòng thanh toán.', createdOrders, 201);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ touristId: req.user!._id })
    .populate('hostId', 'fullName')
    .sort({ createdAt: -1 });
  sendSuccess(res, 'Lấy danh sách đơn hàng', orders);
});
