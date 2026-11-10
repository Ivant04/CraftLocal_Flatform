import axiosClient from './axiosClient';
import type { BookingPayload } from '../types/booking.type';

const bookingApi = {
  create: (data: BookingPayload) => axiosClient.post('/bookings', data),
  getMine: () => axiosClient.get('/bookings/my-bookings'),
  getMyBookings: () => axiosClient.get('/bookings/my-bookings'),
  getById: (id: string) => axiosClient.get(`/bookings/${id}`),
  cancel: (id: string) => axiosClient.put(`/bookings/${id}/cancel`),
  checkIn: (id: string) => axiosClient.put(`/bookings/${id}/check-in`),
  getByTimeslot: (timeslotId: string) => axiosClient.get(`/bookings/timeslot/${timeslotId}`),
};

export default bookingApi;
