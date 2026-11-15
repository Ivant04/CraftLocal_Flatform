import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../utils/apiResponse";
import Timeslot from "../models/timeslot.model";
import Booking from "../models/booking.model";
import { QRService } from "../services/qr.service";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, "Lấy thông tin thành công", req.user);
});

export const getSchedules = asyncHandler(
  async (req: Request, res: Response) => {
    const timeslots = await Timeslot.find({
      tourGuideId: req.user!._id,
    })
      .populate("workshopId", "title address location images")
      .sort({ startTime: -1 });

    const timeslotIds = timeslots.map((ts) => ts._id);

    // Tính số khách đã xác nhận và số khách đang chờ thanh toán
    const [paidCounts, pendingCounts] = await Promise.all([
      Booking.aggregate([
        {
          $match: {
            timeslotId: { $in: timeslotIds },
            bookingStatus: { $in: ["PAID", "CHECKED_IN", "COMPLETED"] },
          },
        },
        { $group: { _id: "$timeslotId", totalGuests: { $sum: "$quantity" } } },
      ]),
      Booking.aggregate([
        {
          $match: {
            timeslotId: { $in: timeslotIds },
            bookingStatus: "PENDING",
          },
        },
        { $group: { _id: "$timeslotId", totalGuests: { $sum: "$quantity" } } },
      ]),
    ]);

    const paidMap = new Map(paidCounts.map((p) => [p._id.toString(), p.totalGuests]));
    const pendingMap = new Map(pendingCounts.map((p) => [p._id.toString(), p.totalGuests]));

    const enrichedTimeslots = timeslots.map((ts) => {
      const tsObj = ts.toObject();
      const realPaid = paidMap.get(ts._id.toString()) ?? ts.bookedSlots;
      const pendingGuests = pendingMap.get(ts._id.toString()) || 0;
      return {
        ...tsObj,
        bookedSlots: realPaid,
        pendingSlots: pendingGuests,
      };
    });

    sendSuccess(res, "Lấy lịch phân công", enrichedTimeslots);
  },
);

export const getCustomers = asyncHandler(
  async (req: Request, res: Response) => {
    // Kiểm tra timeslot thuộc tour guide này (hoặc HOST/ADMIN)
    const timeslot = await Timeslot.findOne({
      _id: req.params.id,
      ...(req.user?.role === "TOUR_GUIDE" ? { tourGuideId: req.user._id } : {}),
    });
    if (!timeslot)
      return sendError(
        res,
        "Khung giờ không tồn tại hoặc không thuộc quyền của bạn",
        404,
      );

    const bookings = await Booking.find({
      timeslotId: timeslot._id,
      bookingStatus: { $in: ["PAID", "CHECKED_IN", "COMPLETED", "PENDING"] },
    })
      .populate("touristId", "fullName email phone")
      .populate("ticketId", "qrToken status")
      .sort({ createdAt: -1 });

    sendSuccess(res, "Lấy danh sách khách hàng", bookings);
  },
);

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  const { qrToken } = req.body;
  if (!qrToken) return sendError(res, "Vui lòng cung cấp mã QR");

  const checkInResult = await QRService.checkIn(qrToken, req.user!._id.toString(), req.user?.role);
  sendSuccess(res, "Check-in thành công!", checkInResult);
});

export const startTimeslot = asyncHandler(
  async (req: Request, res: Response) => {
    const ts = await Timeslot.findOne({
      _id: req.params.id,
      tourGuideId: req.user!._id,
    });
    if (!ts) {
      return sendError(res, "Khung giờ không tồn tại hoặc không thuộc quyền của bạn", 404);
    }

    if (ts.status === "COMPLETED") {
      return sendError(res, "Khung giờ này đã kết thúc, không thể bắt đầu lại", 400);
    }
    if (ts.status === "ONGOING") {
      return sendError(res, "Khung giờ này đang diễn ra rồi", 400);
    }
    if (ts.status === "CANCELLED") {
      return sendError(res, "Khung giờ này đã bị hủy", 400);
    }

    const now = new Date();
    const startTime = new Date(ts.startTime);
    const endTime = new Date(ts.endTime);

    // Chặn Tour Guide bấm bắt đầu trước khi workshop diễn ra
    if (now < startTime) {
      const startTimeStr = startTime.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const startDateStr = startTime.toLocaleDateString("vi-VN");
      return sendError(
        res,
        `Chưa đến giờ bắt đầu workshop (bắt đầu lúc ${startTimeStr} ngày ${startDateStr}). Du khách có thể đến check-in sớm, nhưng Hướng dẫn viên chỉ có thể bấm 'Bắt đầu chuyến' khi đến giờ diễn ra.`,
        400,
      );
    }

    if (now > endTime) {
      ts.status = "COMPLETED";
      await ts.save();
      return sendError(
        res,
        "Khung giờ này đã quá thời gian kết thúc, không thể bắt đầu chuyến đi.",
        400,
      );
    }

    // Kiểm tra có khách đặt vé hay chưa
    const validBookingsCount = await Booking.countDocuments({
      timeslotId: ts._id,
      bookingStatus: { $in: ["PAID", "CHECKED_IN"] },
    });

    if (validBookingsCount === 0 && ts.bookedSlots === 0) {
      return sendError(
        res,
        "Khung giờ chưa có khách đặt vé thành công, không thể bắt đầu chuyến đi",
        400
      );
    }

    ts.status = "ONGOING";
    await ts.save();
    sendSuccess(res, "Bắt đầu khung giờ thành công", ts);
  },
);

export const finishTimeslot = asyncHandler(
  async (req: Request, res: Response) => {
    const timeslot = await Timeslot.findOneAndUpdate(
      { _id: req.params.id, tourGuideId: req.user!._id, status: "ONGOING" },
      { status: "COMPLETED" },
      { new: true },
    );
    if (!timeslot)
      return sendError(res, "Không thể kết thúc khung giờ này", 400);

    // Cập nhật tất cả booking CHECKED_IN thành COMPLETED
    await Booking.updateMany(
      { timeslotId: timeslot._id, bookingStatus: "CHECKED_IN" },
      { bookingStatus: "COMPLETED" },
    );

    sendSuccess(res, "Kết thúc khung giờ thành công", timeslot);
  },
);

export const getDashboard = asyncHandler(
  async (req: Request, res: Response) => {
    const guideId = req.user!._id;

    const [assignedCount, todayCount, completedCount, allMyTimeslots] =
      await Promise.all([
        Timeslot.countDocuments({ tourGuideId: guideId }),
        Timeslot.countDocuments({
          tourGuideId: guideId,
          startTime: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        }),
        Timeslot.countDocuments({ tourGuideId: guideId, status: "COMPLETED" }),
        Timeslot.find({ tourGuideId: guideId }),
      ]);

    const timeslotIds = allMyTimeslots.map((ts) => ts._id);

    const bookings = await Booking.find({
      timeslotId: { $in: timeslotIds },
      bookingStatus: { $in: ["PAID", "CHECKED_IN", "COMPLETED"] },
    });

    const numberOfCustomers = bookings.reduce((sum, b) => sum + b.quantity, 0);
    const checkedInCount = bookings
      .filter((b) => ["CHECKED_IN", "COMPLETED"].includes(b.bookingStatus))
      .reduce((sum, b) => sum + b.quantity, 0);

    sendSuccess(res, "Lấy dashboard thành công", {
      assignedSchedules: assignedCount,
      todaySchedules: todayCount,
      completedTrips: completedCount,
      numberOfCustomers,
      checkedInCount,
    });
  },
);
