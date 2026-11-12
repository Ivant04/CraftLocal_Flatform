import axiosClient from './axiosClient';

const dashboardApi = {
  getAdminStats: () => axiosClient.get('/admin/dashboard'),
  getHostStats: () => axiosClient.get('/host/dashboard'),
  getTourGuideStats: () => axiosClient.get('/tour-guide/dashboard'),
};

export default dashboardApi;
