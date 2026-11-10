export type PaymentMethod = 'VNPay' | 'MoMo';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface Payment {
  _id: string;
  bookingId?: string;
  orderId?: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}
