/**
 * Weather Service (Frontend)
 * Formats and provides visual styles and helpers for real-time weather information.
 */

import type { WeatherData } from '../types/recommendation.type';
import recommendationApi from '../api/recommendationApi';

class WeatherService {
  /**
   * Fetches weather directly if needed.
   */
  async fetchWeather(lat: number, lng: number): Promise<WeatherData | null> {
    try {
      const res = await recommendationApi.getWeatherAtLocation(lat, lng);
      return res.data?.data || null;
    } catch (err) {
      console.warn('[WeatherService] Failed to fetch weather directly:', err);
      return null;
    }
  }

  /**
   * Returns Tailwind styling tokens matching current weather condition.
   */
  getWeatherTheme(weather?: WeatherData) {
    if (!weather) {
      return {
        badgeBg: 'bg-stone-100 text-[#3D2B1F] border-stone-200',
        accentColor: '#964824',
        icon: '🌤️',
      };
    }

    if (weather.isRainy) {
      return {
        badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
        accentColor: '#1E40AF',
        icon: weather.icon || '🌧️',
      };
    }

    if (weather.isHot) {
      return {
        badgeBg: 'bg-amber-50 text-amber-950 border-amber-200',
        accentColor: '#B45309',
        icon: weather.icon || '☀️',
      };
    }

    if (weather.isPleasant) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-950 border-emerald-200',
        accentColor: '#047857',
        icon: weather.icon || '🌤️',
      };
    }

    return {
      badgeBg: 'bg-[#FAF7F2] text-[#3D2B1F] border-[#EAD8CC]',
      accentColor: '#964824',
      icon: weather.icon || '☀️',
    };
  }
}

export const weatherService = new WeatherService();
export default weatherService;

