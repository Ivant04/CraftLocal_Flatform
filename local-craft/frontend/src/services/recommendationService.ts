/**
 * Recommendation Service (Frontend)
 * Coordinates user location, weather, and real database entities to produce
 * personalized smart recommendations and 1-day curated itineraries.
 */

import type { SmartRecommendationResult } from '../types/recommendation.type';
import type {
  OneDayItinerary,
  CafeSuggestion,
  GenerateItineraryRequest,
} from '../types/itinerary.type';
import recommendationApi, { type SmartRecommendationParams } from '../api/recommendationApi';

class RecommendationService {
  private cache = new Map<string, { data: SmartRecommendationResult; timestamp: number }>();
  private readonly CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

  private makeCacheKey(params: SmartRecommendationParams): string {
    return `${params.lat.toFixed(3)},${params.lng.toFixed(3)}-${params.radius || 5}-${params.preference || 'all'}-${params.budget || 'any'}`;
  }

  /**
   * Fetches smart recommendations for user coordinates.
   */
  async getRecommendations(params: SmartRecommendationParams): Promise<SmartRecommendationResult> {
    const key = this.makeCacheKey(params);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    const res = await recommendationApi.getSmartRecommendations(params);
    const data = res.data.data;

    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  /**
   * Sends a message to the AI Chat Assistant and receives structured recommendations.
   */
  async sendChat(params: {
    message: string;
    userLocation?: { lat: number; lng: number; name?: string };
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    preference?: 'all' | 'indoor' | 'outdoor' | 'workshop' | 'store';
    radius?: number;
  }) {
    const res = await recommendationApi.sendChatMessage(params);
    return res.data.data;
  }

  /**
   * Generates a curated 1-day itinerary using AI and local craft places.
   */
  async generateItinerary(params: GenerateItineraryRequest): Promise<OneDayItinerary> {
    const res = await recommendationApi.generateItinerary(params);
    return res.data.data;
  }

  /**
   * Suggests authentic cafes and rest stops to interleave into the schedule.
   */
  async suggestCafes(destination?: string, currentStopsCount?: number): Promise<CafeSuggestion[]> {
    const res = await recommendationApi.suggestCafes({ destination, currentStopsCount });
    return res.data.data;
  }

  /**
   * Clears the recommendation cache.
   */
  clearCache() {
    this.cache.clear();
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService;
