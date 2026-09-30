import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import Timeslot from '../models/timeslot.model';
import Booking from '../models/booking.model';
import { QRService } from '../services/qr.service';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, 'Lấy thông tin thành công', req.user);
});

export const getSchedules = asyncHandler(async (req: Request, res: Response) => {
  const timeslots = await Timeslot.find({
    tourGuideId: req.user!._id,
  })
    .populate('workshopId', 'title address location images')
    .sort({ startTime: -1 });
  sendSuccess(res, 'Lấy lịch phân công', timeslots);
});

export const getCustomers = asyncHandler(async (req: Request, res: Response) => {
  // Kiểm tra timeslot thuộc tour guide này
  const timeslot = await Timeslot.findOne({ _id: req.params.id, tourGuideId: req.user!._id });
  if (!timeslot) return sendError(res, 'Khung giờ không tồn tại hoặc không thuộc quyền của bạn', 404);

  const bookings = await Booking.find({
    timeslotId: timeslot._id,
    bookingStatus: { $in: ['PAID', 'CHECKED_IN', 'COMPLETED'] },
  }).populate('touristId', 'fullName email phone');

  sendSuccess(res, 'Lấy danh sách khách hàng', bookings);
});

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  const { qrToken } = req.body;
  if (!qrToken) return sendError(res, 'Vui lòng cung cấp mã QR');

  const ticket = await QRService.checkIn(qrToken, req.user!._id.toString());
  sendSuccess(res, 'Check-in thành công!', ticket);
});

export const startTimeslot = asyncHandler(async (req: Request, res: Response) => {
  const timeslot = await Timeslot.findOneAndUpdate(
    { _id: req.params.id, tourGuideId: req.user!._id, status: { $in: ['AVAILABLE', 'FULL'] } },
    { status: 'ONGOING' },
    { new: true }
  );
  if (!timeslot) return sendError(res, 'Không thể bắt đầu khung giờ này', 400);
  sendSuccess(res, 'Bắt đầu khung giờ thành công', timeslot);
});

export const finishTimeslot = asyncHandler(async (req: Request, res: Response) => {
  const timeslot = await Timeslot.findOneAndUpdate(
    { _id: req.params.id, tourGuideId: req.user!._id, status: 'ONGOING' },
    { status: 'COMPLETED' },
    { new: true }
  );
  if (!timeslot) return sendError(res, 'Không thể kết thúc khung giờ này', 400);

  // Cập nhật tất cả booking CHECKED_IN thành COMPLETED
  await Booking.updateMany(
    { timeslotId: timeslot._id, bookingStatus: 'CHECKED_IN' },
    { bookingStatus: 'COMPLETED' }
  );

  sendSuccess(res, 'Kết thúc khung giờ thành công', timeslot);
});

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const guideId = req.user!._id;

  const [
    assignedCount,
    todayCount,
    completedCount,
    allMyTimeslots
  ] = await Promise.all([
    Timeslot.countDocuments({ tourGuideId: guideId }),
    Timeslot.countDocuments({
      tourGuideId: guideId,
      startTime: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999))
      }
    }),
    Timeslot.countDocuments({ tourGuideId: guideId, status: 'COMPLETED' }),
    Timeslot.find({ tourGuideId: guideId })
  ]);

  const timeslotIds = allMyTimeslots.map(ts => ts._id);

  const bookings = await Booking.find({
    timeslotId: { $in: timeslotIds },
    bookingStatus: { $in: ['PAID', 'CHECKED_IN', 'COMPLETED'] }
  });

  const numberOfCustomers = bookings.reduce((sum, b) => sum + b.quantity, 0);
  const checkedInCount = bookings.filter(b => ['CHECKED_IN', 'COMPLETED'].includes(b.bookingStatus)).reduce((sum, b) => sum + b.quantity, 0);

  sendSuccess(res, 'Lấy dashboard thành công', {
    assignedSchedules: assignedCount,
    todaySchedules: todayCount,
    completedTrips: completedCount,
    numberOfCustomers,
    checkedInCount,
  });
});
