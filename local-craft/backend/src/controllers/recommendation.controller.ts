import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  isValidCoordinates,
  getClosestPresetLocationName,
  POPULAR_PRESET_LOCATIONS,
  geocodeAddress,
  reverseGeocodeCoordinates,
  locateByGoogleOrIp,
} from '../services/location.service';
import { getCurrentWeather } from '../services/weather.service';
import { findNearbyPlaces } from '../services/nearbyPlace.service';
import { generateSmartRecommendations, processAiChat } from '../services/recommendation.service';
import { generateOneDayItinerary, suggestCafeStops } from '../services/itinerary.service';

/**
 * GET /api/recommendations/smart
 * Main location-based smart recommendation endpoint.
 */
export const getSmartRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng, locationName, radius, preference, budget } = req.query;

  const userLat = Number(lat);
  const userLng = Number(lng);

  if (!isValidCoordinates(userLat, userLng)) {
    return sendError(
      res,
      'Toạ độ không hợp lệ. Vui lòng cung cấp vĩ độ (lat) và kinh độ (lng) chính xác.',
      400
    );
  }

  const radiusKm = Math.min(50, Math.max(1, Number(radius) || 5));
  const resolvedName =
    typeof locationName === 'string' && locationName.trim()
      ? locationName.trim()
      : getClosestPresetLocationName(userLat, userLng);

  // Run weather check and nearby place discovery concurrently
  const [weather, { places, effectiveRadiusKm }] = await Promise.all([
    getCurrentWeather(userLat, userLng),
    findNearbyPlaces(userLat, userLng, radiusKm),
  ]);

  const maxBudget = budget ? Number(budget) : undefined;
  const pref = typeof preference === 'string' ? (preference as any) : undefined;

  const result = await generateSmartRecommendations(
    userLat,
    userLng,
    resolvedName,
    weather,
    places,
    effectiveRadiusKm,
    { preference: pref, maxBudget }
  );

  sendSuccess(res, 'Lấy đề xuất thông minh theo vị trí và thời tiết thành công', result);
});

/**
 * GET /api/recommendations/presets
 * Returns popular preset locations.
 */
export const getPresetLocations = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, 'Danh sách địa điểm gợi ý phổ biến', POPULAR_PRESET_LOCATIONS);
});

/**
 * GET /api/recommendations/weather
 * Direct weather check endpoint for coordinates.
 */
export const getWeatherAtLocation = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const userLat = Number(lat);
  const userLng = Number(lng);

  if (!isValidCoordinates(userLat, userLng)) {
    return sendError(res, 'Toạ độ không hợp lệ.', 400);
  }

  const weather = await getCurrentWeather(userLat, userLng);
  sendSuccess(res, 'Lấy thông tin thời tiết thành công', weather);
});

/**
 * GET /api/recommendations/geocode?address=...
 * Geocodes an address or query to coordinates (Google Maps API with fallback).
 */
export const geocodeLocation = asyncHandler(async (req: Request, res: Response) => {
  const { address } = req.query;
  if (typeof address !== 'string' || !address.trim()) {
    return sendError(res, 'Vui lòng cung cấp địa chỉ hoặc từ khóa tìm kiếm.', 400);
  }

  const results = await geocodeAddress(address);
  sendSuccess(res, 'Tìm kiếm toạ độ địa chỉ thành công', results);
});

/**
 * GET /api/recommendations/reverse-geocode?lat=...&lng=...
 * Reverse geocodes coordinates to a Vietnamese address.
 */
export const reverseGeocodeLocation = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = req.query;
  const userLat = Number(lat);
  const userLng = Number(lng);

  if (!isValidCoordinates(userLat, userLng)) {
    return sendError(res, 'Toạ độ không hợp lệ.', 400);
  }

  const result = await reverseGeocodeCoordinates(userLat, userLng);
  sendSuccess(res, 'Giải mã địa chỉ toạ độ thành công', result);
});

/**
 * POST /api/recommendations/google-locate
 * Locates user using Google Maps Geolocation API or IP fallback.
 */
export const locateGoogleOrIpHandler = asyncHandler(async (req: Request, res: Response) => {
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = typeof forwarded === 'string'
    ? forwarded.split(',')[0].trim()
    : req.socket.remoteAddress;

  const result = await locateByGoogleOrIp(clientIp);
  if (!result) {
    return sendError(res, 'Không thể định vị tự động. Vui lòng tìm kiếm địa chỉ của bạn.', 404);
  }
  sendSuccess(res, 'Định vị vị trí thành công', result);
});

/**
 * POST /api/recommendations/chat
 * Conversational AI Assistant endpoint combining location, weather, and craft places.
 */
export const handleAiChat = asyncHandler(async (req: Request, res: Response) => {
  const { message, userLocation, history, preference, radius } = req.body;

  if (typeof message !== 'string' || !message.trim()) {
    return sendError(res, 'Vui lòng nhập nội dung câu hỏi.', 400);
  }

  const result = await processAiChat({
    message: message.trim(),
    userLocation,
    history,
    preference,
    radius: radius ? Number(radius) : undefined,
  });

  sendSuccess(res, 'Trợ lý AI phản hồi thành công', result);
});


/**
 * POST /api/recommendations/itinerary
 * Generates an AI-curated 1-day itinerary with cultural craft stops and cafes.
 */
export const handleGenerateItinerary = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, destination, theme, pace, userLocation, customRequirements } = req.body;

  const itinerary = await generateOneDayItinerary({
    prompt: typeof prompt === 'string' ? prompt.trim() : undefined,
    destination,
    theme,
    pace,
    userLocation,
    customRequirements,
  });

  sendSuccess(res, 'Tạo lịch trình 1 ngày thành công', itinerary);
});

/**
 * POST /api/recommendations/itinerary/suggest-cafe
 * Returns curated regional coffee & rest stops to interleave into an itinerary.
 */
export const handleSuggestCafe = asyncHandler(async (req: Request, res: Response) => {
  const { destination, currentStopsCount } = req.body;

  const cafes = await suggestCafeStops({
    destination,
    currentStopsCount: currentStopsCount ? Number(currentStopsCount) : undefined,
  });

  sendSuccess(res, 'Gợi ý quán cà phê nghỉ ngơi thành công', cafes);
});
