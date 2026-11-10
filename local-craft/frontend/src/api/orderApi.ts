import axiosClient from './axiosClient';

const orderApi = {
  create: (data: { items: { productId: string; quantity: number }[]; shippingAddress: string; paymentMethod: string }) =>
    axiosClient.post('/orders', data),
  getMyOrders: () => axiosClient.get('/orders/mine'),
  getById: (id: string) => axiosClient.get(`/orders/${id}`),
  getByHost: () => axiosClient.get('/orders/host/mine'),
  updateStatus: (id: string, status: string) => axiosClient.put(`/orders/${id}/status`, { status }),
};

export default orderApi;
