/**
 * Nearby Place Service (Frontend)
 * Handles client-side filtering, sorting, and place type styling.
 */

import type { NearbyPlace, PlaceType } from '../types/recommendation.type';

class NearbyPlaceService {
  /**
   * Returns human-readable label and styling tokens for each place type.
   */
  getTypeMeta(type: PlaceType) {
    switch (type) {
      case 'WORKSHOP':
        return {
          label: 'Workshop thủ công',
          badgeClass: 'bg-[#964824]/10 text-[#964824] border-[#964824]/20',
          iconName: 'Sparkles',
        };
      case 'CRAFT_STORE':
        return {
          label: 'Cửa hàng & Xưởng',
          badgeClass: 'bg-[#384B3F]/10 text-[#384B3F] border-[#384B3F]/20',
          iconName: 'ShoppingBag',
        };
      case 'CRAFT_VILLAGE':
        return {
          label: 'Làng nghề di sản',
          badgeClass: 'bg-[#D4A373]/20 text-[#845325] border-[#D4A373]/40',
          iconName: 'MapPin',
        };
      case 'LOCAL_EXPERIENCE':
      case 'ARTISAN':
      default:
        return {
          label: 'Trải nghiệm văn hóa',
          badgeClass: 'bg-stone-100 text-[#3D2B1F] border-stone-200',
          iconName: 'Compass',
        };
    }
  }

  /**
   * Filters a list of nearby places by distance, keyword, or indoor/outdoor preference.
   */
  filterPlaces(
    places: NearbyPlace[],
    filter: {
      preference?: string;
      maxDistanceKm?: number;
      keyword?: string;
    }
  ): NearbyPlace[] {
    let result = [...places];

    if (filter.maxDistanceKm) {
      result = result.filter((p) => p.distanceKm <= filter.maxDistanceKm!);
    }

    if (filter.preference && filter.preference !== 'all') {
      if (filter.preference === 'indoor') {
        result = result.filter((p) => p.isIndoor);
      } else if (filter.preference === 'outdoor') {
        result = result.filter((p) => p.isOutdoor);
      } else if (filter.preference === 'workshop') {
        result = result.filter((p) => p.type === 'WORKSHOP');
      } else if (filter.preference === 'store') {
        result = result.filter((p) => p.type === 'CRAFT_STORE');
      }
    }

    if (filter.keyword && filter.keyword.trim()) {
      const q = filter.keyword.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.locationLabel.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q)
      );
    }

    return result;
  }
}

export const nearbyPlaceService = new NearbyPlaceService();
export default nearbyPlaceService;

