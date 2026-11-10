import axiosClient from './axiosClient';

const dashboardApi = {
  getAdminStats: () => axiosClient.get('/dashboard/admin'),
  getHostStats: () => axiosClient.get('/dashboard/host'),
  getTourGuideStats: () => axiosClient.get('/dashboard/tour-guide'),
  getRevenueByMonth: () => axiosClient.get('/dashboard/revenue'),
  getRevenueByHost: () => axiosClient.get('/dashboard/revenue/hosts'),
};

export default dashboardApi;
