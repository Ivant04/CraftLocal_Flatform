import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse';

export const roleMiddleware = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Vui lòng đăng nhập', 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, 'Bạn không có quyền truy cập chức năng này', 403);
      return;
    }
    next();
  };
};
