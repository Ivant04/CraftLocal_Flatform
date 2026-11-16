import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess, sendError } from "../utils/apiResponse";
import Review from "../models/review.model";
import Booking from "../models/booking.model";
import Workshop from "../models/workshop.model";
import User from "../models/user.model";
import { MailService } from "../services/mail.service";

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const { bookingId, rating, comment, images } = req.body;

    // Kiểm tra booking thuộc tourist
    const booking = await Booking.findOne({
      _id: bookingId,
      touristId: req.user!._id,
    });
    if (!booking)
      return sendError(
        res,
        "Booking không tồn tại hoặc không thuộc về bạn",
        404,
      );

    // Kiểm tra trạng thái booking
    if (!["CHECKED_IN", "COMPLETED"].includes(booking.bookingStatus)) {
      return sendError(
        res,
        "Chỉ có thể đánh giá sau khi đã check-in hoặc hoàn thành",
      );
    }

    // Kiểm tra đã review chưa
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview)
      return sendError(res, "Bạn đã đánh giá booking này rồi");

    const review = await Review.create({
      touristId: req.user!._id,
      hostId: booking.hostId,
      workshopId: booking.workshopId,
      bookingId,
      rating,
      comment,
      images: images || [],
    });

    // Cập nhật averageRating workshop
    const reviews = await Review.find({
      workshopId: booking.workshopId,
      status: "VISIBLE",
    });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Workshop.findByIdAndUpdate(booking.workshopId, {
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });

    // Gửi email thông báo cho chủ xưởng về đánh giá mới (bất đồng bộ)
    (async () => {
      try {
        const [host, ws] = await Promise.all([
          User.findById(booking.hostId),
          Workshop.findById(booking.workshopId),
        ]);
        if (host?.email) {
          MailService.sendNewReviewAlertToHost({
            hostEmail: host.email,
            hostName: host.fullName || 'Quý Chủ xưởng',
            workshopTitle: ws?.title || 'Workshop thủ công',
            touristName: req.user!.fullName || 'Du khách',
            rating,
            comment: comment || '',
          }).catch((err) => console.error('[Mail Error - Review Alert]', err.message));
        }
      } catch (err: any) {
        console.error('[Mail Error - Review Notification]', err.message);
      }
    })();

    sendSuccess(res, "Đánh giá thành công", review, 201);
  },
);

export const replyReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!message)
    return sendError(res, "Vui lòng cung cấp nội dung phản hồi", 400);

  const review = await Review.findOne({ _id: id });
  if (!review) return sendError(res, "Đánh giá không tồn tại", 404);

  // Kiểm tra workshop thuộc host đang đăng nhập
  const workshop = await Workshop.findOne({
    _id: review.workshopId,
    hostId: req.user!._id,
  });
  if (!workshop)
    return sendError(res, "Bạn không có quyền phản hồi đánh giá này", 403);

  review.hostReply = {
    message,
    repliedAt: new Date(),
  };
  await review.save();

  sendSuccess(res, "Phản hồi đánh giá thành công", review);
});

export const getWorkshopReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const reviews = await Review.find({
      workshopId: req.params.workshopId,
      status: "VISIBLE",
    })
      .populate("touristId", "fullName avatar")
      .sort({ createdAt: -1 });
    sendSuccess(res, "Lấy danh sách đánh giá", reviews);
  },
);
