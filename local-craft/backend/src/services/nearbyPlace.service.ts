import mongoose from 'mongoose';
/**
 * Nearby Place Service
 * Searches real workshops, craft stores, artisans, and craft villages from MongoDB,
 * calculating distances and indoor/outdoor characteristics.
 */

import Workshop from '../models/workshop.model';
import User from '../models/user.model';
import Product from '../models/product.model';
import '../models/category.model';
import { calculateDistanceKm, formatDistanceLabel } from './location.service';

export type PlaceType =
  | 'WORKSHOP'
  | 'CRAFT_STORE'
  | 'CRAFT_VILLAGE'
  | 'ARTISAN'
  | 'LOCAL_EXPERIENCE';

export interface NearbyPlace {
  id: string;
  targetId: string;
  name: string;
  type: PlaceType;
  typeLabel: string;
  categoryName: string;
  image: string;
  distanceKm: number;
  distanceLabel: string;
  rating: number;
  totalReviews: number;
  price?: number;
  priceLabel?: string;
  durationMinutes?: number;
  durationLabel?: string;
  operatingHours?: string;
  address: string;
  locationLabel: string;
  coordinates: { lat: number; lng: number };
  shortDescription: string;
  isIndoor: boolean;
  isOutdoor: boolean;
  detailUrl: string;
  directionsUrl: string;
  hostName?: string;
  hostWorkshopName?: string;
}

/**
 * Checks whether an activity or workshop is primarily indoor or outdoor.
 */
function determineIndoorOutdoor(category: string, title: string, desc: string): { isIndoor: boolean; isOutdoor: boolean } {
  const text = `${category} ${title} ${desc}`.toLowerCase();

  // Explicit outdoor cues: garden, farm, river, boat, coconut forest, stone quarry yard, walking tour
  const outdoorKeywords = [
    'rau trà quế',
    'trà quế',
    'rừng dừa',
    'thuyền thúng',
    'chèo thuyền',
    'làng biển',
    'bãi biển',
    'an bàng',
    'ngoài trời',
    'đồng quê',
    'làng chài',
    'vườn',
  ];

  const hasOutdoorCue = outdoorKeywords.some((kw) => text.includes(kw));

  if (hasOutdoorCue) {
    return { isIndoor: false, isOutdoor: true };
  }

  // Default craft workshops (ceramic, lantern, textile, coffee, lacquer) are predominantly covered/indoor
  return { isIndoor: true, isOutdoor: false };
}

/**
 * Builds Google Maps directions URL from user coordinates to target destination.
 */
export function buildDirectionsUrl(
  userLat: number,
  userLng: number,
  destLat: number,
  destLng: number,
  destAddress?: string
): string {
  const origin = `${userLat},${userLng}`;
  const dest = `${destLat},${destLng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(dest)}`;
}

/**
 * Finds all nearby craft places (Workshops, Stores, Artisans, Villages) sorted by distance.
 */
export async function findNearbyPlaces(
  userLat: number,
  userLng: number,
  radiusKm: number = 5
): Promise<{ places: NearbyPlace[]; effectiveRadiusKm: number }> {
  if (mongoose.connection.readyState !== 1) {
    return { places: [], effectiveRadiusKm: radiusKm };
  }
  try {
  // 1. Fetch all active workshops with coordinates
  const workshops = await Workshop.find({
    status: 'ACTIVE',
    'mapLocation.lat': { $exists: true, $ne: null },
    'mapLocation.lng': { $exists: true, $ne: null },
  })
    .populate('categoryId', 'name slug')
    .lean();

  // 2. Fetch hosts (Artisans and Craft Stores) with business address coordinates
  const hosts = await User.find({
    role: 'HOST',
    status: 'ACTIVE',
    'hostProfile.businessAddress.mapLocation.lat': { $exists: true, $ne: null },
    'hostProfile.businessAddress.mapLocation.lng': { $exists: true, $ne: null },
  })
    .select('fullName avatar hostProfile')
    .lean();

  // 3. Fetch representative products for stores
  const hostIds = hosts.map((h) => h._id);
  const products = await Product.find({
    hostId: { $in: hostIds },
    status: 'ACTIVE',
  })
    .select('name price images thumbnail hostId')
    .lean();

  const productsByHost = new Map<string, typeof products>();
  products.forEach((p) => {
    const key = String(p.hostId);
    if (!productsByHost.has(key)) productsByHost.set(key, []);
    productsByHost.get(key)!.push(p);
  });

  const allPlaces: NearbyPlace[] = [];

  // Transform Workshops
  for (const ws of workshops) {
    const wLat = Number(ws.mapLocation?.lat);
    const wLng = Number(ws.mapLocation?.lng);
    if (!Number.isFinite(wLat) || !Number.isFinite(wLng)) continue;

    const distanceKm = calculateDistanceKm(userLat, userLng, wLat, wLng);
    const catName =
      typeof ws.categoryId === 'object' && ws.categoryId && 'name' in ws.categoryId
        ? String((ws.categoryId as any).name)
        : 'Thủ công mỹ nghệ';

    const { isIndoor, isOutdoor } = determineIndoorOutdoor(catName, ws.title, ws.description || '');

    const isVillage =
      ws.locationLabel?.toLowerCase().includes('làng') ||
      ws.title.toLowerCase().includes('làng');

    const placeType: PlaceType = isVillage
      ? 'CRAFT_VILLAGE'
      : ws.price && ws.price > 0
      ? 'WORKSHOP'
      : 'LOCAL_EXPERIENCE';

    const typeLabel =
      placeType === 'CRAFT_VILLAGE'
        ? 'Làng nghề truyền thống'
        : placeType === 'WORKSHOP'
        ? 'Workshop thủ công'
        : 'Trải nghiệm văn hóa';

    const image =
      ws.images?.[0] ||
      ws.thumbnail ||
      '/images/fallback-craft.jpg';

    allPlaces.push({
      id: `ws-${ws._id}`,
      targetId: String(ws._id),
      name: ws.title,
      type: placeType,
      typeLabel,
      categoryName: catName,
      image,
      distanceKm,
      distanceLabel: formatDistanceLabel(distanceKm),
      rating: Number(ws.averageRating ?? 4.8),
      totalReviews: Number(ws.totalReviews ?? 0),
      price: Number(ws.price ?? 0),
      priceLabel: ws.price ? `${Number(ws.price).toLocaleString('vi-VN')}₫` : 'Miễn phí tham quan',
      durationMinutes: ws.duration,
      durationLabel: ws.duration ? `${ws.duration} phút` : undefined,
      operatingHours: '08:00 - 18:00 hàng ngày',
      address: ws.address?.fullAddress || ws.locationLabel,
      locationLabel: ws.locationLabel || ws.address?.city || '',
      coordinates: { lat: wLat, lng: wLng },
      shortDescription:
        ws.shortDescription ||
        ws.description?.slice(0, 120) ||
        'Trải nghiệm văn hóa và nghệ thuật chế tác thủ công truyền thống.',
      isIndoor,
      isOutdoor,
      detailUrl: `/workshops/${ws._id}`,
      directionsUrl: buildDirectionsUrl(userLat, userLng, wLat, wLng, ws.address?.fullAddress),
      hostName: ws.hostName,
      hostWorkshopName: ws.hostWorkshopName,
    });
  }

  // Transform Hosts / Craft Stores
  for (const h of hosts) {
    const bLat = Number(h.hostProfile?.businessAddress?.mapLocation?.lat);
    const bLng = Number(h.hostProfile?.businessAddress?.mapLocation?.lng);
    if (!Number.isFinite(bLat) || !Number.isFinite(bLng)) continue;

    const distanceKm = calculateDistanceKm(userLat, userLng, bLat, bLng);
    const workshopName =
      h.hostProfile?.workshopName ||
      `Xưởng thủ công nghệ nhân ${h.fullName}`;
    const hostProds = productsByHost.get(String(h._id)) || [];

    const image =
      hostProds[0]?.images?.[0] ||
      hostProds[0]?.thumbnail ||
      h.avatar ||
      '/images/fallback-craft.jpg';

    const minPrice = hostProds.length
      ? Math.min(...hostProds.map((p) => p.price))
      : undefined;

    allPlaces.push({
      id: `store-${h._id}`,
      targetId: String(h._id),
      name: workshopName,
      type: 'CRAFT_STORE',
      typeLabel: 'Cửa hàng & Xưởng chế tác',
      categoryName: 'Mua sắm thủ công & Trưng bày',
      image,
      distanceKm,
      distanceLabel: formatDistanceLabel(distanceKm),
      rating: 4.9,
      totalReviews: Math.max(12, hostProds.length * 4),
      price: minPrice,
      priceLabel: minPrice ? `Sản phẩm từ ${minPrice.toLocaleString('vi-VN')}₫` : 'Tham quan & Mua sắm',
      operatingHours: '08:30 - 20:30',
      address:
        h.hostProfile?.businessAddress?.fullAddress ||
        h.hostProfile?.businessAddress?.addressLine ||
        'Xưởng chế tác thủ công',
      locationLabel:
        h.hostProfile?.businessAddress?.city ||
        h.hostProfile?.businessAddress?.province ||
        'Khu phố làng nghề',
      coordinates: { lat: bLat, lng: bLng },
      shortDescription:
        h.hostProfile?.description ||
        `Không gian trưng bày và mua sắm các tác phẩm thủ công tinh xảo của nghệ nhân ${h.fullName}.`,
      isIndoor: true,
      isOutdoor: false,
      detailUrl: hostProds.length ? `/products/${hostProds[0]._id}` : `/workshops`,
      directionsUrl: buildDirectionsUrl(userLat, userLng, bLat, bLng),
      hostName: h.fullName,
      hostWorkshopName: workshopName,
    });
  }

  // Sort by distance ascending
  allPlaces.sort((a, b) => a.distanceKm - b.distanceKm);

  // Filter within radius
  let filtered = allPlaces.filter((p) => p.distanceKm <= radiusKm);
  let effectiveRadiusKm = radiusKm;

  // Fallback: If no places found within given radius, expand to nearest places so user always gets value
  if (filtered.length < 3 && allPlaces.length > 0) {
    filtered = allPlaces.slice(0, 6);
    effectiveRadiusKm = Math.ceil(filtered[filtered.length - 1].distanceKm);
  }

    return { places: filtered, effectiveRadiusKm };
  } catch (err) {
    console.warn('[findNearbyPlaces] Database error:', err);
    return { places: [], effectiveRadiusKm: radiusKm };
  }
}
