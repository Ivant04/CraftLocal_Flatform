import User, { IUser } from '../models/user.model';
import { generateToken } from '../utils/generateToken';

export class AuthService {
  static async register(data: { fullName: string; email: string; password: string; phone?: string; role?: string }) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error('Email đã được đăng ký');

    const status = data.role === 'HOST' ? 'PENDING' : 'ACTIVE';
    const user = await User.create({ ...data, status });

    const token = generateToken(user._id.toString(), user.role);
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword, token };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Email hoặc mật khẩu không đúng');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Email hoặc mật khẩu không đúng');

    if (user.status === 'BLOCKED') throw new Error('Tài khoản đã bị khóa');

    const token = generateToken(user._id.toString(), user.role);
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return { user: userWithoutPassword, token };
  }
}
