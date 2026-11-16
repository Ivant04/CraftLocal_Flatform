import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import WorkshopOwnerApplication from '../models/workshopOwnerApplication.model';
import User from '../models/user.model';
import Notification from '../models/notification.model';
import { MailService } from '../services/mail.service';

// ============================================================================
// PHÍA NGƯỜI DÙNG (TOURIST / USER)
// ============================================================================

/**
 * GET /api/applications/my-application
 * Lấy hồ sơ đăng ký Chủ xưởng hiện tại của người dùng
 */
export const getMyApplication = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  // Nếu người dùng đã là HOST
  if (req.user!.role === 'HOST') {
    const existingApp = await WorkshopOwnerApplication.findOne({ userId }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Tài khoản đã là Chủ xưởng', {
      status: 'APPROVED',
      isHost: true,
      application: existingApp,
    });
  }

  const application = await WorkshopOwnerApplication.findOne({ userId }).sort({ createdAt: -1 });

  if (!application) {
    return sendSuccess(res, 'Chưa có hồ sơ đăng ký', { status: 'NONE', application: null });
  }

  return sendSuccess(res, 'Lấy thông tin hồ sơ thành công', {
    status: application.status,
    application,
  });
});

/**
 * POST /api/applications/apply
 * Nộp hoặc cập nhật hồ sơ đăng ký Chủ xưởng
 */
export const applyWorkshopOwner = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const user = await User.findById(userId);

  if (!user) {
    return sendError(res, 'Người dùng không tồn tại', 404);
  }

  if (user.role === 'HOST') {
    return sendError(res, 'Tài khoản của bạn đã là Chủ xưởng trên hệ thống.', 400);
  }

  if (user.role === 'ADMIN') {
    return sendError(res, 'Tài khoản Quản trị viên không thể đăng ký làm Chủ xưởng.', 400);
  }

  const {
    workshopName,
    ownerName,
    phone,
    email,
    workshopAddress,
    description,
    workshopImages = [],
    idCardFront,
    idCardBack,
    businessLicense,
  } = req.body;

  // Validation
  if (!workshopName || !workshopName.trim()) {
    return sendError(res, 'Vui lòng nhập tên xưởng thủ công.', 400);
  }
  if (!ownerName || !ownerName.trim()) {
    return sendError(res, 'Vui lòng nhập họ tên người đại diện.', 400);
  }
  if (!phone || !phone.trim()) {
    return sendError(res, 'Vui lòng nhập số điện thoại liên hệ.', 400);
  }
  if (!email || !email.trim()) {
    return sendError(res, 'Vui lòng nhập email liên hệ.', 400);
  }
  if (!workshopAddress || !workshopAddress.trim()) {
    return sendError(res, 'Vui lòng nhập địa chỉ xưởng sản xuất.', 400);
  }
  if (!description || !description.trim()) {
    return sendError(res, 'Vui lòng nhập mô tả về xưởng và hoạt động sản xuất.', 400);
  }

  // Check existing application
  let application = await WorkshopOwnerApplication.findOne({ userId }).sort({ createdAt: -1 });

  if (application) {
    // Không cho phép gửi nhiều hồ sơ khi đang có hồ sơ chờ duyệt
    if (application.status === 'PENDING') {
      return sendError(
        res,
        'Hồ sơ của bạn đang trong trạng thái Chờ xét duyệt. Vui lòng đợi phản hồi từ Ban quản trị.',
        400
      );
    }

    if (application.status === 'APPROVED') {
      return sendError(res, 'Hồ sơ của bạn đã được phê duyệt trước đó.', 400);
    }

    // Nếu REJECTED -> Cập nhật và gửi lại (REJECTED -> PENDING)
    application.workshopName = workshopName.trim();
    application.ownerName = ownerName.trim();
    application.phone = phone.trim();
    application.email = email.trim().toLowerCase();
    application.workshopAddress = workshopAddress.trim();
    application.description = description.trim();
    application.workshopImages = Array.isArray(workshopImages) ? workshopImages : [];
    application.idCardFront = idCardFront;
    application.idCardBack = idCardBack;
    application.businessLicense = businessLicense;
    application.status = 'PENDING';
    application.rejectionReason = undefined;
    application.reviewedBy = undefined;
    application.reviewedAt = undefined;

    await application.save();
  } else {
    // Tạo hồ sơ mới PENDING
    application = await WorkshopOwnerApplication.create({
      userId,
      workshopName: workshopName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      workshopAddress: workshopAddress.trim(),
      description: description.trim(),
      workshopImages: Array.isArray(workshopImages) ? workshopImages : [],
      idCardFront,
      idCardBack,
      businessLicense,
      status: 'PENDING',
    });
  }

  // Đồng bộ tạm vào user.hostProfile
  if (!user.hostProfile) user.hostProfile = {};
  user.hostProfile.workshopName = workshopName.trim();
  user.hostProfile.ownerName = ownerName.trim();
  user.hostProfile.ownerPhone = phone.trim();
  user.hostProfile.description = description.trim();
  user.hostProfile.workshopImages = Array.isArray(workshopImages) ? workshopImages : [];
  user.hostProfile.identityCardFront = idCardFront;
  user.hostProfile.identityCardBack = idCardBack;
  user.hostProfile.certificate = businessLicense;
  user.hostProfile.rejectedReason = undefined;
  await user.save();

  return sendSuccess(res, 'Gửi hồ sơ đăng ký Chủ xưởng thành công! Vui lòng chờ Ban quản trị xét duyệt.', application, 201);
});

// ============================================================================
// PHÍA ADMIN – QUẢN LÝ HỒ SƠ ĐĂNG KÝ
// ============================================================================

/**
 * GET /api/admin/applications
 * Danh sách hồ sơ đăng ký Chủ xưởng (lọc trạng thái, tìm kiếm, phân trang)
 */
export const getAdminApplications = asyncHandler(async (req: Request, res: Response) => {
  const { status = 'ALL', search = '', page = '1', limit = '10' } = req.query;

  const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit as string, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  if (search && typeof search === 'string' && search.trim()) {
    const searchRegex = new RegExp(search.trim(), 'i');
    filter.$or = [
      { workshopName: searchRegex },
      { ownerName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const [applications, total, countAll, countPending, countApproved, countRejected] = await Promise.all([
    WorkshopOwnerApplication.find(filter)
      .populate('userId', 'fullName email phone avatar')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    WorkshopOwnerApplication.countDocuments(filter),
    WorkshopOwnerApplication.countDocuments(),
    WorkshopOwnerApplication.countDocuments({ status: 'PENDING' }),
    WorkshopOwnerApplication.countDocuments({ status: 'APPROVED' }),
    WorkshopOwnerApplication.countDocuments({ status: 'REJECTED' }),
  ]);

  const totalPages = Math.ceil(total / limitNum) || 1;

  return sendSuccess(res, 'Lấy danh sách hồ sơ thành công', {
    applications,
    total,
    page: pageNum,
    limit: limitNum,
    totalPages,
    counts: {
      all: countAll,
      pending: countPending,
      approved: countApproved,
      rejected: countRejected,
    },
  });
});

/**
 * GET /api/admin/applications/:id
 * Chi tiết một hồ sơ đăng ký
 */
export const getAdminApplicationById = asyncHandler(async (req: Request, res: Response) => {
  const application = await WorkshopOwnerApplication.findById(req.params.id)
    .populate('userId', 'fullName email phone avatar role status createdAt')
    .populate('reviewedBy', 'fullName email');

  if (!application) {
    return sendError(res, 'Không tìm thấy hồ sơ đăng ký', 404);
  }

  return sendSuccess(res, 'Lấy chi tiết hồ sơ thành công', application);
});

/**
 * PUT /api/admin/applications/:id/approve
 * Phê duyệt hồ sơ Chủ xưởng
 */
export const approveApplication = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!._id;
  const application = await WorkshopOwnerApplication.findById(req.params.id);

  if (!application) {
    return sendError(res, 'Không tìm thấy hồ sơ đăng ký', 404);
  }

  if (application.status === 'APPROVED') {
    return sendError(res, 'Hồ sơ này đã được phê duyệt trước đó.', 400);
  }

  // 1. Cập nhật hồ sơ
  application.status = 'APPROVED';
  application.reviewedBy = adminId;
  application.reviewedAt = new Date();
  application.rejectionReason = undefined;
  await application.save();

  // 2. Cấp quyền HOST (WORKSHOP_OWNER) cho người dùng
  const user = await User.findById(application.userId);
  if (user) {
    user.role = 'HOST';
    user.status = 'ACTIVE';

    if (!user.hostProfile) user.hostProfile = {};
    user.hostProfile.workshopName = application.workshopName;
    user.hostProfile.ownerName = application.ownerName;
    user.hostProfile.ownerPhone = application.phone;
    user.hostProfile.description = application.description;
    user.hostProfile.workshopImages = application.workshopImages;
    user.hostProfile.identityCardFront = application.idCardFront;
    user.hostProfile.identityCardBack = application.idCardBack;
    user.hostProfile.certificate = application.businessLicense;
    user.hostProfile.approvedAt = new Date();
    user.hostProfile.approvedBy = adminId;
    user.hostProfile.rejectedReason = undefined;

    if (!user.hostProfile.businessAddress) {
      user.hostProfile.businessAddress = {
        fullAddress: application.workshopAddress,
        addressLine: application.workshopAddress,
        city: '',
        province: '',
        country: 'Việt Nam',
      };
    } else {
      user.hostProfile.businessAddress.fullAddress = application.workshopAddress;
    }

    await user.save();

    // 3. Tạo thông báo in-app
    try {
      await Notification.create({
        userId: user._id,
        title: 'Hồ sơ Chủ xưởng đã được phê duyệt 🎉',
        message: `Chúc mừng bạn! Hồ sơ đăng ký xưởng "${application.workshopName}" đã được phê duyệt. Bạn đã trở thành Chủ xưởng nghệ nhân trên CraftLocal.`,
        type: 'SYSTEM',
        relatedId: application._id,
      });
    } catch (e: any) {
      console.error('[Notification] Error creating approval notification:', e.message);
    }

    // 4. Gửi email thông báo phê duyệt
    try {
      await MailService.sendHostApplicationApprovedEmail({
        hostEmail: application.email || user.email,
        hostName: application.ownerName || user.fullName,
        workshopName: application.workshopName,
        approvedAt: new Date().toLocaleDateString('vi-VN'),
      });
    } catch (mailErr: any) {
      console.error('[MailService] Error sending approval email:', mailErr.message);
    }
  }

  return sendSuccess(res, 'Phê duyệt hồ sơ Chủ xưởng thành công!', application);
});

/**
 * PUT /api/admin/applications/:id/reject
 * Từ chối hồ sơ Chủ xưởng kèm lý do
 */
export const rejectApplication = asyncHandler(async (req: Request, res: Response) => {
  const adminId = req.user!._id;
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return sendError(res, 'Vui lòng nhập lý do từ chối hồ sơ.', 400);
  }

  const application = await WorkshopOwnerApplication.findById(req.params.id);

  if (!application) {
    return sendError(res, 'Không tìm thấy hồ sơ đăng ký', 404);
  }

  // 1. Cập nhật hồ sơ
  application.status = 'REJECTED';
  application.rejectionReason = reason.trim();
  application.reviewedBy = adminId;
  application.reviewedAt = new Date();
  await application.save();

  // 2. Giữ nguyên quyền TOURIST cho tài khoản
  const user = await User.findById(application.userId);
  if (user) {
    if (user.role !== 'HOST') {
      user.role = 'TOURIST';
    }
    if (!user.hostProfile) user.hostProfile = {};
    user.hostProfile.rejectedReason = reason.trim();
    await user.save();

    // 3. Tạo thông báo in-app
    try {
      await Notification.create({
        userId: user._id,
        title: 'Thông báo xét duyệt hồ sơ Chủ xưởng',
        message: `Hồ sơ đăng ký xưởng "${application.workshopName}" chưa được phê duyệt. Lý do: ${reason.trim()}`,
        type: 'SYSTEM',
        relatedId: application._id,
      });
    } catch (e: any) {
      console.error('[Notification] Error creating rejection notification:', e.message);
    }

    // 4. Gửi email thông báo từ chối kèm lý do
    try {
      await MailService.sendHostApplicationRejectedEmail({
        hostEmail: application.email || user.email,
        hostName: application.ownerName || user.fullName,
        workshopName: application.workshopName,
        rejectionReason: reason.trim(),
      });
    } catch (mailErr: any) {
      console.error('[MailService] Error sending rejection email:', mailErr.message);
    }
  }

  return sendSuccess(res, 'Đã từ chối hồ sơ và gửi thông báo tới người dùng.', application);
});
