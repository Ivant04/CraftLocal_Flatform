import { Request, Response, NextFunction } from 'express';

export const errorMiddleware = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('❌ Error:', err.message || err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message).join(', ');
    res.status(400).json({ success: false, message: messages });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    res.status(400).json({ success: false, message: `${field} đã tồn tại trong hệ thống` });
    return;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    res.status(400).json({ success: false, message: 'ID không hợp lệ' });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Token không hợp lệ' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token đã hết hạn' });
    return;
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi hệ thống, vui lòng thử lại sau',
  });
};
