import axiosClient from './axiosClient';

const tourGuideApi = {
  getAll: () => axiosClient.get('/tour-guides'),
  getByHost: () => axiosClient.get('/tour-guides/host/mine'),
  create: (data: { fullName: string; email: string; phone: string; password: string }) =>
    axiosClient.post('/tour-guides', data),
  getSchedule: () => axiosClient.get('/tour-guides/schedule'),
  getCustomers: (timeslotId: string) => axiosClient.get(`/tour-guides/timeslot/${timeslotId}/customers`),
  assignToTimeslot: (data: { tourGuideId: string; timeslotId: string }) =>
    axiosClient.post('/tour-guides/assign', data),
  startTrip: (timeslotId: string) => axiosClient.put(`/tour-guides/timeslot/${timeslotId}/start`),
  finishTrip: (timeslotId: string) => axiosClient.put(`/tour-guides/timeslot/${timeslotId}/finish`),
  checkInBooking: (bookingId: string) => axiosClient.put(`/tour-guides/check-in/${bookingId}`),
};

export default tourGuideApi;
