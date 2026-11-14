/**
 * Weather Service
 * Real-time weather integration using Open-Meteo API (free, reliable, no API key required).
 * Includes in-memory caching and graceful fallback.
 */

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

interface CacheEntry {
  data: WeatherData;
  expiresAt: number;
}

// 10 minutes cache TTL
const CACHE_TTL_MS = 10 * 60 * 1000;
const weatherCache = new Map<string, CacheEntry>();

function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(2)},${lng.toFixed(2)}`;
}

/**
 * Maps WMO Weather Interpretation Codes to Vietnamese description and icon.
 */
function mapWmoCode(code: number): { condition: string; icon: string; isRain: boolean } {
  if (code === 0) {
    return { condition: 'Nắng đẹp, trời quang', icon: '☀️', isRain: false };
  }
  if (code >= 1 && code <= 3) {
    return { condition: 'Trời có mây, nắng ráo', icon: '⛅', isRain: false };
  }
  if (code === 45 || code === 48) {
    return { condition: 'Có sương mù nhẹ', icon: '🌫️', isRain: false };
  }
  if (code >= 51 && code <= 57) {
    return { condition: 'Mưa phùn rải rác', icon: '🌦️', isRain: true };
  }
  if (code >= 61 && code <= 67) {
    return { condition: 'Có mưa, đường trơn', icon: '🌧️', isRain: true };
  }
  if (code >= 71 && code <= 77) {
    return { condition: 'Không khí lạnh ẩm', icon: '🌨️', isRain: false };
  }
  if (code >= 80 && code <= 82) {
    return { condition: 'Mưa rào từng đợt', icon: '🌧️', isRain: true };
  }
  if (code >= 95 && code <= 99) {
    return { condition: 'Dông sét, mưa lớn', icon: '⛈️', isRain: true };
  }
  return { condition: 'Thời tiết ổn định', icon: '🌤️', isRain: false };
}

/**
 * Fallback weather estimation when external API is unreachable.
 */
function getFallbackWeather(lat: number, lng: number): WeatherData {
  const now = new Date();
  const hour = now.getHours();
  // Typical central Vietnam daytime temperature
  const baseTemp = hour >= 9 && hour <= 16 ? 29 : 25;

  return {
    temperature: baseTemp,
    apparentTemperature: baseTemp + 2,
    condition: 'Trời nắng nhẹ, mát mẻ',
    conditionCode: 1,
    icon: '☀️',
    rainProbability: 10,
    windSpeed: 12,
    uvIndex: hour >= 10 && hour <= 14 ? 6 : 3,
    isRainy: false,
    isHot: false,
    isPleasant: true,
    summaryText: `${baseTemp}°C · Nắng nhẹ · Khả năng mưa: 10%`,
    source: 'fallback',
    updatedAt: now.toISOString(),
  };
}

/**
 * Fetches real weather data for coordinates.
 */
export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
  const cacheKey = getCacheKey(lat, lng);
  const cached = weatherCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=precipitation_probability,uv_index&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Open-Meteo returned status ${response.status}`);
    }

    const json = (await response.json()) as any;
    const current = json?.current;
    const hourly = json?.hourly;

    const temp = Math.round(Number(current?.temperature_2m ?? 28));
    const appTemp = Math.round(Number(current?.apparent_temperature ?? temp));
    const code = Number(current?.weather_code ?? 1);
    const wind = Math.round(Number(current?.wind_speed_10m ?? 10));

    // Get current hour rain probability from hourly forecast
    const currentHourIdx = new Date().getHours();
    const rainProb = Math.round(
      Number(
        hourly?.precipitation_probability?.[currentHourIdx] ??
          (Number(current?.precipitation ?? 0) > 0 ? 80 : 15)
      )
    );
    const uv = Math.round(Number(hourly?.uv_index?.[currentHourIdx] ?? 4));

    const { condition, icon, isRain } = mapWmoCode(code);
    const isRainy = isRain || rainProb >= 45;
    const isHot = temp >= 33;
    const isPleasant = temp >= 22 && temp <= 31 && !isRainy;

    const summaryText = `${icon} ${temp}°C · ${condition} · Khả năng mưa: ${rainProb}%`;

    const weatherData: WeatherData = {
      temperature: temp,
      apparentTemperature: appTemp,
      condition,
      conditionCode: code,
      icon,
      rainProbability: rainProb,
      windSpeed: wind,
      uvIndex: uv,
      isRainy,
      isHot,
      isPleasant,
      summaryText,
      source: 'open-meteo',
      updatedAt: new Date().toISOString(),
    };

    weatherCache.set(cacheKey, {
      data: weatherData,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return weatherData;
  } catch (error) {
    console.warn(`[WeatherService] Error fetching weather for (${lat}, ${lng}), using fallback:`, (error as Error).message);
    const fallback = getFallbackWeather(lat, lng);
    weatherCache.set(cacheKey, {
      data: fallback,
      expiresAt: Date.now() + 2 * 60 * 1000, // shorter TTL on error
    });
    return fallback;
  }
}

