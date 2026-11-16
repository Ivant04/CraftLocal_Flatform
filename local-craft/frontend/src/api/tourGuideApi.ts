import axiosClient from './axiosClient';

const tourGuideApi = {
  getByHost: () => axiosClient.get('/host/tour-guides'),
  getDetail: (id: string) => axiosClient.get(`/host/tour-guides/${id}`),
  create: (data: { fullName: string; email: string; phone: string; password: string }) =>
    axiosClient.post('/host/tour-guides', data),
  invite: (data: { email: string; fullName?: string; phone?: string }) =>
    axiosClient.post('/host/tour-guides/invite', data),
  update: (id: string, data: { fullName?: string; phone?: string; status?: 'ACTIVE' | 'BLOCKED'; password?: string }) =>
    axiosClient.put(`/host/tour-guides/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/host/tour-guides/${id}`),
  assignToTimeslot: (data: { tourGuideId: string; timeslotId: string }) =>
    axiosClient.put(`/host/timeslots/${data.timeslotId}/assign-guide`, { tourGuideId: data.tourGuideId }),
  getProfile: () => axiosClient.get('/tour-guide/profile'),
  getDashboard: () => axiosClient.get('/tour-guide/dashboard'),
  getSchedule: () => axiosClient.get('/tour-guide/schedules'),
  getCustomers: (timeslotId: string) => axiosClient.get(`/tour-guide/timeslots/${timeslotId}/customers`),
  checkIn: (qrToken: string) => axiosClient.post('/tour-guide/check-in', { qrToken }),
  startTrip: (timeslotId: string) => axiosClient.put(`/tour-guide/timeslots/${timeslotId}/start`),
  finishTrip: (timeslotId: string) => axiosClient.put(`/tour-guide/timeslots/${timeslotId}/finish`),
};

export default tourGuideApi;
