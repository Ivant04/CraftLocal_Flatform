import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendError } from '../utils/apiResponse';
import {
  generateNarrative,
  synthesizeSpeech,
  generateStopAudioGuide,
  AudioGuideStopParams,
} from '../services/audioGuide.service';

/**
 * POST /api/audio-guide/narrative
 * Generate storytelling script using AI for a stop
 */
export const createNarrative = asyncHandler(async (req: Request, res: Response) => {
  const { title, location, type, notes, language } = req.body;
  if (!title) {
    return sendError(res, 'Thiếu tiêu đề chặng (title)', 400);
  }

  const narrativeText = await generateNarrative({
    title,
    location,
    type,
    notes,
    language: language === 'en' ? 'en' : 'vi',
  });

  return sendSuccess(res, 'Tạo kịch bản thuyết minh thành công', { narrativeText });
});

/**
 * POST /api/audio-guide/synthesize
 * Synthesize voice audio MP3 from text using OpenAI TTS-1 and upload to Cloudinary
 */
export const synthesizeAudio = asyncHandler(async (req: Request, res: Response) => {
  const { text, voice = 'nhu' } = req.body;
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return sendError(res, 'Thiếu nội dung văn bản để đọc (text)', 400);
  }

  const allowedVoices = ['nhu', 'nova', 'alloy', 'echo', 'fable', 'onyx', 'shimmer'];
  const chosenVoice = allowedVoices.includes(voice) ? voice : 'nhu';

  const result = await synthesizeSpeech(text.trim(), chosenVoice as any);

  return sendSuccess(res, 'Chuyển đổi giọng nói và lưu trữ audio MP3 thành công', result);
});

/**
 * POST /api/audio-guide/generate-stop-audio
 * One-shot endpoint: Generate cultural narrative + Synthesize MP3 + Upload Cloudinary
 */
export const generateStopAudio = asyncHandler(async (req: Request, res: Response) => {
  const { title, location, type, notes, voice = 'nhu', language = 'vi' } = req.body;
  if (!title) {
    return sendError(res, 'Thiếu tiêu đề chặng (title)', 400);
  }

  const params: AudioGuideStopParams = {
    title,
    location,
    type,
    notes,
    voice: voice || 'nhu',
    language: language === 'en' ? 'en' : 'vi',
  };

  const result = await generateStopAudioGuide(params);

  return sendSuccess(res, 'Tạo thuyết minh âm thanh AI cho chặng thành công', result);
});

/**
 * GET /api/audio-guide/stream?text=...&voice=...
 * Streams audio/mpeg directly to the browser for instant playback
 */
export const streamAudio = asyncHandler(async (req: Request, res: Response) => {
  const text = (req.query.text as string) || '';
  const voice = (req.query.voice as string) || 'nova';

  if (!text.trim()) {
    return sendError(res, 'Thiếu tham số text', 400);
  }

  const apiKey = process.env.CHAT_API_KEY || '';
  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return sendError(res, 'Chưa cấu hình API Key dịch vụ giọng nói', 500);
  }

  const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: text.trim(),
      voice,
      speed: 0.93,
      response_format: 'mp3',
    }),
  });

  if (!ttsResponse.ok || !ttsResponse.body) {
    return sendError(res, 'Không thể tạo âm thanh trực tiếp', 500);
  }

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  const arrayBuffer = await ttsResponse.arrayBuffer();
  res.send(Buffer.from(arrayBuffer));
});
