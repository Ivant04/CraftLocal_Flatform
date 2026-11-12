import axiosClient from './axiosClient';
import type { BookingPayload } from '../types/booking.type';

const bookingApi = {
  create: (data: BookingPayload) => axiosClient.post('/bookings', data),
  getMine: () => axiosClient.get('/bookings/my-bookings'),
  getMyBookings: () => axiosClient.get('/bookings/my-bookings'),
  getById: (id: string) => axiosClient.get(`/bookings/${id}`),
  getTicket: (id: string) => axiosClient.get(`/bookings/${id}/ticket`),
  cancel: (id: string, cancelReason?: string) => axiosClient.put(`/bookings/${id}/cancel`, { cancelReason }),
};

export default bookingApi;
