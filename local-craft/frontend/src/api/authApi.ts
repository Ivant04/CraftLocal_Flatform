import axiosClient from './axiosClient';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/user.type';

export interface GoogleLoginPayload {
  accessToken?: string;
  idToken?: string;
  credential?: string;
  role?: 'TOURIST' | 'HOST';
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const authApi = {
  login: (data: LoginPayload) => axiosClient.post<ApiEnvelope<AuthResponse>>('/auth/login', data),
  register: (data: RegisterPayload) => axiosClient.post<ApiEnvelope<AuthResponse>>('/auth/register', data),
  googleLogin: (data: GoogleLoginPayload) => axiosClient.post<ApiEnvelope<AuthResponse>>('/auth/google', data),
  getProfile: () => axiosClient.get('/auth/profile'),
  updateProfile: (data: { fullName?: string; phone?: string; avatar?: string }) =>
    axiosClient.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosClient.put('/auth/change-password', data),
};

export default authApi;
