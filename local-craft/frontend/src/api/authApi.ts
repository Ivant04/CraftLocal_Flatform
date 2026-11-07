import axiosClient from './axiosClient';
import type { LoginPayload, RegisterPayload, AuthResponse } from '../types/user.type';

const authApi = {
  login: (data: LoginPayload) => axiosClient.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterPayload) => axiosClient.post<AuthResponse>('/auth/register', data),
  getProfile: () => axiosClient.get('/auth/profile'),
};

export default authApi;
