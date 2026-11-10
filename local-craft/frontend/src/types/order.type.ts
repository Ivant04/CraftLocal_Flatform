export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  touristId: string;
  touristName: string;
  items: OrderItem[];
  shippingAddress: string;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
