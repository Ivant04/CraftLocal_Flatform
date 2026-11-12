import axiosClient from './axiosClient';

const productApi = {
  getAll: (params?: Record<string, string | number | undefined>) => axiosClient.get('/products', { params }),
  getById: (id: string) => axiosClient.get(`/products/${id}`),
  create: (data: Record<string, unknown>) => axiosClient.post('/host/products', data),
  update: (id: string, data: Record<string, unknown>) => axiosClient.put(`/host/products/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/host/products/${id}`),
  getByHost: () => axiosClient.get('/host/products'),
};

export default productApi;
