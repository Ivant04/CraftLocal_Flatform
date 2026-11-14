import fallbackCraftImg from '../assets/images/pottery-workshop.jpg';
import { API_URL } from './constants';
import type { Workshop } from '../types/workshop.type';
import type { Product } from '../types/product.type';
import type { Booking } from '../types/booking.type';
import type { Order } from '../types/order.type';
import type { Timeslot } from '../types/timeslot.type';

const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const DEFAULT_CRAFT_IMAGE = fallbackCraftImg;

/**
 * Resolves relative `/images/...` paths served by the backend static middleware
 * into full backend URLs, leaving absolute URLs and Vite-bundled assets untouched.
 */
export const resolveImageUrl = (src?: string): string => {
  if (!src) return fallbackCraftImg;
  const trimmed = src.trim();
  if (!trimmed) return fallbackCraftImg;
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.startsWith('/images/')) {
    return `${API_ORIGIN}${trimmed}`;
  }
  return trimmed;
};

export const resolveImageList = (images?: unknown, fallbackSingle?: string): string[] => {
  const rawList = Array.isArray(images) ? images.filter((x): x is string => typeof x === 'string' && x.trim().length > 0) : [];
  if (rawList.length > 0) return rawList.map(resolveImageUrl);
  if (fallbackSingle) return [resolveImageUrl(fallbackSingle)];
  return [fallbackCraftImg];
};

const formatDateOnly = (iso?: string): string => {
  if (!iso) return '';
  const str = String(iso).trim();
  if (!str || str.toLowerCase() === 'invalid date') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  try {
    return d.toLocaleDateString('en-CA');
  } catch {
    return d.toISOString().split('T')[0];
  }
};

const formatTimeOnly = (iso?: string): string => {
  if (!iso) return '';
  const str = String(iso).trim();
  if (!str || str.toLowerCase() === 'invalid date') return '';
  if (/^\d{1,2}:\d{2}/.test(str)) {
    const parts = str.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1].slice(0, 2)}`;
  }
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return str;
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const normalizeWorkshop = (raw: any): Workshop => {
  const catObj = raw?.categoryId && typeof raw.categoryId === 'object' ? raw.categoryId : null;
  const hostObj = raw?.hostId && typeof raw.hostId === 'object' ? raw.hostId : null;
  const addressStr =
    typeof raw?.address === 'string'
      ? raw.address
      : raw?.address?.fullAddress || raw?.locationLabel || '';
  return {
    _id: String(raw?._id || ''),
    title: raw?.title || '',
    description: raw?.description || '',
    category: (catObj?.name || raw?.category || 'Thủ công mỹ nghệ') as Workshop['category'],
    categoryId: catObj?._id || (typeof raw?.categoryId === 'string' ? raw.categoryId : undefined),
    price: Number(raw?.price ?? 0),
    duration: Number(raw?.duration ?? 0),
    address: addressStr,
    location: raw?.location || raw?.locationLabel || raw?.address?.city || '',
    images: resolveImageList(raw?.images, raw?.thumbnail),
    hostId: String(hostObj?._id || raw?.hostId || ''),
    hostName: raw?.hostName || hostObj?.fullName || hostObj?.hostProfile?.workshopName || 'Nghệ nhân bản địa',
    hostAvatar: hostObj?.avatar ? resolveImageUrl(hostObj.avatar) : raw?.hostAvatar,
    status: raw?.status || 'ACTIVE',
    rating: Number(raw?.rating ?? raw?.averageRating ?? 0),
    totalReviews: Number(raw?.totalReviews ?? 0),
    maxGuests: Number(raw?.maxGuests ?? raw?.maxGuestsPerSlot ?? 10),
    includes: Array.isArray(raw?.includes) ? raw.includes : Array.isArray(raw?.includedItems) ? raw.includedItems : [],
    requirements: Array.isArray(raw?.requirements) ? raw.requirements : Array.isArray(raw?.requiredItems) ? raw.requiredItems : [],
    createdAt: raw?.createdAt || '',
    updatedAt: raw?.updatedAt || '',
  };
};

export const normalizeProduct = (raw: any): Product => {
  const catObj = raw?.categoryId && typeof raw.categoryId === 'object' ? raw.categoryId : null;
  const hostObj = raw?.hostId && typeof raw.hostId === 'object' ? raw.hostId : null;
  const bizAddr = hostObj?.hostProfile?.businessAddress;
  const workshopName =
    raw?.workshopName ||
    hostObj?.hostProfile?.workshopName ||
    raw?.hostName ||
    hostObj?.fullName ||
    'Làng nghề thủ công';
  const ownerName =
    raw?.ownerName || hostObj?.hostProfile?.ownerName || hostObj?.fullName || '';
  const workshopLocation =
    raw?.workshopLocation ||
    bizAddr?.city ||
    bizAddr?.province ||
    bizAddr?.fullAddress ||
    '';

  return {
    _id: String(raw?._id || ''),
    name: raw?.name || '',
    description: raw?.description || raw?.shortDescription || '',
    shortDescription: raw?.shortDescription || '',
    price: Number(raw?.price ?? 0),
    stock: Number(raw?.stock ?? 0),
    category: (catObj?.name || raw?.category || 'Thủ công mỹ nghệ') as Product['category'],
    categoryId: catObj?._id || (typeof raw?.categoryId === 'string' ? raw.categoryId : undefined),
    images: resolveImageList(raw?.images, raw?.thumbnail),
    thumbnail: raw?.thumbnail ? resolveImageUrl(raw.thumbnail) : undefined,
    hostId: String(hostObj?._id || raw?.hostId || ''),
    hostName: raw?.hostName || hostObj?.hostProfile?.workshopName || hostObj?.fullName || 'Làng nghề thủ công',
    workshopName,
    ownerName,
    hostAvatar: hostObj?.avatar ? resolveImageUrl(hostObj.avatar) : raw?.hostAvatar,
    workshopLocation,
    origin: raw?.origin || raw?.originAddress?.fullAddress || bizAddr?.fullAddress || '',
    material: raw?.material || '',
    status: raw?.status || 'ACTIVE',
    rating: Number(raw?.rating ?? raw?.averageRating ?? 0),
    totalReviews: Number(raw?.totalReviews ?? 0),
    createdAt: raw?.createdAt || '',
    updatedAt: raw?.updatedAt || '',
  };
};

export const normalizeTimeslot = (raw: any): Timeslot => {
  const wsObj = raw?.workshopId && typeof raw.workshopId === 'object' ? raw.workshopId : null;
  const guideObj = raw?.tourGuideId && typeof raw.tourGuideId === 'object' ? raw.tourGuideId : null;
  return {
    _id: String(raw?._id || ''),
    workshopId: String(wsObj?._id || raw?.workshopId || ''),
    workshopTitle: raw?.workshopTitle || wsObj?.title || 'Workshop thủ công',
    workshopLocation: wsObj?.locationLabel || wsObj?.address?.fullAddress || '',
    date: raw?.date || formatDateOnly(raw?.startTime),
    startTime: raw?.startTime || '',
    endTime: raw?.endTime || '',
    startTimeLabel: formatTimeOnly(raw?.startTime),
    endTimeLabel: formatTimeOnly(raw?.endTime),
    totalSlots: Number(raw?.totalSlots ?? 0),
    bookedSlots: Number(raw?.bookedSlots ?? 0),
    availableSlots: Number(raw?.availableSlots ?? 0),
    price: raw?.price !== undefined ? Number(raw.price) : undefined,
    status: raw?.status || 'AVAILABLE',
    tourGuideId: guideObj?._id ? String(guideObj._id) : raw?.tourGuideId ? String(raw.tourGuideId) : undefined,
    tourGuideName: raw?.tourGuideName || guideObj?.fullName,
    note: raw?.note,
    createdAt: raw?.createdAt || '',
  };
};

export const normalizeBooking = (raw: any): Booking => {
  const wsObj = raw?.workshopId && typeof raw.workshopId === 'object' ? raw.workshopId : null;
  const slotObj = raw?.timeslotId && typeof raw.timeslotId === 'object' ? raw.timeslotId : null;
  const touristObj = raw?.touristId && typeof raw.touristId === 'object' ? raw.touristId : null;
  const ticketObj = raw?.ticketId && typeof raw.ticketId === 'object' ? raw.ticketId : null;
  const wsImages = wsObj?.images ? resolveImageList(wsObj.images) : [];

  return {
    _id: String(raw?._id || ''),
    bookingCode: raw?.bookingCode || '',
    workshopId: String(wsObj?._id || raw?.workshopId || ''),
    workshopTitle: raw?.workshopTitle || wsObj?.title || 'Workshop trải nghiệm',
    workshopImage: raw?.workshopImage ? resolveImageUrl(raw.workshopImage) : wsImages[0],
    workshopLocation: wsObj?.locationLabel || wsObj?.address?.fullAddress || '',
    timeslotId: String(slotObj?._id || raw?.timeslotId || ''),
    timeslotDate: raw?.timeslotDate || formatDateOnly(slotObj?.startTime || raw?.createdAt),
    timeslotStartTime: raw?.timeslotStartTime || formatTimeOnly(slotObj?.startTime),
    timeslotEndTime: raw?.timeslotEndTime || formatTimeOnly(slotObj?.endTime),
    touristId: String(touristObj?._id || raw?.touristId || ''),
    touristName: raw?.touristName || touristObj?.fullName || raw?.customerInfo?.fullName || 'Khách tham gia',
    touristEmail: raw?.touristEmail || touristObj?.email || raw?.customerInfo?.email,
    touristPhone: touristObj?.phone || raw?.customerInfo?.phone,
    guests: Number(raw?.guests ?? raw?.quantity ?? 1),
    totalAmount: Number(raw?.totalAmount ?? raw?.totalPrice ?? 0),
    status: raw?.status || raw?.bookingStatus || 'PENDING',
    qrCode: raw?.qrCode || raw?.qrToken || ticketObj?.qrToken,
    canReview: Boolean(raw?.canReview),
    checkedInAt: raw?.checkedInAt,
    createdAt: raw?.createdAt || '',
    updatedAt: raw?.updatedAt || '',
  };
};

export const normalizeOrder = (raw: any): Order => {
  const touristObj = raw?.touristId && typeof raw.touristId === 'object' ? raw.touristId : null;
  const shippingAddr =
    typeof raw?.shippingAddress === 'string'
      ? raw.shippingAddress
      : raw?.shippingAddress?.fullAddress ||
        [
          raw?.shippingAddress?.addressLine,
          raw?.shippingAddress?.ward,
          raw?.shippingAddress?.district,
          raw?.shippingAddress?.city,
        ]
          .filter(Boolean)
          .join(', ');

  return {
    _id: String(raw?._id || ''),
    orderCode: raw?.orderCode || '',
    touristId: String(touristObj?._id || raw?.touristId || ''),
    touristName: raw?.touristName || touristObj?.fullName || raw?.shippingAddress?.fullName || 'Khách hàng',
    touristPhone: touristObj?.phone || raw?.shippingAddress?.phone,
    items: Array.isArray(raw?.items)
      ? raw.items.map((item: any) => ({
          productId: String(item?.productId?._id || item?.productId || ''),
          productName: item?.productName || item?.name || 'Sản phẩm',
          productImage: item?.productImage || item?.image ? resolveImageUrl(item.productImage || item.image) : undefined,
          price: Number(item?.price ?? 0),
          quantity: Number(item?.quantity ?? 1),
        }))
      : [],
    shippingAddress: shippingAddr,
    shippingFee: Number(raw?.shippingFee ?? 0),
    totalAmount: Number(raw?.totalAmount ?? 0),
    status: raw?.status || raw?.orderStatus || 'PENDING',
    paymentMethod: raw?.paymentMethod || 'PAYOS',
    createdAt: raw?.createdAt || '',
    updatedAt: raw?.updatedAt || '',
  };
};
