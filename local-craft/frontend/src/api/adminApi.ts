import axiosClient from './axiosClient';

const adminApi = {
  getDashboard: () => axiosClient.get('/admin/dashboard'),
  getUsers: (params?: { role?: string; status?: string; page?: number; limit?: number }) =>
    axiosClient.get('/admin/users', { params }),
  getPendingHosts: () => axiosClient.get('/admin/hosts/pending'),
  approveHost: (id: string) => axiosClient.put(`/admin/hosts/${id}/approve`),
  blockUser: (id: string) => axiosClient.put(`/admin/users/${id}/block`),
  unblockUser: (id: string) => axiosClient.put(`/admin/users/${id}/unblock`),
};

export default adminApi;

