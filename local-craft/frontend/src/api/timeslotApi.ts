import axiosClient from './axiosClient';

const timeslotApi = {
  getByWorkshop: (workshopId: string) => axiosClient.get(`/workshops/${workshopId}/timeslots`),
  getByHost: (params?: { workshopId?: string }) => axiosClient.get('/host/timeslots', { params }),
  create: (data: Record<string, unknown>) => axiosClient.post('/host/timeslots', data),
  update: (id: string, data: Record<string, unknown>) => axiosClient.put(`/host/timeslots/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/host/timeslots/${id}`),
  assignGuide: (id: string, tourGuideId: string) =>
    axiosClient.put(`/host/timeslots/${id}/assign-guide`, { tourGuideId }),
};

export default timeslotApi;

