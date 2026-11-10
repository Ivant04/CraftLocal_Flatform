import axiosClient from './axiosClient';
import type { WorkshopFilters } from '../types/workshop.type';

const workshopApi = {
  getAll: (params?: WorkshopFilters) => axiosClient.get('/workshops', { params }),
  getById: (id: string) => axiosClient.get(`/workshops/${id}`),
  getTimeslots: (id: string) => axiosClient.get(`/workshops/${id}/timeslots`),
  create: (data: Record<string, unknown>) => axiosClient.post('/host/workshops', data),
  update: (id: string, data: Record<string, unknown>) => axiosClient.put(`/host/workshops/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/host/workshops/${id}`),
  getByHost: () => axiosClient.get('/host/workshops'),
};

export default workshopApi;
