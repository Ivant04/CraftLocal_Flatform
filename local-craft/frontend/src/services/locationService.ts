/**
 * Location Service (Frontend)
 * Encapsulates browser Geolocation API, permission handling, distance formatting,
 * and location presets.
 */

import type { PresetLocation } from '../types/recommendation.type';
import recommendationApi from '../api/recommendationApi';

export interface UserCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface GeolocationErrorResult {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN';
  message: string;
}

export const DEFAULT_PRESET_LOCATION: PresetLocation = {
  name: 'An Thượng, Đà Nẵng',
  address: 'Khu phố du lịch An Thượng, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng',
  lat: 16.0489,
  lng: 108.2441,
  region: 'Đà Nẵng',
};

class LocationService {
  private cachedPosition: UserCoordinates | null = null;
  private cachedPresets: PresetLocation[] | null = null;

  /**
   * Retrieves user's previously selected and confirmed location from localStorage.
   */
  getSavedLocation(): { lat: number; lng: number; name: string } | null {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('craftlocal_user_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number' && parsed.name) {
          return parsed;
        }
      }
    } catch {
      // Ignore parsing errors
    }
    return null;
  }

  /**
   * Saves user's chosen location so it persists across sessions.
   */
  saveLocation(location: { lat: number; lng: number; name: string }): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('craftlocal_user_location', JSON.stringify(location));
    } catch {
      // Ignore quota errors
    }
  }

  /**
   * Clears saved location from localStorage (useful if user wants to reset or if false HCM was saved).
   */
  clearSavedLocation(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('craftlocal_user_location');
    } catch {
      // Ignore
    }
  }

  /**
   * Checks if Geolocation API is supported in current browser.
   */
  isGeolocationSupported(): boolean {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Requests user's current GPS position via browser Geolocation API.
   * Does NOT persist exact coordinates to database without necessity.
   */
  async getCurrentPosition(timeoutMs: number = 10000): Promise<UserCoordinates> {
    if (!this.isGeolocationSupported()) {
      throw {
        code: 'NOT_SUPPORTED',
        message: 'Trình duyệt của bạn không hỗ trợ định vị GPS. Vui lòng chọn địa điểm thủ công.',
      } as GeolocationErrorResult;
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: UserCoordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          this.cachedPosition = coords;
          resolve(coords);
        },
        (error) => {
          let code: GeolocationErrorResult['code'] = 'UNKNOWN';
          let message = 'Không thể xác định vị trí hiện tại.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              code = 'PERMISSION_DENIED';
              message =
                'Bạn đã từ chối quyền vị trí trên trình duyệt. Vui lòng nhấp vào biểu tượng ổ khóa hoặc cài đặt trên thanh địa chỉ URL, bật "Cho phép" mục Vị trí, rồi thử lại.';
              break;
            case error.POSITION_UNAVAILABLE:
              code = 'POSITION_UNAVAILABLE';
              message =
                'Thiết bị không thể tìm thấy tín hiệu vị trí GPS/Wi-Fi. Bạn có thể chọn địa điểm gợi ý thủ công hoặc nhấp bản đồ.';
              break;
            case error.TIMEOUT:
              code = 'TIMEOUT';
              message = 'Thời gian chờ phản hồi GPS đã hết. Vui lòng bấm thử lại và chọn Cho phép khi trình duyệt hỏi.';
              break;
          }

          reject({ code, message } as GeolocationErrorResult);
        },
        {
          enableHighAccuracy: true,
          timeout: timeoutMs,
          maximumAge: 0, // Force fresh real-time GPS coordinate acquisition
        }
      );
    });
  }

  /**
   * Directly triggers and evaluates Browser Geolocation (HTML5 GPS / Wi-Fi).
   * This is the purest, most accurate method provided by the user's hardware/browser.
   */
  async getBrowserGeolocation(timeoutMs: number = 20000): Promise<{
    lat: number;
    lng: number;
    accuracy: number;
    accuracyLabel: string;
    name: string;
    address: string;
    isHighAccuracy: boolean;
  }> {
    const coords = await this.getCurrentPosition(timeoutMs);

    const acc = Math.round(coords.accuracy ?? 0);
    const isHighAccuracy = acc <= 500;

    let accuracyLabel = '';
    if (acc < 1000) {
      accuracyLabel = `±${acc} mét (${isHighAccuracy ? 'Rất chính xác từ GPS / Wi-Fi thiết bị' : 'Độ chính xác tương đối'})`;
    } else {
      const km = (acc / 1000).toFixed(1);
      accuracyLabel = `±${km} km (Toạ độ ước tính qua trạm mạng)`;
    }

    const rev = await this.reverseGeocode(coords.lat, coords.lng);
    const resolvedName =
      rev?.name ||
      rev?.displayName ||
      rev?.address ||
      `Toạ độ (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;

    return {
      lat: coords.lat,
      lng: coords.lng,
      accuracy: acc,
      accuracyLabel,
      name: resolvedName,
      address: rev?.address || resolvedName,
      isHighAccuracy,
    };
  }

  /**
   * Directly resolves user's real location with anti-HCM false routing protection.
   * 1. Attempts high-accuracy browser GPS.
   * 2. If browser GPS returns coarse desktop IP mapping to HCM, falls back to direct client IP regional check.
   */
  async getDirectLocation(): Promise<{ lat: number; lng: number; name: string; isHighAccuracy: boolean }> {
    let gpsCoords: UserCoordinates | null = null;

    try {
      gpsCoords = await this.getCurrentPosition(9000);
    } catch {
      // GPS not available or denied
    }

    // Check if GPS returned coordinates inside Vietnam
    const isValidVnCoords =
      gpsCoords &&
      gpsCoords.lat >= 8 &&
      gpsCoords.lat <= 24 &&
      gpsCoords.lng >= 102 &&
      gpsCoords.lng <= 110;

    // Check if it falsely resolved to HCM via generic ISP NAT (accuracy > 3000m and coordinates in HCM)
    const isFalseHcmRouting =
      isValidVnCoords &&
      (gpsCoords!.accuracy ?? 0) > 3000 &&
      gpsCoords!.lat > 10.3 &&
      gpsCoords!.lat < 11.2 &&
      gpsCoords!.lng > 106.2 &&
      gpsCoords!.lng < 107.0;

    // If browser GPS is genuinely high accuracy (e.g. phone/laptop Wi-Fi, accuracy <= 3000m) and not false HCM:
    if (isValidVnCoords && !isFalseHcmRouting) {
      const rev = await this.reverseGeocode(gpsCoords!.lat, gpsCoords!.lng);
      return {
        lat: gpsCoords!.lat,
        lng: gpsCoords!.lng,
        name: rev?.name || rev?.displayName || `Toạ độ (${gpsCoords!.lat.toFixed(4)}, ${gpsCoords!.lng.toFixed(4)})`,
        isHighAccuracy: (gpsCoords!.accuracy ?? 9999) <= 500,
      };
    }

    // Try direct regional IP lookup (CORS enabled, highly accurate for Central Vietnam Viettel connections)
    try {
      const res = await fetch('https://ipwho.is/');
      if (res.ok) {
        const ipData = await res.json();
        if (ipData?.success && ipData.latitude && ipData.longitude) {
          const lat = Number(ipData.latitude);
          const lng = Number(ipData.longitude);
          if (lat >= 8 && lat <= 24 && lng >= 102 && lng <= 110) {
            const rev = await this.reverseGeocode(lat, lng);
            const cityName = [ipData.city, ipData.region].filter(Boolean).join(', ');
            return {
              lat,
              lng,
              name: rev?.name || cityName || 'Vị trí mạng của bạn',
              isHighAccuracy: false,
            };
          }
        }
      }
    } catch {
      // Fallback
    }

    // If browser GPS was at least inside Vietnam, use it as last resort
    if (isValidVnCoords) {
      const rev = await this.reverseGeocode(gpsCoords!.lat, gpsCoords!.lng);
      return {
        lat: gpsCoords!.lat,
        lng: gpsCoords!.lng,
        name: rev?.name || `Toạ độ (${gpsCoords!.lat.toFixed(4)}, ${gpsCoords!.lng.toFixed(4)})`,
        isHighAccuracy: false,
      };
    }

    // Final fallback to default preset location
    return {
      lat: DEFAULT_PRESET_LOCATION.lat,
      lng: DEFAULT_PRESET_LOCATION.lng,
      name: DEFAULT_PRESET_LOCATION.name,
      isHighAccuracy: false,
    };
  }

  /**
   * Fetches preset locations from API or provides local fallback presets.
   */
  async getPresetLocations(): Promise<PresetLocation[]> {
    if (this.cachedPresets && this.cachedPresets.length > 0) {
      return this.cachedPresets;
    }

    try {
      const res = await recommendationApi.getPresetLocations();
      if (res.data?.data && res.data.data.length > 0) {
        this.cachedPresets = res.data.data;
        return this.cachedPresets;
      }
    } catch {
      // Fallback presets if offline
    }

    const fallbacks: PresetLocation[] = [
      DEFAULT_PRESET_LOCATION,
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

    this.cachedPresets = fallbacks;
    return fallbacks;
  }

  /**
   * Generates Google Maps Directions link.
   */
  getDirectionsUrl(userLat: number, userLng: number, destLat: number, destLng: number): string {
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}`;
  }

  /**
   * Geocodes an address via backend API (Google Maps API / Nominatim fallback).
   */
  async geocode(address: string) {
    try {
      const res = await recommendationApi.geocodeAddress(address);
      return res.data?.data || [];
    } catch (err) {
      console.warn('[LocationService] Geocode failed:', err);
      return [];
    }
  }

  /**
   * Reverse geocodes coordinates to a Vietnamese address name.
   */
  async reverseGeocode(lat: number, lng: number) {
    try {
      const res = await recommendationApi.reverseGeocode(lat, lng);
      return res.data?.data || null;
    } catch (err) {
      console.warn('[LocationService] Reverse geocode failed:', err);
      return null;
    }
  }

  /**
   * Attempts Google Geolocation or network IP location.
   */
  async googleOrIpLocate() {
    try {
      const res = await recommendationApi.googleOrIpLocate();
      return res.data?.data || null;
    } catch (err) {
      console.warn('[LocationService] Google/IP locate failed:', err);
      return null;
    }
  }
}

export const locationService = new LocationService();
export default locationService;

