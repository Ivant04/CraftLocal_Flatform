export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderCode?: string;
  touristId: string;
  touristName: string;
  touristPhone?: string;
  items: OrderItem[];
  shippingAddress: string;
  shippingFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}
