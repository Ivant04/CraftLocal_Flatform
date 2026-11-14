/**
 * Location Service
 * Provides distance calculation (Haversine formula), coordinate validation,
 * and recognized location presets.
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PresetLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  region: string;
}

export const POPULAR_PRESET_LOCATIONS: PresetLocation[] = [
  {
    name: 'An Thượng, Đà Nẵng',
    address: 'Khu phố du lịch An Thượng, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng',
    lat: 16.0489,
    lng: 108.2441,
    region: 'Đà Nẵng',
  },
  {
    name: 'Phố cổ Hội An',
    address: 'Phường Minh An, Thành phố Hội An, Quảng Nam',
    lat: 15.8768,
    lng: 108.3276,
    region: 'Quảng Nam',
  },
  {
    name: 'Làng gốm Thanh Hà',
    address: 'Khối Nam Diêu, Phường Thanh Hà, Hội An, Quảng Nam',
    lat: 15.8797,
    lng: 108.3106,
    region: 'Quảng Nam',
  },
  {
    name: 'Làng đá Non Nước',
    address: 'Lê Văn Hiến, Phường Hòa Hải, Quận Ngũ Hành Sơn, Đà Nẵng',
    lat: 16.0082,
    lng: 108.2594,
    region: 'Đà Nẵng',
  },
  {
    name: 'Làng rau Trà Quế',
    address: 'Thôn Trà Quế, Xã Cẩm Hà, Hội An, Quảng Nam',
    lat: 15.8992,
    lng: 108.3374,
    region: 'Quảng Nam',
  },
  {
    name: 'Rừng dừa Bảy Mẫu Cẩm Thanh',
    address: 'Thôn Vạn Lăng, Xã Cẩm Thanh, Hội An, Quảng Nam',
    lat: 15.8715,
    lng: 108.3681,
    region: 'Quảng Nam',
  },
  {
    name: 'Làng gốm Bát Tràng',
    address: 'Xã Bát Tràng, Huyện Gia Lâm, Hà Nội',
    lat: 20.9782,
    lng: 105.9082,
    region: 'Hà Nội',
  },
  {
    name: 'Quận 1, TP. Hồ Chí Minh',
    address: 'Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
    lat: 10.7769,
    lng: 106.7009,
    region: 'TP. Hồ Chí Minh',
  },
];

/**
 * Calculates great-circle distance between two points on Earth using Haversine formula (km).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // rounded to 2 decimal places
}

/**
 * Formats a distance in kilometers into a human-readable string in Vietnamese.
 * Example: 0.85 -> "850 m", 1.42 -> "1.4 km"
 */
export function formatDistanceLabel(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Validates latitude and longitude coordinates.
 */
export function isValidCoordinates(lat?: unknown, lng?: unknown): lat is number {
  const nLat = Number(lat);
  const nLng = Number(lng);
  return (
    Number.isFinite(nLat) &&
    Math.abs(nLat) <= 90 &&
    Number.isFinite(nLng) &&
    Math.abs(nLng) <= 180
  );
}

/**
 * Resolves closest recognized preset location name if coordinates are close.
 */
export function getClosestPresetLocationName(lat: number, lng: number): string {
  let closest = POPULAR_PRESET_LOCATIONS[0];
  let minDistance = calculateDistanceKm(lat, lng, closest.lat, closest.lng);

  for (const preset of POPULAR_PRESET_LOCATIONS) {
    const d = calculateDistanceKm(lat, lng, preset.lat, preset.lng);
    if (d < minDistance) {
      minDistance = d;
      closest = preset;
    }
  }

  if (minDistance <= 2.5) {
    return closest.name;
  }
  return `Toạ độ (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}

export interface GeocodeResult {
  name: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  source: 'google' | 'preset' | 'osm';
}

/**
 * Geocodes an address or location name into coordinates.
 * Tries Google Maps Geocoding API if key is set, otherwise falls back to presets + OpenStreetMap Nominatim.
 */
export async function geocodeAddress(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: GeocodeResult[] = [];

  // 1. Check presets first for instant exact match
  const matchedPresets = POPULAR_PRESET_LOCATIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(trimmed.toLowerCase()) ||
      p.address.toLowerCase().includes(trimmed.toLowerCase()) ||
      p.region.toLowerCase().includes(trimmed.toLowerCase())
  );

  matchedPresets.forEach((p) => {
    results.push({
      name: p.name,
      formattedAddress: p.address,
      lat: p.lat,
      lng: p.lng,
      source: 'preset',
    });
  });

  const googleKey = process.env.GOOGLE_MAPS_API_KEY || '';

  // 2. If Google Maps API Key is available, query Google Geocoding API
  if (googleKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(trimmed)}&components=country:VN&language=vi&key=${googleKey}`;
      const res = await fetch(url);
      const json = (await res.json()) as any;
      if (json?.status === 'OK' && Array.isArray(json?.results)) {
        json.results.slice(0, 5).forEach((r: any) => {
          results.push({
            name: r.address_components?.[0]?.long_name || trimmed,
            formattedAddress: r.formatted_address || trimmed,
            lat: Number(r.geometry?.location?.lat),
            lng: Number(r.geometry?.location?.lng),
            source: 'google',
          });
        });
        return results;
      }
    } catch (err) {
      console.warn('[LocationService] Google Geocoding failed, falling back:', err);
    }
  }

  // 3. Fallback: OpenStreetMap Nominatim (Vietnam restricted, free, no key required)
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&countrycodes=vn&limit=5&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'CraftLocal-App/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const list = (await res.json()) as any[];
      if (Array.isArray(list)) {
        list.forEach((item) => {
          const lat = Number(item.lat);
          const lng = Number(item.lon);
          if (isValidCoordinates(lat, lng)) {
            results.push({
              name: item.name || item.display_name?.split(',')?.[0] || trimmed,
              formattedAddress: item.display_name,
              lat,
              lng,
              source: 'osm',
            });
          }
        });
      }
    }
  } catch (err) {
    console.warn('[LocationService] OSM Geocoding fallback failed:', err);
  }

  return results;
}

/**
 * Reverse geocodes coordinates to a human-readable Vietnamese address.
 */
/**
 * Reverse geocodes coordinates to a human-readable, high-precision Vietnamese address.
 * Prioritizes exact street & house level address via Google Geocoding or high-zoom OpenStreetMap.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<{ name: string; address: string; source: 'google' | 'preset' | 'osm' }> {
  const googleKey = process.env.GOOGLE_MAPS_API_KEY || '';

  // 1. Google Reverse Geocoding (exact street address)
  if (googleKey) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=vi&key=${googleKey}`;
      const res = await fetch(url);
      const json = (await res.json()) as any;
      if (json?.status === 'OK' && json?.results?.[0]) {
        const top = json.results[0];
        // Extract street / point of interest name
        const streetNumber = top.address_components?.find((c: any) => c.types.includes('street_number'))?.long_name;
        const route = top.address_components?.find((c: any) => c.types.includes('route'))?.long_name;
        const ward = top.address_components?.find((c: any) => c.types.includes('sublocality_level_1') || c.types.includes('administrative_area_level_3'))?.long_name;
        const district = top.address_components?.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name;

        const specificName = [streetNumber, route].filter(Boolean).join(' ') ||
          top.address_components?.[0]?.long_name ||
          'Vị trí bạn đã chọn';

        return {
          name: [specificName, ward, district].filter(Boolean).slice(0, 2).join(', '),
          address: top.formatted_address,
          source: 'google',
        };
      }
    } catch (err) {
      console.warn('[LocationService] Google Reverse Geocoding failed:', err);
    }
  }

  // 2. OpenStreetMap Nominatim Reverse Geocoding (zoom 18 for building/house level exact precision)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: { 'User-Agent': 'CraftLocal-ExactLocation/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = (await res.json()) as any;
      const addr = json?.address;
      const houseNumber = addr?.house_number || '';
      const road = addr?.road || addr?.pedestrian || addr?.street || '';
      const suburb = addr?.suburb || addr?.quarter || addr?.neighbourhood || '';
      const district = addr?.city_district || addr?.district || addr?.town || '';
      const city = addr?.city || addr?.state || 'Việt Nam';

      const street = [houseNumber, road].filter(Boolean).join(' ') || road || suburb || 'Vị trí đã ghim';
      const shortName = [street, district].filter(Boolean).join(', ') || street;

      return {
        name: shortName,
        address: json?.display_name || `${shortName}, ${city}`,
        source: 'osm',
      };
    }
  } catch (err) {
    console.warn('[LocationService] OSM Reverse Geocoding failed:', err);
  }

  // 3. Fallback only if both real-time geocoders fail
  for (const preset of POPULAR_PRESET_LOCATIONS) {
    if (calculateDistanceKm(lat, lng, preset.lat, preset.lng) <= 0.3) {
      return { name: preset.name, address: preset.address, source: 'preset' };
    }
  }

  return {
    name: `Toạ độ (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    address: `Vị trí tại toạ độ: ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
    source: 'preset',
  };
}

/**
 * Attempts Google Geolocation API (via cell towers / wifi) or ipwho.is for high-accuracy regional IP resolution.
 * Avoids misleading datacenter IPs that falsely report Ho Chi Minh City for Central Vietnam users.
 */
export async function locateByGoogleOrIp(clientIp?: string): Promise<{ lat: number; lng: number; name: string; accuracy?: number } | null> {
  // 1. If client IP is explicitly known and not localhost, query ipwho.is (accurately detects Central Vietnam / Viettel)
  if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1' && !clientIp.startsWith('192.168.') && !clientIp.startsWith('10.')) {
    try {
      const res = await fetch(`https://ipwho.is/${clientIp}`);
      if (res.ok) {
        const data = (await res.json()) as any;
        if (data?.success && data.latitude && data.longitude) {
          const region = [data.city, data.region].filter(Boolean).join(', ') || 'Việt Nam';
          return {
            lat: data.latitude,
            lng: data.longitude,
            name: `${region} (Định vị IP)`,
            accuracy: 5000,
          };
        }
      }
    } catch (err) {
      console.warn('[LocationService] ipwho.is Geolocation failed:', err);
    }
  }

  // 2. Google Geolocation API (fallback if key is set)
  const googleKey = process.env.GOOGLE_MAPS_API_KEY || '';
  if (googleKey) {
    try {
      const res = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${googleKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ considerIp: true }),
      });
      const data = (await res.json()) as any;
      if (data?.location?.lat && data?.location?.lng) {
        const rev = await reverseGeocodeCoordinates(data.location.lat, data.location.lng);
        return {
          lat: data.location.lat,
          lng: data.location.lng,
          name: rev.name,
          accuracy: data.accuracy,
        };
      }
    } catch (err) {
      console.warn('[LocationService] Google Geolocation failed:', err);
    }
  }

  return null;
}

