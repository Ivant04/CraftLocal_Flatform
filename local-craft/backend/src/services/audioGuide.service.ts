import cloudinary from '../config/cloudinary';

export type AudioGuideVoice = 'nhu' | 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';

export interface AudioGuideStopParams {
  title: string;
  location?: string;
  type?: string;
  notes?: string;
  voice?: AudioGuideVoice;
  language?: 'vi' | 'en';
}

export interface AudioGuideResult {
  narrativeText: string;
  audioUrl: string;
  durationSeconds: number;
  voice: string;
  source: 'elevenlabs+cloudinary' | 'openai_tts+cloudinary' | 'cached' | 'fallback_stream';
}

// In-memory cache for synthesized audio to save API calls and latency
const audioCache = new Map<string, { audioUrl: string; durationSeconds: number }>();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return String(Math.abs(hash));
}

/**
 * Generate cultural storytelling narrative script using OpenAI GPT-4o-mini
 */
export async function generateNarrative(params: AudioGuideStopParams): Promise<string> {
  const apiKey = process.env.CHAT_API_KEY || '';
  const baseUrl = (process.env.CHAT_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.CHAT_MODEL || 'gpt-4o-mini';

  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    return generateOfflineNarrative(params);
  }

  const isEn = params.language === 'en';

  const systemPrompt = isEn
    ? `You are Nhu — the signature cultural storyteller and audio guide narrator for the Vietnamese craft tourism platform CraftLocal.
Your persona is "Calm and Confident": warm, articulate, evocative, and reassuring.
Write a concise audio guide script (80-110 words, ~45-60 seconds of speech) for this workshop tour stop.
Focus on sensory details, heritage, artisans, and cultural significance.
Return ONLY the narration text, no headings, no quotes.`
    : `Bạn là Nhu — Thuyết minh viên âm thanh du lịch văn hóa độc quyền (Voice Persona: Nhu — Calm and Confident) của nền tảng làng nghề thủ công CraftLocal.
Phong thái bắt buộc: Điềm tĩnh, tự tin, phát âm chuẩn xác, sâu lắng, ấm áp và kết nối sâu sắc người nghe với tâm hồn của người nghệ nhân Việt.
Nhiệm vụ: Viết một đoạn kịch bản thuyết minh âm thanh (audio guide) ngắn gọn, giàu hình ảnh và nhịp điệu (khoảng 80-110 từ, thời lượng đọc ~45-60 giây) cho điểm dừng trong chuyến trải nghiệm.
Yêu cầu bắt buộc:
1. Mở đầu bằng lời chào nồng hậu, mời du khách chậm lại một nhịp và hướng mắt ngắm nhìn không gian trước mắt.
2. Nêu bật câu chuyện lịch sử, sự khéo léo của người nghệ nhân hoặc linh hồn của nghề truyền thống.
3. Sử dụng các câu ngắt nhịp văn hóa tự nhiên, giọng văn điềm đạm, kết thúc bằng một gợi ý tinh tế để du khách tự mình cảm nhận hoặc chạm tay vào hiện vật.
4. CHỈ TRẢ VỀ DUY NHẤT ĐOẠN VĂN THUYẾT MINH, không có tiêu đề, không có ngoặc kép ngoài viền.`;

  const userPrompt = isEn
    ? `Stop: ${params.title}\nLocation: ${params.location || 'Local Craft Village'}\nActivity Type: ${params.type || 'Experience'}\nNotes: ${params.notes || ''}`
    : `Tên chặng/Điểm dừng: ${params.title}\nĐịa điểm: ${params.location || 'Làng nghề Việt Nam'}\nLoại hình: ${params.type || 'Trải nghiệm'}\nGhi chú bổ sung: ${params.notes || ''}`;

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.warn('[AudioGuide] OpenAI Chat error:', res.status, await res.text());
      return generateOfflineNarrative(params);
    }

    const data: any = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || generateOfflineNarrative(params);
  } catch (err) {
    console.error('[AudioGuide] Narrative generation failed, using fallback:', err);
    return generateOfflineNarrative(params);
  }
}

/**
 * Fallback narrative when OpenAI chat is unreachable
 */
function generateOfflineNarrative(params: AudioGuideStopParams): string {
  const { title, location = 'làng nghề truyền thống', type = 'trải nghiệm' } = params;
  return `Chào mừng quý khách đã đến với chặng dừng chân ${title} tại ${location}. Nơi đây lưu giữ những giá trị văn hóa thủ công tinh hoa được truyền qua bao thế hệ nghệ nhân Việt Nam. Từng chi tiết, từng viên đất, sợi tơ đều mang trong mình hơi thở của lịch sử và sự tỉ mỉ, kiên trì của bàn tay người thợ. Trong chặng ${type} này, mời quý khách hãy chậm lại một nhịp, lắng nghe âm thanh quen thuộc của xưởng nghề và cảm nhận trọn vẹn nét đẹp di sản bản địa.`;
}

/**
 * Pre-processes Vietnamese text to improve natural pauses, breathing, and tonal clarity in TTS
 */
function prepareVietnameseTextForSpeech(text: string): string {
  let cleaned = text
    .replace(/["“”«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Thêm khoảng nghỉ nhẹ sau các liên từ nối quan trọng để giọng đọc tự nhiên
  cleaned = cleaned
    .replace(/\. /g, '... ')
    .replace(/; /g, ', ')
    .replace(/ - /g, '... ');

  return cleaned;
}

/**
 * Synthesize speech from text using Nhu - Calm & Confident profile
 * (ElevenLabs if API key configured, otherwise high-definition OpenAI TTS-1-HD with calm pacing)
 * and upload MP3 to Cloudinary
 */
export async function synthesizeSpeech(
  text: string,
  voice: AudioGuideVoice | string = 'nhu'
): Promise<{ audioUrl: string; durationSeconds: number; source: 'elevenlabs+cloudinary' | 'openai_tts+cloudinary' | 'cached' }> {
  const processedText = prepareVietnameseTextForSpeech(text);
  const cacheKey = `${voice}_eleven_v4_${simpleHash(text)}`;
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey)!;
    return { ...cached, source: 'cached' };
  }

  let buffer: Buffer;
  let sourceEngine: 'elevenlabs+cloudinary' | 'openai_tts+cloudinary' = 'openai_tts+cloudinary';

  // Option A: If ElevenLabs API Key is provided, use the native ElevenLabs v4 model directly without overriding voice settings
  const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
  if (elevenLabsApiKey && !elevenLabsApiKey.startsWith('placeholder')) {
    const elevenVoiceId = process.env.ELEVENLABS_VOICE_ID || 'Gsu64Edc28AUbKHbhJFn'; // Vũ Nhàn AI Narrative Story Voice
    const rawText = text.trim();

    const elRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: rawText,
        model_id: 'eleven_v4',
      }),
    });

    if (elRes.ok) {
      const arrayBuffer = await elRes.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      sourceEngine = 'elevenlabs+cloudinary';
    } else {
      console.warn('[AudioGuide] ElevenLabs returned error, falling back to OpenAI HD:', await elRes.text());
      buffer = await synthesizeWithOpenAIHD(processedText, voice);
    }
  } else {
    // Option B: OpenAI TTS-1-HD tuned for Calm & Confident storytelling (Speed 0.90, natural pauses)
    buffer = await synthesizeWithOpenAIHD(processedText, voice);
  }

  // Upload MP3 buffer to Cloudinary with resource_type: 'raw'
  const uploadResult = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: 'craftlocal/audio-guides',
        format: 'mp3',
        public_id: `audio_guide_${Date.now()}_${simpleHash(text).slice(0, 8)}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  const wordCount = text.trim().split(/\s+/).length;
  // Average speaking rate in Vietnamese is ~120-140 words per minute (~2.2 words/sec)
  const durationSeconds = Math.max(15, Math.round(wordCount / 2.2));

  const result = {
    audioUrl: uploadResult.secure_url,
    durationSeconds,
  };

  audioCache.set(cacheKey, result);

  return {
    ...result,
    source: sourceEngine,
  };
}

/**
 * Helper to synthesize with OpenAI TTS-1-HD tuned to Calm & Confident storytelling profile
 */
async function synthesizeWithOpenAIHD(processedText: string, voice: string): Promise<Buffer> {
  const apiKey = process.env.CHAT_API_KEY || '';
  if (!apiKey || apiKey.startsWith('sk-placeholder')) {
    throw new Error('Chưa cấu hình API Key cho dịch vụ tổng hợp giọng nói (CHAT_API_KEY)');
  }

  // Map 'nhu' to 'nova' (warm, clear female articulation), with calm pace 0.90
  const openAIVoice = voice === 'nhu' ? 'nova' : voice;

  const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd',
      input: processedText,
      voice: openAIVoice,
      speed: 0.90, // Pacing: Calm, steady, evocative
      response_format: 'mp3',
    }),
  });

  if (!ttsResponse.ok) {
    const errorBody = await ttsResponse.text();
    throw new Error(`OpenAI TTS Error (${ttsResponse.status}): ${errorBody}`);
  }

  const arrayBuffer = await ttsResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Convenience method: Generate narrative and synthesize audio MP3 in one shot
 */
export async function generateStopAudioGuide(params: AudioGuideStopParams): Promise<AudioGuideResult> {
  const voice = params.voice || 'nhu';
  const narrativeText = await generateNarrative(params);
  const { audioUrl, durationSeconds, source } = await synthesizeSpeech(narrativeText, voice);

  return {
    narrativeText,
    audioUrl,
    durationSeconds,
    voice,
    source,
  };
}
