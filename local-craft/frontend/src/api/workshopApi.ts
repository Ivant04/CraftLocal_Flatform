import axiosClient from './axiosClient';
import type { WorkshopFilters } from '../types/workshop.type';

const workshopApi = {
  getAll: (params?: WorkshopFilters) => axiosClient.get('/workshops', { params }),
  getById: (id: string) => axiosClient.get(`/workshops/${id}`),
  create: (data: FormData) => axiosClient.post('/workshops', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => axiosClient.put(`/workshops/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => axiosClient.delete(`/workshops/${id}`),
  getByHost: () => axiosClient.get('/workshops/host/mine'),
};

export default workshopApi;
