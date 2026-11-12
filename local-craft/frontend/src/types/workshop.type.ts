export type WorkshopCategory = string;

export type WorkshopStatus = 'ACTIVE' | 'HIDDEN' | 'DRAFT';

export interface Workshop {
  _id: string;
  title: string;
  description: string;
  category: WorkshopCategory;
  categoryId?: string;
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
  sort?: string;
  page?: number;
  limit?: number;
}
