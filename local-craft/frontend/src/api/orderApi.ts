import axiosClient from './axiosClient';

export interface CheckoutOrderPayload {
  items: { productId: string; quantity: number }[];
  shippingAddress:
    | string
    | {
        fullName: string;
        phone: string;
        addressLine: string;
        ward?: string;
        district: string;
        city: string;
        province: string;
        country?: string;
        fullAddress: string;
        note?: string;
      };
  paymentMethod?: string;
}

const orderApi = {
  checkout: (data: CheckoutOrderPayload) => axiosClient.post('/orders/checkout', data),
  getMyOrders: () => axiosClient.get('/orders/my-orders'),
  getByHost: () => axiosClient.get('/host/orders'),
  updateStatus: (id: string, status: string) => axiosClient.put(`/host/orders/${id}/status`, { status }),
};

export default orderApi;
