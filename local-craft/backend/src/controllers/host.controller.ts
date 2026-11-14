import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import User from '../models/user.model';
import Booking from '../models/booking.model';
import Order from '../models/order.model';
import Workshop from '../models/workshop.model';
import Timeslot from '../models/timeslot.model';

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const hostId = req.user!._id;
  const [
    totalWorkshops,
    totalTimeslots,
    totalBookings,
    totalOrders,
    bookingRevenue,
    orderRevenue,
    pendingOrders,
    todaySchedules,
    topWorkshops
  ] = await Promise.all([
    Workshop.countDocuments({ hostId }),
    Timeslot.countDocuments({ hostId }),
    Booking.countDocuments({ hostId }),
    Order.countDocuments({ hostId }),
    Booking.aggregate([
      { $match: { hostId, bookingStatus: { $in: ['PAID', 'CHECKED_IN', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { hostId, orderStatus: { $in: ['CONFIRMED', 'PACKING', 'SHIPPING', 'COMPLETED'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Order.countDocuments({ hostId, orderStatus: 'PENDING' }),
    Timeslot.find({
      hostId,
      startTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }).populate('workshopId', 'title').populate('tourGuideId', 'fullName'),
    Workshop.find({ hostId }).sort({ totalBookings: -1, averageRating: -1 }).limit(5)
  ]);

  const totalRevenue = (bookingRevenue[0]?.total || 0) + (orderRevenue[0]?.total || 0);

  sendSuccess(res, 'Lấy dashboard thành công', {
    totalWorkshops,
    totalTimeslots,
    totalBookings,
    totalOrders,
    totalRevenue,
    pendingOrders,
    todaySchedules,
    topWorkshops
  });
});

export const createTourGuide = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, phone } = req.body;
  if (!email || !fullName) {
    return sendError(res, 'Vui lòng nhập họ tên và email', 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    if (existing.hostId && existing.hostId.toString() === req.user!._id.toString()) {
      return sendError(res, 'Hướng dẫn viên này đã thuộc xưởng của bạn', 400);
    }
    if (existing.hostId) {
      return sendError(res, 'Tài khoản này hiện đang thuộc một xưởng khác', 400);
    }
    // Link existing user without host into this host's team
    existing.role = 'TOUR_GUIDE';
    existing.hostId = req.user!._id;
    existing.status = 'ACTIVE';
    if (fullName) existing.fullName = String(fullName).trim();
    if (phone) existing.phone = String(phone).trim();
    if (password && String(password).trim().length >= 6) {
      existing.password = String(password).trim();
    }
    await existing.save();

    const obj = existing.toObject();
    const { password: _, ...result } = obj;
    return sendSuccess(res, 'Đã liên kết hướng dẫn viên vào xưởng', result, 200);
  }

  if (!password || String(password).trim().length < 6) {
    return sendError(res, 'Mật khẩu phải từ 6 ký tự trở lên', 400);
  }

  const tourGuide = await User.create({
    fullName: String(fullName).trim(),
    email: normalizedEmail,
    password: String(password).trim(),
    phone: phone ? String(phone).trim() : '',
    role: 'TOUR_GUIDE',
    status: 'ACTIVE',
    hostId: req.user!._id,
    createdBy: req.user!._id,
  });

  const obj = tourGuide.toObject();
  const { password: _, ...result } = obj;
  sendSuccess(res, 'Tạo hướng dẫn viên thành công', result, 201);
});

export const inviteTourGuide = asyncHandler(async (req: Request, res: Response) => {
  const { email, fullName, phone } = req.body;
  if (!email) {
    return sendError(res, 'Vui lòng nhập email của hướng dẫn viên', 400);
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    if (existing.hostId && existing.hostId.toString() === req.user!._id.toString()) {
      return sendError(res, 'Hướng dẫn viên này đã có trong danh sách xưởng của bạn', 400);
    }
    if (existing.hostId) {
      return sendError(res, 'Hướng dẫn viên này hiện đang trực thuộc một xưởng khác', 400);
    }

    existing.role = 'TOUR_GUIDE';
    existing.hostId = req.user!._id;
    existing.status = 'ACTIVE';
    if (fullName && !existing.fullName) existing.fullName = String(fullName).trim();
    if (phone && !existing.phone) existing.phone = String(phone).trim();
    await existing.save();

    const { password: _, ...result } = existing.toObject();
    return sendSuccess(res, `Đã thêm hướng dẫn viên ${existing.fullName || existing.email} vào xưởng`, result, 200);
  }

  // Create new guide with temporary password
  const tempPassword = `Craft@${Math.floor(1000 + Math.random() * 9000)}`;
  const newGuide = await User.create({
    fullName: (fullName && String(fullName).trim()) || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    password: tempPassword,
    phone: phone ? String(phone).trim() : '',
    role: 'TOUR_GUIDE',
    status: 'ACTIVE',
    hostId: req.user!._id,
    createdBy: req.user!._id,
  });

  const { password: _, ...result } = newGuide.toObject();
  return sendSuccess(
    res,
    `Đã tạo tài khoản cho hướng dẫn viên mới. Mật khẩu tạm thời: ${tempPassword}`,
    { ...result, tempPassword },
    201
  );
});

export const getTourGuides = asyncHandler(async (req: Request, res: Response) => {
  const guides = await User.find({ role: 'TOUR_GUIDE', hostId: req.user!._id })
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  const guideIds = guides.map((g) => g._id);
  const slotCounts = await Timeslot.aggregate([
    { $match: { tourGuideId: { $in: guideIds } } },
    { $group: { _id: '$tourGuideId', count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  slotCounts.forEach((sc) => countMap.set(String(sc._id), sc.count));

  const enriched = guides.map((g) => ({
    ...g,
    assignedSlotsCount: countMap.get(String(g._id)) || 0,
  }));

  sendSuccess(res, 'Lấy danh sách hướng dẫn viên', enriched);
});

export const getTourGuideDetail = asyncHandler(async (req: Request, res: Response) => {
  const guide = await User.findOne({ _id: req.params.id, hostId: req.user!._id, role: 'TOUR_GUIDE' })
    .select('-password')
    .lean();
  if (!guide) return sendError(res, 'Không tìm thấy hướng dẫn viên trong xưởng của bạn', 404);

  const timeslots = await Timeslot.find({ tourGuideId: guide._id, hostId: req.user!._id })
    .populate('workshopId', 'title locationLabel address images')
    .sort({ startTime: -1 })
    .lean();

  sendSuccess(res, 'Chi tiết hướng dẫn viên', { guide, timeslots });
});

export const updateTourGuide = asyncHandler(async (req: Request, res: Response) => {
  const guide = await User.findOne({ _id: req.params.id, hostId: req.user!._id, role: 'TOUR_GUIDE' });
  if (!guide) return sendError(res, 'Không tìm thấy hướng dẫn viên trong xưởng của bạn', 404);

  const { fullName, phone, status, password } = req.body;
  if (fullName !== undefined) guide.fullName = String(fullName).trim();
  if (phone !== undefined) guide.phone = String(phone).trim();
  if (status && ['ACTIVE', 'BLOCKED'].includes(status)) {
    guide.status = status;
  }
  if (password && String(password).trim().length >= 6) {
    guide.password = String(password).trim();
  }

  await guide.save();
  const { password: _, ...result } = guide.toObject();
  sendSuccess(res, 'Cập nhật thông tin hướng dẫn viên thành công', result);
});

export const deleteTourGuide = asyncHandler(async (req: Request, res: Response) => {
  const guide = await User.findOne({ _id: req.params.id, hostId: req.user!._id, role: 'TOUR_GUIDE' });
  if (!guide) return sendError(res, 'Không tìm thấy hướng dẫn viên trong xưởng của bạn', 404);

  // Unassign from any upcoming timeslots of this host
  await Timeslot.updateMany(
    { tourGuideId: guide._id, hostId: req.user!._id, status: { $in: ['AVAILABLE', 'FULL'] } },
    { $unset: { tourGuideId: 1 } }
  );

  // Unlink hostId so they are removed from this host's team
  guide.hostId = undefined;
  await guide.save();

  sendSuccess(res, 'Đã gỡ hướng dẫn viên khỏi xưởng thành công', { id: req.params.id });
});

export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ hostId: req.user!._id })
    .populate('touristId', 'fullName email phone')
    .sort({ createdAt: -1 });
  sendSuccess(res, 'Lấy danh sách đơn hàng', orders);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await Order.findOne({ _id: req.params.id, hostId: req.user!._id });
  if (!order) return sendError(res, 'Đơn hàng không tồn tại', 404);

  const now = new Date();
  if (status === 'SHIPPING') order.shippedAt = now;
  if (status === 'COMPLETED') order.completedAt = now;
  if (status === 'CANCELLED') order.cancelledAt = now;

  order.orderStatus = status;
  await order.save();
  sendSuccess(res, 'Cập nhật trạng thái đơn hàng thành công', order);
});
