export type ActivityType = 'WORKSHOP' | 'CAFE_REST' | 'FOOD' | 'SIGHTSEEING';

export interface ItineraryStop {
  id: string;
  time: string; // e.g. "08:30 - 09:30"
  period: 'MORNING' | 'NOON' | 'AFTERNOON' | 'EVENING';
  title: string;
  type: ActivityType;
  typeLabel: string;
  location: string;
  costEstimate?: string;
  notes?: string;
  durationMinutes?: number;
  isAiSuggested?: boolean;
}

export interface OneDayItinerary {
  id: string;
  title: string;
  destination: string;
  theme: string;
  themeLabel: string;
  summary: string;
  totalEstimatedCost: string;
  weatherNote?: string;
  stops: ItineraryStop[];
  generatedAt: string;
  engine: 'openai+smart_itinerary' | 'smart_itinerary_engine';
}

export interface CafeSuggestion {
  id: string;
  name: string;
  tagline: string;
  vibe: string;
  recommendedTime: string;
  suggestedInsertAfterId?: string;
  address: string;
  estimatedPrice: string;
  specialty: string;
  reason: string;
}

export interface GenerateItineraryRequest {
  prompt?: string;
  destination?: string;
  theme?: 'CRAFT_WORKSHOP' | 'RELAX_EXPLORE' | 'CULTURE_FOOD' | 'ALL';
  pace?: 'RELAXED' | 'STANDARD' | 'INTENSIVE';
  userLocation?: {
    lat: number;
    lng: number;
    name?: string;
  };
  customRequirements?: string;
}

