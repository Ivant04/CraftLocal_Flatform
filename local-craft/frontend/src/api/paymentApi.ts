import axiosClient from './axiosClient';

const paymentApi = {
  createBookingPayment: (bookingId: string) =>
    axiosClient.post('/payments/payos/create-booking-payment', { bookingId }),

  createOrderPayment: (orderId: string) =>
    axiosClient.post('/payments/payos/create-order-payment', { orderId }),

  getPaymentStatus: (orderCode: string | number) =>
    axiosClient.get(`/payments/payos/status/${orderCode}`),

  cancelPayment: (orderCode: string | number) =>
    axiosClient.post(`/payments/payos/cancel/${orderCode}`),
};

export default paymentApi;
