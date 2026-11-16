export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApplicationUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface WorkshopOwnerApplication {
  _id: string;
  userId: string | ApplicationUser;
  workshopName: string;
  ownerName: string;
  phone: string;
  email: string;
  workshopAddress: string;
  description: string;
  workshopImages: string[];
  idCardFront?: string;
  idCardBack?: string;
  businessLicense?: string;
  status: ApplicationStatus;
  rejectionReason?: string;
  reviewedBy?: {
    _id: string;
    fullName: string;
    email: string;
  };
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyWorkshopOwnerPayload {
  workshopName: string;
  ownerName: string;
  phone: string;
  email: string;
  workshopAddress: string;
  description: string;
  workshopImages?: string[];
  idCardFront?: string;
  idCardBack?: string;
  businessLicense?: string;
}

export interface ApplicationListResponse {
  applications: WorkshopOwnerApplication[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}
