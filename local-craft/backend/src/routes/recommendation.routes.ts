import { Router } from 'express';
import {
  getSmartRecommendations,
  getPresetLocations,
  getWeatherAtLocation,
  geocodeLocation,
  reverseGeocodeLocation,
  locateGoogleOrIpHandler,
  handleAiChat,
  handleGenerateItinerary,
  handleSuggestCafe,
} from '../controllers/recommendation.controller';

const router = Router();

// Public routes for smart recommendation & AI Chat Assistant
router.get('/smart', getSmartRecommendations);
router.get('/presets', getPresetLocations);
router.get('/weather', getWeatherAtLocation);
router.get('/geocode', geocodeLocation);
router.get('/reverse-geocode', reverseGeocodeLocation);
router.post('/google-locate', locateGoogleOrIpHandler);
router.post('/chat', handleAiChat);
router.post('/itinerary', handleGenerateItinerary);
router.post('/itinerary/suggest-cafe', handleSuggestCafe);

export default router;

