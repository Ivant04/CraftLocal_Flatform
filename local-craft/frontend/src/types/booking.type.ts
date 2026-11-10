export type BookingStatus = 'PENDING' | 'PAID' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
  _id: string;
  workshopId: string;
  workshopTitle: string;
  workshopImage?: string;
  timeslotId: string;
  timeslotDate: string;
  timeslotStartTime: string;
  timeslotEndTime: string;
  touristId: string;
  touristName: string;
  touristEmail?: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus;
  qrCode?: string;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPayload {
  timeslotId: string;
  quantity: number;
  couponCode?: string;
}
