import axiosClient from './axiosClient';
import type {
  SmartRecommendationResult,
  PresetLocation,
  WeatherData,
  AiChatRequest,
  AiChatResponseData,
} from '../types/recommendation.type';
import type {
  OneDayItinerary,
  CafeSuggestion,
  GenerateItineraryRequest,
} from '../types/itinerary.type';

export interface SmartRecommendationParams {
  lat: number;
  lng: number;
  locationName?: string;
  radius?: number;
  preference?: 'all' | 'indoor' | 'outdoor' | 'workshop' | 'store';
  budget?: number;
}

const recommendationApi = {
  getSmartRecommendations: (params: SmartRecommendationParams) =>
    axiosClient.get<{ success: boolean; data: SmartRecommendationResult }>('/recommendations/smart', {
      params,
    }),

  getPresetLocations: () =>
    axiosClient.get<{ success: boolean; data: PresetLocation[] }>('/recommendations/presets'),

  getWeatherAtLocation: (lat: number, lng: number) =>
    axiosClient.get<{ success: boolean; data: WeatherData }>('/recommendations/weather', {
      params: { lat, lng },
    }),

  geocodeAddress: (address: string) =>
    axiosClient.get<{
      success: boolean;
      data: Array<{
        name: string;
        formattedAddress: string;
        lat: number;
        lng: number;
        source: 'google' | 'preset' | 'osm';
      }>;
    }>('/recommendations/geocode', {
      params: { address },
    }),

  reverseGeocode: (lat: number, lng: number) =>
    axiosClient.get<{
      success: boolean;
      data: { name: string; address: string; source: 'google' | 'preset' | 'osm' };
    }>('/recommendations/reverse-geocode', {
      params: { lat, lng },
    }),

  googleOrIpLocate: () =>
    axiosClient.post<{
      success: boolean;
      data: { lat: number; lng: number; name: string; accuracy?: number };
    }>('/recommendations/google-locate'),

  sendChatMessage: (data: AiChatRequest) =>
    axiosClient.post<{ success: boolean; data: AiChatResponseData }>('/recommendations/chat', data),

  generateItinerary: (data: GenerateItineraryRequest) =>
    axiosClient.post<{ success: boolean; data: OneDayItinerary }>('/recommendations/itinerary', data),

  suggestCafes: (data: { destination?: string; currentStopsCount?: number }) =>
    axiosClient.post<{ success: boolean; data: CafeSuggestion[] }>('/recommendations/itinerary/suggest-cafe', data),
};

export default recommendationApi;
