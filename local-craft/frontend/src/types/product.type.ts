export type ProductCategory =
  | 'Ceramics'
  | 'Textiles'
  | 'Woodwork'
  | 'Paintings'
  | 'Jewelry'
  | 'Bamboo'
  | 'Lacquerware'
  | 'Paper Craft'
  | 'Gốm sứ'
  | 'Tre nứa'
  | 'Dệt may'
  | 'Sơn mài';

export type ProductStatus = 'ACTIVE' | 'HIDDEN' | 'OUT_OF_STOCK';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: ProductCategory;
  images: string[];
  hostId: string;
  hostName?: string;
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
