export type ProductCategory = string;

export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  stock: number;
  category: ProductCategory;
  categoryId?: string;
  images: string[];
  thumbnail?: string;
  hostId: string;
  hostName?: string;
  workshopName?: string;
  ownerName?: string;
  hostAvatar?: string;
  workshopLocation?: string;
  origin?: string;
  material?: string;
  status: ProductStatus;
  rating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
