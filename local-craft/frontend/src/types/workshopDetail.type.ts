import type { WorkshopPromotion } from '../../../shared/workshopPricing';

export interface WorkshopDetail {
  _id: string;
  title: string;
  description: string;
  categoryId?: { _id: string; name: string } | string;
  address: { fullAddress: string };
  locationLabel: string;
  mapLocation?: { lat: number; lng: number };
  hostName: string;
  hostPhone?: string;
  price: number;
  duration: number;
  maxGuestsPerSlot: number;
  images: string[];
  includedItems: string[];
  averageRating: number;
  totalReviews: number;
  promotion?: WorkshopPromotion | null;
}

export interface WorkshopTimeslot {
  _id: string;
  startTime: string;
  endTime: string;
  availableSlots: number;
  price: number;
  status: string;
}

export interface WorkshopReview {
  _id: string;
  bookingId: string;
  touristId: { fullName: string; avatar?: string } | null;
  rating: number;
  comment?: string;
  createdAt: string;
  hostReply?: { message: string; repliedAt: string };
}

export interface ReviewableBooking {
  _id: string;
  workshopId: { _id: string } | string;
  bookingCode: string;
  canReview: boolean;
}
