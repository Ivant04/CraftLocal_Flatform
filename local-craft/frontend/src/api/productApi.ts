import axiosClient from './axiosClient';

const productApi = {
  getAll: (params?: Record<string, string | number>) => axiosClient.get('/products', { params }),
  getById: (id: string) => axiosClient.get(`/products/${id}`),
  create: (data: FormData) => axiosClient.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: string, data: FormData) => axiosClient.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id: string) => axiosClient.delete(`/products/${id}`),
  getByHost: () => axiosClient.get('/products/host/mine'),
};

export default productApi;
