// API & App Constants
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROLES = {
  ADMIN: 'ADMIN' as const,
  HOST: 'HOST' as const,
  TOUR_GUIDE: 'TOUR_GUIDE' as const,
  TOURIST: 'TOURIST' as const,
};

// Hiển thị vai trò trên UI
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên',
  HOST: 'Chủ xưởng',
  TOUR_GUIDE: 'Hướng dẫn viên',
  TOURIST: 'Khách du lịch',
};

// Trạng thái booking
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  CHECKED_IN: 'CHECKED_IN',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  CHECKED_IN: 'Đã check-in',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

// Trạng thái đơn hàng
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPING: 'SHIPPING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

// Trạng thái người dùng
export const USER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  ACTIVE: 'Đang hoạt động',
  BLOCKED: 'Đã khóa',
};

// Trạng thái timeslot
export const TIMESLOT_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Còn chỗ',
  FULL: 'Hết chỗ',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
};

export const SHIPPING_FEE = 30000; // 30,000 VND

export const WORKSHOP_CATEGORIES = [
  'Làm gốm',
  'Làm đèn lồng',
  'Dệt vải',
  'Vẽ tranh',
  'Điêu khắc gỗ',
  'Nấu ăn',
  'Thư pháp',
  'Đan tre',
  'Làm trang sức',
] as const;

export const PRODUCT_CATEGORIES = [
  'Gốm sứ',
  'Dệt may',
  'Đồ gỗ',
  'Tranh',
  'Trang sức',
  'Tre nứa',
  'Sơn mài',
  'Giấy thủ công',
] as const;

export const LOCATIONS = [
  'Hội An',
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Huế',
  'Sa Pa',
  'Nha Trang',
  'Đà Lạt',
] as const;
