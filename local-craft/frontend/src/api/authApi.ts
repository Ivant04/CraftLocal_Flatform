import axiosClient from './axiosClient';
import type { LoginPayload, RegisterPayload, AuthResponse, User } from '../types/user.type';

export interface GoogleLoginPayload {
  accessToken?: string;
  idToken?: string;
  credential?: string;
  role?: 'TOURIST' | 'HOST';
}

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const authApi = {
  login: (data: LoginPayload) => axiosClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterPayload) => axiosClient.post<AuthResponse>('/auth/register', data),
  googleLogin: (data: GoogleLoginPayload) => axiosClient.post<ApiEnvelope<AuthResponse>>('/auth/google', data),
  getProfile: () => axiosClient.get<ApiEnvelope<User>>('/auth/profile'),
  updateProfile: (data: UpdateProfilePayload) => axiosClient.put<ApiEnvelope<User>>('/auth/profile', data),
  uploadAvatar: (formData: FormData) =>
    axiosClient.post<ApiEnvelope<{ url: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default authApi;
