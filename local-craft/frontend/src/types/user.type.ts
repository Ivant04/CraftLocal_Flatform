export type UserRole = 'ADMIN' | 'HOST' | 'TOUR_GUIDE' | 'TOURIST';
export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  hostId?: string; // For tour guides - which host they belong to
  assignedSlotsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'TOURIST' | 'HOST';
}

export interface AuthResponse {
  token: string;
  user: User;
}
