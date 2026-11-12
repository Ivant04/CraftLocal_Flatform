export type BookingStatus = 'PENDING' | 'PAID' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface Booking {
  _id: string;
  bookingCode?: string;
  workshopId: string;
  workshopTitle: string;
  workshopImage?: string;
  workshopLocation?: string;
  timeslotId: string;
  timeslotDate: string;
  timeslotStartTime: string;
  timeslotEndTime: string;
  touristId: string;
  touristName: string;
  touristEmail?: string;
  touristPhone?: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  qrCode?: string;
  canReview?: boolean;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPayload {
  timeslotId: string;
  quantity: number;
  couponCode?: string;
}
