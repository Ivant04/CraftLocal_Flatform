export interface WeatherData {
  temperature: number;
  apparentTemperature: number;
  condition: string;
  conditionCode: number;
  icon: string;
  rainProbability: number;
  windSpeed: number;
  uvIndex: number;
  isRainy: boolean;
  isHot: boolean;
  isPleasant: boolean;
  summaryText: string;
  source: 'open-meteo' | 'fallback';
  updatedAt: string;
}

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

export interface RecommendedActivity extends NearbyPlace {
  score: number;
  aiBadge: string;
  aiReasoning: string;
  rank: number;
}

export interface SmartRecommendationResult {
  userLocation: {
    lat: number;
    lng: number;
    name: string;
  };
  weather: WeatherData;
  aiAdvice: {
    headline: string;
    analysis: string;
    weatherBadge: string;
    suggestedFocus: 'INDOOR' | 'OUTDOOR' | 'ALL';
  };
  recommendations: RecommendedActivity[];
  allNearbyPlaces: NearbyPlace[];
  meta: {
    totalNearby: number;
    radiusKm: number;
    generatedAt: string;
    engine: 'openai+smart_scoring' | 'smart_scoring_engine';
  };
}

export interface PresetLocation {
  name: string;
  address: string;
  lat: number;
  lng: number;
  region: string;
}

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: RecommendedActivity[];
  weather?: WeatherData;
  location?: { lat: number; lng: number; name: string };
  suggestedPrompts?: string[];
  createdAt: string;
}

export interface AiChatRequest {
  message: string;
  userLocation?: {
    lat: number;
    lng: number;
    name?: string;
  };
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  preference?: 'all' | 'indoor' | 'outdoor' | 'workshop' | 'store';
  radius?: number;
}

export interface AiChatResponseData {
  reply: string;
  recommendations: RecommendedActivity[];
  weather: WeatherData;
  location: { lat: number; lng: number; name: string };
  suggestedPrompts: string[];
}

