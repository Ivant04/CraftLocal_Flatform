import type { UserRole } from '../types/user.type';

export const getRoleRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'HOST':
      return '/host/dashboard';
    case 'TOUR_GUIDE':
      return '/tour-guide/dashboard';
    case 'TOURIST':
    default:
      return '/';
  }
};
