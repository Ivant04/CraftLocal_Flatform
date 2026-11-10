export type WorkshopCategory =
  | 'Pottery'
  | 'Lantern Making'
  | 'Textile & Weaving'
  | 'Painting'
  | 'Woodcarving'
  | 'Cooking'
  | 'Calligraphy'
  | 'Bamboo Craft'
  | 'Jewelry Making'
  | 'Làm gốm'
  | 'Làm đèn lồng'
  | 'Dệt vải'
  | 'Vẽ tranh'
  | 'Điêu khắc gỗ'
  | 'Nấu ăn'
  | 'Thư pháp'
  | 'Đan tre';

export type WorkshopStatus = 'ACTIVE' | 'HIDDEN' | 'DRAFT';

export interface Workshop {
  _id: string;
  title: string;
  description: string;
  category: WorkshopCategory;
  price: number;
  duration: number; // in minutes
  address: string;
  location: string; // city/region
  images: string[];
  hostId: string;
  hostName?: string;
  hostAvatar?: string;
  status: WorkshopStatus;
  rating?: number;
  totalReviews?: number;
  maxGuests?: number;
  includes?: string[];
  requirements?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkshopFilters {
  category?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  search?: string;
  page?: number;
  limit?: number;
}
