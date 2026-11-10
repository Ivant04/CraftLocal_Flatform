export interface Review {
  _id: string;
  bookingId: string;
  workshopId: string;
  workshopTitle?: string;
  touristId: string;
  touristName: string;
  touristAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface ReviewPayload {
  bookingId: string;
  workshopId?: string;
  rating: number;
  comment: string;
  images?: string[];
}
