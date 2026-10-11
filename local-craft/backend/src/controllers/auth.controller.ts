import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { AuthService } from '../services/auth.service';
import User from '../models/user.model';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);
  const message = req.body.role === 'HOST'
    ? 'Đăng ký thành công! Tài khoản Chủ xưởng đang chờ phê duyệt.'
    : 'Đăng ký thành công!';
  sendSuccess(res, message, result, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);
  sendSuccess(res, 'Đăng nhập thành công!', result);
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id);
  if (!user) return sendError(res, 'Người dùng không tồn tại', 404);
  sendSuccess(res, 'Lấy thông tin thành công', user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user!._id,
    { fullName, phone, avatar },
    { new: true, runValidators: true }
  );
  sendSuccess(res, 'Cập nhật thông tin thành công', user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user!._id).select('+password');
  if (!user) return sendError(res, 'Người dùng không tồn tại', 404);

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) return sendError(res, 'Mật khẩu hiện tại không đúng');

  user.password = newPassword;
  await user.save();
  sendSuccess(res, 'Đổi mật khẩu thành công');
});
