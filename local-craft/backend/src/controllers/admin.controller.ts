import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import User from '../models/user.model';
import Workshop from '../models/workshop.model';
import Booking from '../models/booking.model';
import Order from '../models/order.model';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, status, page = '1', limit = '20' } = req.query;
  const filter: any = {};
  if (role) filter.role = role;
  if (status) filter.status = status;

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const users = await User.find(filter).skip(skip).limit(parseInt(limit as string)).sort({ createdAt: -1 });
  const total = await User.countDocuments(filter);

  sendSuccess(res, 'Lấy danh sách người dùng thành công', { users, total, page: parseInt(page as string), limit: parseInt(limit as string) });
});

export const getPendingHosts = asyncHandler(async (_req: Request, res: Response) => {
  const hosts = await User.find({ role: 'HOST', status: 'PENDING' }).sort({ createdAt: -1 });
  sendSuccess(res, 'Lấy danh sách Host chờ duyệt', hosts);
});

export const approveHost = asyncHandler(async (req: Request, res: Response) => {
  const host = await User.findOneAndUpdate(
    { _id: req.params.id, role: 'HOST', status: 'PENDING' },
    {
      status: 'ACTIVE',
      'hostProfile.approvedAt': new Date(),
      'hostProfile.approvedBy': req.user!._id,
    },
    { new: true }
  );
  if (!host) return sendError(res, 'Không tìm thấy Host hoặc đã được duyệt', 404);
  sendSuccess(res, 'Phê duyệt Host thành công', host);
});

export const blockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'BLOCKED' }, { new: true });
  if (!user) return sendError(res, 'Người dùng không tồn tại', 404);
  sendSuccess(res, 'Khóa tài khoản thành công', user);
});

export const unblockUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: 'ACTIVE' }, { new: true });
  if (!user) return sendError(res, 'Người dùng không tồn tại', 404);
  sendSuccess(res, 'Mở khóa tài khoản thành công', user);
});

export const getDashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalHosts,
    totalTourists,
    totalWorkshops,
    totalBookings,
    totalOrders,
    pendingHostsCount,
    bookingRevAgg,
    orderRevAgg,
    recentBookings,
    recentOrders
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'HOST' }),
    User.countDocuments({ role: 'TOURIST' }),
    Workshop.countDocuments(),
    Booking.countDocuments(),
    Order.countDocuments(),
    User.countDocuments({ role: 'HOST', status: 'PENDING' }),
    Booking.aggregate([
      { $match: { bookingStatus: { $in: ['PAID', 'CHECKED_IN', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $in: ['CONFIRMED', 'PACKING', 'SHIPPING', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Booking.find()
      .populate('touristId', 'fullName email')
      .populate('workshopId', 'title')
      .sort({ createdAt: -1 })
      .limit(5),
    Order.find()
      .populate('touristId', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5)
  ]);

  const bookingMonthly = await Booking.aggregate([
    { $match: { bookingStatus: { $in: ['PAID', 'CHECKED_IN', 'COMPLETED'] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 6 }
  ]);

  const orderMonthly = await Order.aggregate([
    { $match: { orderStatus: { $in: ['CONFIRMED', 'PACKING', 'SHIPPING', 'COMPLETED'] } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } },
    { $limit: 6 }
  ]);

  const monthlyRevenueMap: Record<string, number> = {};
  bookingMonthly.forEach(item => {
    monthlyRevenueMap[item._id] = (monthlyRevenueMap[item._id] || 0) + item.revenue;
  });
  orderMonthly.forEach(item => {
    monthlyRevenueMap[item._id] = (monthlyRevenueMap[item._id] || 0) + item.revenue;
  });
  const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({
    month,
    revenue
  })).sort((a, b) => a.month.localeCompare(b.month));

  sendSuccess(res, 'Lấy thống kê dashboard thành công', {
    totalUsers,
    totalHosts,
    totalTourists,
    totalWorkshops,
    totalBookings,
    totalOrders,
    pendingHosts: pendingHostsCount,
    totalRevenue: (bookingRevAgg[0]?.total || 0) + (orderRevAgg[0]?.total || 0),
    recentBookings,
    recentOrders,
    monthlyRevenue
  });
});
