import { Router } from 'express';
import {
  createNarrative,
  synthesizeAudio,
  generateStopAudio,
  streamAudio,
} from '../controllers/audioGuide.controller';

const router = Router();

// Sinh kịch bản thuyết minh (Storytelling script)
router.post('/narrative', createNarrative);

// Tổng hợp giọng nói thành file MP3 và upload Cloudinary
router.post('/synthesize', synthesizeAudio);

// Trọn gói: Kịch bản + Audio MP3 cho một chặng
router.post('/generate-stop-audio', generateStopAudio);

// Stream trực tiếp audio/mpeg về trình duyệt
router.get('/stream', streamAudio);

export default router;
