import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';
import { env } from '../config/env';
import { sendError } from '../utils/apiResponse';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Vui lòng đăng nhập để tiếp tục', 401);
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
    const user = await User.findById(decoded.userId).select('+password');

    if (!user) {
      sendError(res, 'Người dùng không tồn tại', 401);
      return;
    }

    if (user.status === 'BLOCKED') {
      sendError(res, 'Tài khoản đã bị khóa', 403);
      return;
    }

    if (user.status === 'PENDING') {
      const isAllowedPath = req.originalUrl.endsWith('/profile') || req.path === '/profile';
      if (!isAllowedPath) {
        sendError(res, 'Tài khoản đang chờ phê duyệt. Không thể thực hiện thao tác này.', 403);
        return;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    sendError(res, 'Token không hợp lệ hoặc đã hết hạn', 401);
  }
};
