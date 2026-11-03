import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import Timeslot from '../models/timeslot.model';
import Workshop from '../models/workshop.model';
import User from '../models/user.model';

// PUBLIC: Lấy timeslots theo workshop
export const getTimeslotsByWorkshop = asyncHandler(async (req: Request, res: Response) => {
  const timeslots = await Timeslot.find({
    workshopId: req.params.workshopId,
    status: { $in: ['AVAILABLE', 'FULL'] },
    startTime: { $gte: new Date() },
  }).populate('tourGuideId', 'fullName').sort({ startTime: 1 });
  sendSuccess(res, 'Lấy danh sách khung giờ', timeslots);
});

// HOST: Tạo timeslot
export const createTimeslot = asyncHandler(async (req: Request, res: Response) => {
  const workshop = await Workshop.findOne({ _id: req.body.workshopId, hostId: req.user!._id });
  if (!workshop) return sendError(res, 'Workshop không tồn tại hoặc bạn không có quyền', 404);

  const timeslotData = { ...req.body };
  if (new Date(timeslotData.endTime) <= new Date(timeslotData.startTime)) {
    return sendError(res, 'Thời gian kết thúc phải sau thời gian bắt đầu', 400);
  }

  if (!timeslotData.tourGuideId || timeslotData.tourGuideId === '') {
    delete timeslotData.tourGuideId;
  } else {
    // Kiểm tra tour guide có thuộc host này không
    const guide = await User.findOne({ _id: timeslotData.tourGuideId, role: 'TOUR_GUIDE', hostId: req.user!._id });
    if (!guide) return sendError(res, 'Hướng dẫn viên không thuộc quản lý của bạn', 400);
  }

  const timeslot = await Timeslot.create({
    ...timeslotData,
    hostId: req.user!._id,
    totalSlots: Number(timeslotData.totalSlots),
    price: Number(timeslotData.price),
    availableSlots: Number(timeslotData.totalSlots),
  });
  sendSuccess(res, 'Tạo khung giờ thành công', timeslot, 201);
});

// HOST: Lấy timeslots của mình
export const getMyTimeslots = asyncHandler(async (req: Request, res: Response) => {
  const { workshopId } = req.query;
  const filter: any = { hostId: req.user!._id };
  if (workshopId) filter.workshopId = workshopId;

  const timeslots = await Timeslot.find(filter)
    .populate('workshopId', 'title')
    .populate('tourGuideId', 'fullName')
    .sort({ startTime: -1 });
  sendSuccess(res, 'Lấy danh sách khung giờ', timeslots);
});

// HOST: Cập nhật timeslot
export const updateTimeslot = asyncHandler(async (req: Request, res: Response) => {
  const current = await Timeslot.findOne({ _id: req.params.id, hostId: req.user!._id });
  if (!current) return sendError(res, 'Khung giờ không tồn tại', 404);
  if (current.status === 'COMPLETED') {
    return sendError(res, 'Không thể chỉnh sửa khung giờ đã kết thúc', 400);
  }

  const updateData = { ...req.body };

  // Validate start and end times
  const start = updateData.startTime ? new Date(updateData.startTime) : new Date(current.startTime);
  const end = updateData.endTime ? new Date(updateData.endTime) : new Date(current.endTime);
  if (end <= start) {
    return sendError(res, 'Thời gian kết thúc phải sau thời gian bắt đầu', 400);
  }

  if (updateData.totalSlots !== undefined) {
    updateData.totalSlots = Number(updateData.totalSlots);
    if (updateData.totalSlots < current.bookedSlots) {
      return sendError(res, `Tổng số chỗ không được nhỏ hơn số chỗ đã đặt (${current.bookedSlots})`, 400);
    }
    updateData.availableSlots = updateData.totalSlots - current.bookedSlots;
  }
  if (updateData.price !== undefined) {
    updateData.price = Number(updateData.price);
  }

  if (updateData.tourGuideId === '' || !updateData.tourGuideId) {
    updateData.tourGuideId = null;
  } else {
    // Kiểm tra tour guide
    const guide = await User.findOne({ _id: updateData.tourGuideId, role: 'TOUR_GUIDE', hostId: req.user!._id });
    if (!guide) return sendError(res, 'Hướng dẫn viên không thuộc quản lý của bạn', 400);
  }

  const timeslot = await Timeslot.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user!._id },
    updateData,
    { new: true, runValidators: true }
  ).populate('tourGuideId', 'fullName').populate('workshopId', 'title');

  sendSuccess(res, 'Cập nhật khung giờ thành công', timeslot);
});

export const deleteTimeslot = asyncHandler(async (req: Request, res: Response) => {
  const current = await Timeslot.findOne({ _id: req.params.id, hostId: req.user!._id });
  if (!current) return sendError(res, 'Khung giờ không tồn tại', 404);

  if (current.bookedSlots > 0) {
    // Nếu đã có booking, chỉ chuyển sang CANCELLED
    current.status = 'CANCELLED';
    await current.save();
    return sendSuccess(res, 'Hủy khung giờ thành công (trạng thái chuyển sang Đã Hủy vì đã có khách đặt)');
  } else {
    // Nếu chưa có booking, xóa cứng
    await Timeslot.deleteOne({ _id: req.params.id, hostId: req.user!._id });
    return sendSuccess(res, 'Xóa khung giờ thành công');
  }
});

// HOST: Gán Tour Guide vào timeslot
export const assignGuide = asyncHandler(async (req: Request, res: Response) => {
  const { tourGuideId } = req.body;

  const timeslot = await Timeslot.findOne({ _id: req.params.id, hostId: req.user!._id });
  if (!timeslot) return sendError(res, 'Khung giờ không tồn tại', 404);
  if (['CANCELLED', 'COMPLETED'].includes(timeslot.status)) {
    return sendError(res, 'Không thể gán HDV cho khung giờ đã hủy hoặc hoàn thành', 400);
  }

  if (tourGuideId && tourGuideId !== '') {
    // Kiểm tra tour guide thuộc host này
    const guide = await User.findOne({ _id: tourGuideId, role: 'TOUR_GUIDE', hostId: req.user!._id });
    if (!guide) return sendError(res, 'Hướng dẫn viên không hợp lệ hoặc không thuộc quyền quản lý của bạn', 400);
    timeslot.tourGuideId = tourGuideId;
  } else {
    timeslot.tourGuideId = undefined;
  }

  await timeslot.save();
  const populatedTimeslot = await Timeslot.findById(timeslot._id)
    .populate('tourGuideId', 'fullName')
    .populate('workshopId', 'title');

  sendSuccess(res, 'Gán hướng dẫn viên thành công', populatedTimeslot);
});
