import crypto from 'crypto';
import User, { IUser } from '../models/user.model';
import { env } from '../config/env';
import { generateToken } from '../utils/generateToken';

interface GoogleProfile {
  googleId: string;
  email: string;
  fullName: string;
  avatar?: string;
}

class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

const buildAuthResponse = (user: IUser) => {
  const token = generateToken(user._id.toString(), user.role);
  const userObj = user.toObject();
  const { password: _, ...userWithoutPassword } = userObj;
  return { user: userWithoutPassword, token };
};

export class AuthService {
  static async register(data: { fullName: string; email: string; password: string; phone?: string; role?: string }) {
    const email = data.email.toLowerCase().trim();
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AuthError('Email đã được đăng ký', 400);

    const status = data.role === 'HOST' ? 'PENDING' : 'ACTIVE';
    const user = await User.create({ ...data, email, status });

    return buildAuthResponse(user);
  }

  static async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) throw new AuthError('Email hoặc mật khẩu không đúng', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AuthError('Email hoặc mật khẩu không đúng', 401);

    if (user.status === 'BLOCKED') throw new AuthError('Tài khoản đã bị khóa', 403);
    if (user.status === 'PENDING') throw new AuthError('Tài khoản Chủ xưởng đang chờ Quản trị viên duyệt', 403);

    return buildAuthResponse(user);
  }

  /**
   * Verifies a Google ID token (`credential`) or OAuth access token directly against Google APIs.
   */
  static async verifyGoogleToken(params: { accessToken?: string; idToken?: string; credential?: string }): Promise<GoogleProfile> {
    const rawIdToken = params.idToken || params.credential;

    if (rawIdToken) {
      const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(rawIdToken)}`);
      if (!res.ok) throw new AuthError('Mã xác thực Google không hợp lệ hoặc đã hết hạn', 401);
      const data = (await res.json()) as Record<string, any>;
      if (env.GOOGLE_CLIENT_ID && data.aud !== env.GOOGLE_CLIENT_ID) {
        throw new AuthError('Google Client ID không khớp với cấu hình hệ thống', 401);
      }
      if (!data.email || (data.email_verified !== 'true' && data.email_verified !== true)) {
        throw new AuthError('Email Google chưa được xác minh', 401);
      }
      return {
        googleId: data.sub,
        email: String(data.email).toLowerCase().trim(),
        fullName: data.name || String(data.email).split('@')[0],
        avatar: data.picture,
      };
    }

    if (params.accessToken) {
      const tokenInfoRes = await fetch(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(params.accessToken)}`
      );
      if (!tokenInfoRes.ok) throw new AuthError('Access token Google không hợp lệ hoặc đã hết hạn', 401);
      const tokenInfo = (await tokenInfoRes.json()) as Record<string, any>;
      const tokenAudience = tokenInfo.aud || tokenInfo.azp;
      if (env.GOOGLE_CLIENT_ID && tokenAudience && tokenAudience !== env.GOOGLE_CLIENT_ID) {
        throw new AuthError('Google Client ID không khớp với cấu hình hệ thống', 401);
      }

      const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${params.accessToken}` },
      });
      if (!profileRes.ok) throw new AuthError('Không thể lấy thông tin tài khoản Google', 401);
      const profile = (await profileRes.json()) as Record<string, any>;
      if (!profile.email || profile.email_verified === false) {
        throw new AuthError('Email Google chưa được xác minh', 401);
      }

      return {
        googleId: profile.sub,
        email: String(profile.email).toLowerCase().trim(),
        fullName: profile.name || String(profile.email).split('@')[0],
        avatar: profile.picture,
      };
    }

    throw new AuthError('Thiếu mã xác thực Google', 400);
  }

  /**
   * Authenticates or registers a user via a verified Google profile.
   */
  static async loginWithGoogle(params: {
    accessToken?: string;
    idToken?: string;
    credential?: string;
    role?: 'TOURIST' | 'HOST';
  }) {
    const profile = await AuthService.verifyGoogleToken(params);
    let user = await User.findOne({ email: profile.email });

    if (user) {
      if (user.status === 'BLOCKED') throw new AuthError('Tài khoản đã bị khóa', 403);
      let updated = false;
      if (!user.googleId) {
        user.googleId = profile.googleId;
        updated = true;
      }
      if (!user.avatar && profile.avatar) {
        user.avatar = profile.avatar;
        updated = true;
      }
      user.lastLoginAt = new Date();
      if (updated || user.isModified('lastLoginAt')) {
        await user.save();
      }
      return buildAuthResponse(user);
    }

    const role = params.role === 'HOST' ? 'HOST' : 'TOURIST';
    const status = role === 'HOST' ? 'PENDING' : 'ACTIVE';
    user = await User.create({
      fullName: profile.fullName,
      email: profile.email,
      password: crypto.randomBytes(32).toString('hex'),
      avatar: profile.avatar,
      googleId: profile.googleId,
      role,
      status,
      lastLoginAt: new Date(),
    });

    return buildAuthResponse(user);
  }

  /**
   * Exchanges an OAuth2 authorization code when server-side redirect flow is configured.
   */
  static async exchangeGoogleCode(code: string) {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new AuthError('Máy chủ chưa cấu hình GOOGLE_CLIENT_SECRET cho OAuth redirect flow', 400);
    }
    const redirectUri = `${env.API_URL}/api/auth/google/callback`;
    const body = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!tokenRes.ok) {
      throw new AuthError('Không thể xác thực mã ủy quyền với Google', 401);
    }
    const tokenData = (await tokenRes.json()) as { access_token?: string; id_token?: string };
    return AuthService.loginWithGoogle({
      idToken: tokenData.id_token,
      accessToken: tokenData.access_token,
    });
  }
}
