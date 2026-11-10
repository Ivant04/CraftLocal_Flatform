import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};
