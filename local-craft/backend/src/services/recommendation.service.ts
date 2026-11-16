/**
 * Recommendation Service
 * AI & Smart Scoring Engine combining user location, real-time weather,
 * distance, activity type, opening hours, and budget.
 *
 * Guarantees zero hallucination: all recommendations come strictly from real database entities.
 */

import { WeatherData, getCurrentWeather } from './weather.service';
import { NearbyPlace, findNearbyPlaces } from './nearbyPlace.service';
import { isValidCoordinates } from './location.service';
import { env } from '../config/env';

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

export interface RecommendationOptions {
  preference?: 'all' | 'indoor' | 'outdoor' | 'workshop' | 'store';
  maxBudget?: number;
}

/**
 * Calculates a matching score for each nearby place based on weather, distance, rating, and user constraints.
 */
function scorePlace(
  place: NearbyPlace,
  weather: WeatherData,
  options?: RecommendationOptions
): { score: number; aiBadge: string; aiReasoning: string } {
  let score = 0;
  let aiBadge = 'Gợi ý nổi bật';
  let aiReasoning = `Cách bạn ${place.distanceLabel}, được đánh giá ⭐ ${place.rating}.`;

  // 1. Distance scoring (0 - 40 pts)
  if (place.distanceKm <= 1.0) {
    score += 40;
  } else if (place.distanceKm <= 2.5) {
    score += 32;
  } else if (place.distanceKm <= 5.0) {
    score += 22;
  } else if (place.distanceKm <= 10.0) {
    score += 12;
  } else {
    score += 5;
  }

  // 2. Rating scoring (0 - 20 pts)
  score += Math.min(20, (place.rating / 5) * 20);

  // 3. Weather Suitability (0 - 35 pts)
  if (weather.isRainy) {
    if (place.isIndoor) {
      score += 35;
      aiBadge = 'Hoạt động trong nhà tránh mưa';
      aiReasoning = `Thời tiết có mưa (${weather.rainProbability}%). Không gian trong nhà ấm cúng, thích hợp trải nghiệm chế tác khô ráo.`;
    } else {
      score -= 25;
      aiBadge = 'Hoạt động ngoài trời (Cần mang ô/áo mưa)';
      aiReasoning = `Địa điểm ngoài trời, nên chuẩn bị ô dù nếu bạn ghé thăm lúc này.`;
    }
  } else if (weather.isHot) {
    if (place.isIndoor) {
      score += 30;
      aiBadge = 'Không gian xưởng mát mẻ';
      aiReasoning = `Nhiệt độ ngoài trời ${weather.temperature}°C. Xưởng thủ công mát mẻ giúp bạn trải nghiệm thoải mái tránh nắng gắt.`;
    } else {
      score -= 10;
      aiBadge = 'Nắng ráo · Nên mang mũ nón';
      aiReasoning = `Thời tiết nắng, thích hợp nếu đi vào sáng sớm hoặc chiều mát.`;
    }
  } else if (weather.isPleasant) {
    if (place.isOutdoor) {
      score += 35;
      aiBadge = 'Lý tưởng trải nghiệm ngoài trời';
      aiReasoning = `Thời tiết tuyệt đẹp (${weather.temperature}°C, mát mẻ). Rất lý tưởng để dạo quanh làng nghề và trải nghiệm không gian mở.`;
    } else {
      score += 20;
      aiBadge = 'Phù hợp với thời tiết hiện tại';
      aiReasoning = `Thời tiết thuận lợi, dễ dàng di chuyển và tham gia trải nghiệm.`;
    }
  } else {
    score += 15;
    aiBadge = 'Phù hợp mọi thời tiết';
    aiReasoning = `Thời tiết ổn định, thuận tiện cho việc tham quan và trải nghiệm.`;
  }

  // 4. Preferences & Budget adjustment
  if (options?.preference) {
    if (options.preference === 'indoor' && place.isIndoor) score += 15;
    if (options.preference === 'outdoor' && place.isOutdoor) score += 15;
    if (options.preference === 'workshop' && place.type === 'WORKSHOP') score += 15;
    if (options.preference === 'store' && place.type === 'CRAFT_STORE') score += 15;
  }

  if (options?.maxBudget && place.price !== undefined) {
    if (place.price <= options.maxBudget) score += 10;
    else score -= 15;
  }

  return { score: Math.round(score), aiBadge, aiReasoning };
}

/**
 * Generates synthesis advice text based on current weather.
 */
function buildAiAdvice(weather: WeatherData): {
  headline: string;
  analysis: string;
  weatherBadge: string;
  suggestedFocus: 'INDOOR' | 'OUTDOOR' | 'ALL';
} {
  if (weather.isRainy) {
    return {
      headline: 'Thời tiết có khả năng mưa cao',
      analysis: `Trời đang ${weather.condition.toLowerCase()} với khả năng mưa ${weather.rainProbability}%. CraftLocal AI đề xuất các hoạt động trong nhà, xưởng gốm, xưởng dệt và cửa hàng thủ công ấm cúng gần bạn nhất.`,
      weatherBadge: `🌧️ Mưa ${weather.rainProbability}% · Ưu tiên trong nhà`,
      suggestedFocus: 'INDOOR',
    };
  }

  if (weather.isHot) {
    return {
      headline: 'Nắng ấm, nhiệt độ tương đối cao',
      analysis: `Nhiệt độ hiện tại khoảng ${weather.temperature}°C (cảm giác ${weather.apparentTemperature}°C) với chỉ số UV ${weather.uvIndex}. CraftLocal AI đề xuất các xưởng thủ công có không gian che chắn mát mẻ và tiệm quà lưu niệm gần bạn.`,
      weatherBadge: `☀️ Nắng ${weather.temperature}°C · Ưu tiên không gian mát`,
      suggestedFocus: 'INDOOR',
    };
  }

  return {
    headline: 'Thời tiết lý tưởng cho trải nghiệm',
    analysis: `Trời ${weather.condition.toLowerCase()} với nhiệt độ ${weather.temperature}°C rất dễ chịu và gió mát. CraftLocal AI đề xuất bạn ghé thăm các làng nghề truyền thống, lớp workshop và không gian văn hóa ngoài trời quanh đây.`,
    weatherBadge: `☀️ Thời tiết tốt (${weather.temperature}°C) · Lý tưởng dạo chơi`,
    suggestedFocus: 'OUTDOOR',
  };
}

/**
 * Optional OpenAI LLM enhancement when CHAT_API_KEY is configured.
 * Strictly constrained to candidate IDs to prevent hallucination.
 */
async function callOpenAiForPersonalization(
  candidates: RecommendedActivity[],
  weather: WeatherData,
  locationName: string
): Promise<{ headline?: string; analysis?: string; reasons?: Record<string, string> } | null> {
  const apiKey = process.env.CHAT_API_KEY || '';
  if (!apiKey || apiKey.startsWith('sk-placeholder')) return null;

  const baseUrl = (process.env.CHAT_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = process.env.CHAT_MODEL || 'gpt-4o-mini';

  const promptData = {
    location: locationName,
    weather: {
      temperature: weather.temperature,
      condition: weather.condition,
      rainProbability: weather.rainProbability,
      isRainy: weather.isRainy,
    },
    candidates: candidates.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.typeLabel,
      distance: c.distanceLabel,
      isIndoor: c.isIndoor,
      price: c.priceLabel,
    })),
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content:
              'Bạn là AI Cố Vấn Làng Nghề thông minh của CraftLocal. Nhiệm vụ: Phân tích thời tiết hiện tại và đề xuất hoạt động phù hợp. CHỈ sử dụng đúng các ID có trong danh sách cung cấp. Trả về JSON hợp lệ gồm: { "headline": string, "analysis": string, "reasons": { [id]: string } }.',
          },
          {
            role: 'user',
            content: `Dữ liệu:\n${JSON.stringify(promptData, null, 2)}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = (await res.json()) as any;
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content);
  } catch (err) {
    // Graceful fallback to deterministic engine
    return null;
  }
}

/**
 * Main Smart Recommendation generator.
 */
export async function generateSmartRecommendations(
  userLat: number,
  userLng: number,
  locationName: string,
  weather: WeatherData,
  nearbyPlaces: NearbyPlace[],
  radiusKm: number,
  options?: RecommendationOptions
): Promise<SmartRecommendationResult> {
  // Score all nearby places
  const scoredPlaces: RecommendedActivity[] = nearbyPlaces.map((place) => {
    const { score, aiBadge, aiReasoning } = scorePlace(place, weather, options);
    return {
      ...place,
      score,
      aiBadge,
      aiReasoning,
      rank: 0,
    };
  });

  // Sort by score descending, then by distance ascending
  scoredPlaces.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.distanceKm - b.distanceKm;
  });

  // Pick top 3 to 5 places
  const topRecommendations = scoredPlaces.slice(0, 5).map((place, index) => ({
    ...place,
    rank: index + 1,
  }));

  // Default algorithmic AI advice
  const baseAiAdvice = buildAiAdvice(weather);
  let finalHeadline = baseAiAdvice.headline;
  let finalAnalysis = baseAiAdvice.analysis;
  let usedEngine: 'openai+smart_scoring' | 'smart_scoring_engine' = 'smart_scoring_engine';

  // Optional LLM enhancement if key works
  if (topRecommendations.length > 0) {
    const llmResult = await callOpenAiForPersonalization(
      topRecommendations,
      weather,
      locationName
    );

    if (llmResult) {
      usedEngine = 'openai+smart_scoring';
      if (llmResult.headline) finalHeadline = llmResult.headline;
      if (llmResult.analysis) finalAnalysis = llmResult.analysis;
      if (llmResult.reasons) {
        topRecommendations.forEach((rec) => {
          if (llmResult.reasons?.[rec.id]) {
            rec.aiReasoning = llmResult.reasons[rec.id];
          }
        });
      }
    }
  }

  return {
    userLocation: {
      lat: userLat,
      lng: userLng,
      name: locationName,
    },
    weather,
    aiAdvice: {
      headline: finalHeadline,
      analysis: finalAnalysis,
      weatherBadge: baseAiAdvice.weatherBadge,
      suggestedFocus: baseAiAdvice.suggestedFocus,
    },
    recommendations: topRecommendations,
    allNearbyPlaces: nearbyPlaces,
    meta: {
      totalNearby: nearbyPlaces.length,
      radiusKm,
      generatedAt: new Date().toISOString(),
      engine: usedEngine,
    },
  };
}

export interface AiChatParams {
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

export interface AiChatResponse {
  reply: string;
  recommendations: RecommendedActivity[];
  weather: WeatherData;
  location: { lat: number; lng: number; name: string };
  suggestedPrompts: string[];
}

/**
 * Checks whether the user's inquiry is explicitly or implicitly asking for
 * place recommendations, nearby workshops, shops, or where to go.
 */
function isPlaceRecommendationIntent(message: string): boolean {
  const m = message.toLowerCase();
  const discoveryKeywords = [
    'gợi ý',
    'ở đâu',
    'chỗ nào',
    'nơi nào',
    'tìm xưởng',
    'tìm nơi',
    'tìm quán',
    'tìm cửa hàng',
    'tìm workshop',
    'địa chỉ',
    'địa điểm',
    'quanh đây',
    'gần đây',
    'gần tôi',
    'gần nhất',
    'đi đâu',
    'chơi đâu',
    'hôm nay đi đâu',
    'thời tiết',
    'mưa nên đi',
    'nắng nên đi',
    'mua quà',
    'mua lưu niệm',
    'xem trên bản đồ',
    'chỉ đường',
    'recommend',
    'nearby',
    'place',
    'workshop gần',
    'làng nghề gần',
  ];
  return discoveryKeywords.some((kw) => m.includes(kw));
}

/**
 * High-quality fallback responses when LLM API is unavailable or offline.
 * Covers Vietnamese craft heritage, techniques, CraftLocal platform guidance, and place discovery.
 */
function generateFallbackResponse(
  msg: string,
  targetName: string,
  weather: WeatherData,
  topRecommendations: RecommendedActivity[],
  radiusKm: number
): { replyText: string; suggestedPrompts: string[]; attachRecommendations: boolean } {
  const m = msg.toLowerCase();

  // 1. Pottery / Gốm
  if (m.includes('gốm') || m.includes('bát tràng') || m.includes('thanh hà') || m.includes('chu đậu') || m.includes('nặn')) {
    const potteryRecs = topRecommendations.filter(
      (r) => r.name.toLowerCase().includes('gốm') || r.shortDescription.toLowerCase().includes('gốm')
    );
    const hasPottery = potteryRecs.length > 0;
    return {
      replyText: `**Nghệ thuật Gốm sứ truyền thống Việt Nam** mang bề dày lịch sử hàng nghìn năm văn hiến:

- **Các làng gốm tiêu biểu**:
  - **Gốm Bát Tràng (Hà Nội)**: Hình thành từ thế kỷ 14–15, nổi tiếng với kỹ thuật vẽ lam, men rạn, men ngọc tinh xảo.
  - **Gốm Thanh Hà (Hội An)**: Làng gốm đất nung truyền thống hơn 500 năm tuổi, giữ trọn nét mộc mạc của đất phù sa sông Thu Bồn.
  - **Gốm Chu Đậu (Hải Dương)**: Dòng gốm đạo cao cấp với men tro trấu tự nhiên, biểu trưng "Hồn Việt - Đất Việt".

- **Quy trình chế tác thủ công cơ bản**:
  1. *Chọn & luyện đất*: Đất sét được phơi, ngâm lắng và lọc kỹ để đạt độ dẻo mịn tối đa.
  2. *Tạo hình*: Nghệ nhân vuốt tay trên bàn xoay hoặc đổ khuôn để tạo dáng sản phẩm.
  3. *Tiện gọt & trang trí*: Khắc hoa văn, vẽ họa tiết màu khoáng tự nhiên.
  4. *Tráng men & Nung lò*: Nung ở nhiệt độ từ 1.000°C - 1.300°C để tạo màu men sáng bóng, bền chắc.

${hasPottery ? 'Bạn có thể tham gia trải nghiệm tự tay vuốt gốm tại các workshop gần bạn bên dưới!' : 'Bạn có thể ghé thăm các xưởng gốm để trực tiếp trải nghiệm vuốt gốm và mang thành phẩm về nhà!'}`,
      suggestedPrompts: [
        'Gợi ý workshop làm gốm gần tôi',
        'Cách tráng men gốm truyền thống',
        'Lịch sử làng gốm Thanh Hà Hội An',
      ],
      attachRecommendations: hasPottery,
    };
  }

  // 2. Silk / Lụa / Dệt vải
  if (m.includes('lụa') || m.includes('dệt') || m.includes('vạn phúc') || m.includes('tơ tằm') || m.includes('mã châu') || m.includes('vải')) {
    return {
      replyText: `**Nghề dệt lụa tơ tằm truyền thống** là một trong những niềm tự hào di sản văn hóa Việt Nam:

- **Các làng lụa trứ danh**:
  - **Lụa Vạn Phúc (Hà Đông, Hà Nội)**: Có lịch sử hơn 1.000 năm, nổi danh với chất lụa mượt mà óng ả, đặc biệt là dòng lụa Vân thêu hoa chìm tinh xảo.
  - **Lụa Mã Châu (Duy Xuyên, Quảng Nam)**: Làng dệt lâu đời gắn liền với con đường tơ lụa ven sông Thu Bồn.
  - **Lụa Bảo Lộc (Lâm Đồng)**: Thủ phủ dâu tằm tơ hiện đại với sợi tơ óng tự nhiên chất lượng quốc tế.

- **Cách phân biệt lụa tơ tằm tự nhiên**:
  - *Cảm giác xúc giác*: Chạm vào có độ mát dịu, nhẹ tênh và êm ái, sợi vải bắt sáng tự nhiên lấp lánh nhẹ theo góc nhìn.
  - *Thử nhiệt*: Sợi tơ tằm thật khi đốt cháy chậm, có mùi khét hữu cơ tựa tóc cháy và tàn tro vụn mịn dễ bóp nát, không vón cục nhựa như vải nhân tạo.`,
      suggestedPrompts: [
        'Làng lụa Vạn Phúc có từ bao giờ?',
        'Quy trình ươm tơ dệt lụa truyền thống',
        'Tìm quà lưu niệm lụa tơ tằm',
      ],
      attachRecommendations: false,
    };
  }

  // 3. Conical Hat / Nón lá
  if (m.includes('nón lá') || m.includes('nón') || m.includes('làng chuông') || m.includes('bài thơ')) {
    return {
      replyText: `**Chiếc nón lá truyền thống** là biểu tượng mộc mạc, dịu dàng gắn liền với tâm hồn người phụ nữ Việt:

- **Làng Chuông (Thanh Oai, Hà Nội)**: Trung tâm làm nón lá nức tiếng miền Bắc, chuyên các loại nón ba tầm, nón quai thao và nón chóp lá trắng muốt.
- **Nón bài thơ xứ Huế**: Chiếc nón độc đáo được kẹp giữa hai lớp lá những câu thơ chữ Hán hoặc cảnh đẹp cố đô (Chùa Thiên Mụ, Cầu Tràng Tiền), chỉ khi soi lên ánh nắng mặt trời mới hiện rõ bức họa ẩn bên trong.
- **Quy trình làm nón**:
  1. *Lựa lá & sấy lá*: Chọn lá cọ non hoặc lá lụi, vò trong cát nóng và là phẳng trên than hồng.
  2. *Uốn vành nón*: Dùng thân nứa vót tròn uốn thành 16 vành tre từ nhỏ đến lớn.
  3. *Khâu nón*: Người thợ khâu từng đường chỉ cước đều tăm tắp, kết thúc bằng việc chằm chóp và đan chỉ màu trang trí.`,
      suggestedPrompts: [
        'Ý nghĩa văn hóa của nón bài thơ Huế',
        'Cách bảo quản nón lá bền đẹp',
        'Gợi ý điểm mua nón lá lưu niệm',
      ],
      attachRecommendations: false,
    };
  }

  // 4. Stone Carving / Non Nước
  if (m.includes('đá') || m.includes('non nước') || m.includes('điêu khắc')) {
    return {
      replyText: `**Làng nghề Điêu khắc đá mỹ nghệ Non Nước** (Ngũ Hành Sơn, Đà Nẵng) là di sản văn hóa phi vật thể quốc gia có lịch sử hơn 400 năm:

- **Đặc trưng**: Khởi nguồn từ thế kỷ 17 dưới chân núi Ngũ Hành Sơn. Các nghệ nhân tài hoa biến những khối đá cẩm thạch thô ráp thành những pho tượng Phật, tượng linh vật, tranh phù điêu và đồ trang sức bằng đá tinh xảo.
- **Kỹ thuật**: Kết hợp giữa kỹ thuật đục phá thô, gọt tỉa đường nét chi tiết và mài nhẵn đánh bóng thủ công hoàn toàn bằng bàn tay khéo léo.
- **Lưu ý tham quan**: Khi đến Đà Nẵng, bạn có thể ghé thăm trực tiếp các xưởng điêu khắc dọc đường Huyền Trân Công Chúa để tận mắt xem nghệ nhân chế tác.`,
      suggestedPrompts: [
        'Làng đá Non Nước Đà Nẵng ở đâu?',
        'Kinh nghiệm tham quan Ngũ Hành Sơn',
        'Cửa hàng quà lưu niệm đá mỹ nghệ',
      ],
      attachRecommendations: false,
    };
  }

  // 5. Platform guidance: Booking, PayOS payment, cancellations
  if (
    m.includes('đặt vé') ||
    m.includes('thanh toán') ||
    m.includes('payos') ||
    m.includes('vietqr') ||
    m.includes('hướng dẫn') ||
    m.includes('craftlocal') ||
    m.includes('đặt chỗ') ||
    m.includes('hủy vé') ||
    m.includes('website') ||
    m.includes('web')
  ) {
    return {
      replyText: `**Hướng dẫn trải nghiệm & Đặt vé workshop trên CraftLocal**:

1. **Tìm kiếm & Lựa chọn**:
   - Khám phá các workshop theo thể loại (Làm gốm, Dệt lụa, Điêu khắc, Đan lát...) hoặc theo khu vực gần bạn.
   - Bấm vào chi tiết workshop để xem nội dung trải nghiệm, nghệ nhân hướng dẫn, thời lượng và mức giá.

2. **Chọn Lịch & Số lượng người**:
   - Chọn ngày tham gia và khung giờ trải nghiệm phù hợp với lịch trình của bạn.
   - Nhập số lượng người tham gia và thông tin người liên hệ.

3. **Thanh toán bảo mật qua PayOS**:
   - Hệ thống tự động tạo mã **VietQR** chuẩn ngân hàng. Bạn chỉ cần mở ứng dụng ngân hàng và quét mã để thanh toán tức thì (hoặc chọn thanh toán qua thẻ).
   - Hệ thống tự động xác nhận trong vài giây ngay khi chuyển khoản thành công.

4. **Nhận vé & Quản lý**:
   - Thông tin vé và mã QR check-in được lưu trực tiếp trong mục **Trang cá nhân > Lịch sử đặt chỗ**.
   - Bạn chỉ cần xuất trình mã vé tại xưởng khi đến tham gia trải nghiệm!`,
      suggestedPrompts: [
        'Gợi ý workshop nổi bật hôm nay',
        'Thời tiết hôm nay nên đi đâu?',
        'Chính sách hoàn hủy vé workshop',
      ],
      attachRecommendations: false,
    };
  }

  // 5.1 Itinerary / Lịch trình 1 ngày
  if (
    m.includes('lịch trình') ||
    m.includes('hành trình') ||
    m.includes('kế hoạch 1 ngày') ||
    m.includes('đi 1 ngày') ||
    m.includes('đi một ngày')
  ) {
    return {
      replyText: `**Gợi ý Lịch trình 1 ngày trải nghiệm làng nghề & văn hóa tại ${targetName}**:

1. **Buổi sáng (08:00 - 11:30)**: Khởi đầu bằng tách cà phê truyền thống và điểm tâm đặc sản địa phương, sau đó tham gia **Workshop chế tác thủ công** (vuốt gốm, dệt lụa, làm nón lá hoặc điêu khắc đá).
2. **Buổi trưa (12:00 - 13:30)**: Thưởng thức bữa trưa ẩm thực dân gian truyền thống tại nhà hàng bản địa.
3. **Đầu giờ chiều (13:30 - 15:00)**: **Nghỉ trưa & Cà phê văn hóa xen kẽ** (không gian sân vườn rợp bóng mát, thưởng trà thảo mộc thanh nhiệt).
4. **Buổi chiều (15:15 - 17:30)**: Tham quan làng nghề cổ, giao lưu cùng nghệ nhân và chọn mua quà lưu niệm thủ công.
5. **Buổi tối (17:30 - 19:30)**: Dạo ngắm hoàng hôn, đi thuyền thả hoa đăng hoặc thưởng thức ẩm thực đêm.

Bạn có thể bấm vào nút **Mở & Tùy chỉnh Lịch trình 1 ngày chi tiết** ngay bên dưới để xem thời gian biểu, đổi thứ tự các chặng hoặc thêm các quán cà phê nghỉ ngơi bằng AI nhé!`,
      suggestedPrompts: [
        'Lập lịch trình 1 ngày ở Hội An',
        'Gợi ý quán cà phê nghỉ ngơi',
        'Workshop làm gốm gần tôi',
      ],
      attachRecommendations: false,
    };
  }

  // 5.2 Cafe / Cà phê nghỉ ngơi
  if (m.includes('cà phê') || m.includes('quán nước') || m.includes('nghỉ ngơi') || m.includes('nghỉ chân') || m.includes('cafe')) {
    return {
      replyText: `**Gợi ý các điểm cà phê & nghỉ chân đậm chất văn hóa tại ${targetName}**:

- **Không gian hoài cổ & Sân vườn**: Các quán cà phê nhà cổ rêu phong hoặc vườn sinh thái rợp bóng cây, rất thích hợp để nghỉ ngơi tránh nắng gắt giữa ngày.
- **Thức uống đặc sắc**: Trà sen cung đình, nước thảo mộc thanh lọc cơ thể, cà phê muối xứ Quảng, cà phê trứng béo ngậy.
- **Tiện ích**: Bàn ghế gỗ mộc, tiếng nước chảy róc rách hoặc âm nhạc Trịnh Công Sơn êm dịu, giúp bạn hồi phục năng lượng sau các buổi làm workshop.

Bạn có thể mở **Lịch trình 1 ngày** và bấm **"Gợi ý quán cà phê nghỉ ngơi bằng AI"** để tự động chèn quán cà phê phù hợp vào giữa các hoạt động nhé!`,
      suggestedPrompts: [
        'Gợi ý quán cà phê nghỉ ngơi',
        'Lập lịch trình 1 ngày ở Hội An',
        'Thời tiết hôm nay nên đi đâu?',
      ],
      attachRecommendations: false,
    };
  }

  // 6. Greetings / Assistant intro
  if (m.includes('chào') || m.includes('hello') || m.includes('hi') || m.includes('bạn là ai') || m.includes('giúp gì')) {
    return {
      replyText: `Xin chào bạn! Mình là **Trợ lý AI CraftLocal** ✨

Mình có thể hỗ trợ bạn:
- **Giải đáp kiến thức di sản & văn hóa**: Lịch sử các làng nghề thủ công Việt Nam (gốm, lụa, nón lá, đồng, bạc, mây tre...).
- **Hướng dẫn quy trình kỹ thuật**: Các bước tạo tác sản phẩm thủ công truyền thống, cách phân biệt thật giả và bảo quản.
- **Tư vấn du lịch & workshop**: Đề xuất địa điểm phù hợp theo vị trí thực tế và thời tiết hôm nay.
- **Hỗ trợ nền tảng**: Cách đặt vé, chọn lịch và thanh toán tiện lợi qua PayOS VietQR.

Bạn muốn tìm hiểu hoặc cần mình tư vấn điều gì hôm nay?`,
      suggestedPrompts: [
        'Lịch sử làng gốm Bát Tràng',
        'Gợi ý workshop gần tôi',
        'Thời tiết hôm nay nên đi đâu?',
        'Cách đặt vé workshop & thanh toán',
      ],
      attachRecommendations: false,
    };
  }

  // 7. Place Discovery / Weather Recommendation (default)
  const weatherNotice = weather.isRainy
    ? `Hiện tại trời đang có mưa (${weather.rainProbability}%). Mình ưu tiên đề xuất các xưởng thủ công trong nhà ấm cúng để bạn thoải mái trải nghiệm khô ráo!`
    : weather.isHot
    ? `Nhiệt độ hiện tại khoảng ${weather.temperature}°C khá nắng nóng. Các xưởng thủ công thoáng mát có bóng râm sẽ là lựa chọn tuyệt vời nhất cho bạn lúc này.`
    : `Thời tiết tại ${targetName} hiện tại rất lý tưởng (${weather.condition}, ${weather.temperature}°C). Rất thích hợp để bạn dạo chơi các làng nghề và tham gia trải nghiệm thực tế!`;

  if (topRecommendations.length > 0) {
    const topList = topRecommendations
      .map(
        (r) =>
          `- **${r.name}** (${r.typeLabel}) · Cách ${r.distanceLabel} · ★ ${r.rating}\n  *${r.aiBadge}*`
      )
      .join('\n\n');

    return {
      replyText: `Chào bạn! Mình là **Trợ lý AI CraftLocal** ✨\n\n${weatherNotice}\n\nDựa trên vị trí **${targetName}**, mình gợi ý cho bạn các hoạt động phù hợp nhất bên dưới:\n\n${topList}\n\nBạn có thể nhấp vào từng thẻ bên dưới để **Xem chi tiết**, **Chỉ đường** hoặc mở **Bản đồ** trực quan nhé!`,
      suggestedPrompts: [
        'Workshop làm gốm gần đây',
        'Làng nghề dệt lụa truyền thống',
        'Cách đặt vé workshop trên web',
        'Cửa hàng quà lưu niệm',
      ],
      attachRecommendations: true,
    };
  } else {
    return {
      replyText: `Chào bạn! Tại khu vực **${targetName}** trong bán kính ${radiusKm}km hiện chưa có địa điểm làng nghề phù hợp với từ khóa này. Bạn có thể mở rộng bán kính tìm kiếm hoặc chọn các thành phố làng nghề nổi tiếng như **Hội An**, **Đà Nẵng**, **Huế** hoặc **Bát Tràng** nhé!`,
      suggestedPrompts: [
        'Khám phá làng nghề Hội An',
        'Lịch sử làng gốm Bát Tràng',
        'Cách đặt vé workshop trên CraftLocal',
      ],
      attachRecommendations: false,
    };
  }
}

/**
 * Handles conversational queries with CraftLocal AI Assistant.
 * Answers ANY craft, cultural, technical, platform, or general question,
 * combining real-time location, live weather API, and real database entities.
 */
export async function processAiChat(params: AiChatParams): Promise<AiChatResponse> {
  const msg = (params.message || '').trim().toLowerCase();

  // 1. Determine target location
  let targetLat: number =
    typeof params.userLocation?.lat === 'number' && isValidCoordinates(params.userLocation.lat, params.userLocation?.lng)
      ? params.userLocation.lat
      : 16.0489;
  let targetLng: number =
    typeof params.userLocation?.lng === 'number' && isValidCoordinates(targetLat, params.userLocation.lng)
      ? params.userLocation.lng
      : 108.2441;
  let targetName: string = params.userLocation?.name || 'Vị trí của bạn';

  if (msg.includes('hội an')) {
    targetLat = 15.8801;
    targetLng = 108.3380;
    targetName = 'Phố cổ Hội An';
  } else if (msg.includes('đà nẵng') || msg.includes('an thượng') || msg.includes('ngũ hành sơn')) {
    targetLat = 16.0544;
    targetLng = 108.2022;
    targetName = 'Đà Nẵng';
  } else if (msg.includes('huế')) {
    targetLat = 16.4637;
    targetLng = 107.5909;
    targetName = 'Cố đô Huế';
  } else if (msg.includes('hà nội') || msg.includes('bát tràng')) {
    targetLat = 20.9782;
    targetLng = 105.9082;
    targetName = 'Bát Tràng, Hà Nội';
  } else if (msg.includes('hồ chí minh') || msg.includes('sài gòn') || msg.includes('tphcm')) {
    targetLat = 10.7769;
    targetLng = 106.7009;
    targetName = 'TP. Hồ Chí Minh';
  }

  // 2. Determine craft preference / keyword
  let pref = params.preference || 'all';
  let craftKeyword = '';

  if (msg.includes('gốm') || msg.includes('bát tràng') || msg.includes('thanh hà') || msg.includes('nặn')) {
    craftKeyword = 'gốm';
    pref = 'workshop';
  } else if (msg.includes('dệt') || msg.includes('lụa') || msg.includes('vải')) {
    craftKeyword = 'dệt';
  } else if (msg.includes('đá') || msg.includes('non nước') || msg.includes('điêu khắc')) {
    craftKeyword = 'đá';
  } else if (msg.includes('quà') || msg.includes('lưu niệm') || msg.includes('cửa hàng') || msg.includes('mua')) {
    pref = 'store';
  } else if (msg.includes('trong nhà') || msg.includes('mưa') || msg.includes('trú mưa')) {
    pref = 'indoor';
  } else if (msg.includes('ngoài trời') || msg.includes('làng nghề') || msg.includes('dạo')) {
    pref = 'outdoor';
  }

  const radiusKm = Math.min(50, Math.max(1, params.radius || 10));

  // 3. Fetch real weather and real places concurrently
  const [weather, { places }] = await Promise.all([
    getCurrentWeather(targetLat, targetLng),
    findNearbyPlaces(targetLat, targetLng, radiusKm),
  ]);

  // 4. Score and filter candidates
  let matchedPlaces = places;
  if (craftKeyword) {
    const filtered = places.filter(
      (p) =>
        p.name.toLowerCase().includes(craftKeyword) ||
        p.shortDescription.toLowerCase().includes(craftKeyword) ||
        p.typeLabel.toLowerCase().includes(craftKeyword)
    );
    if (filtered.length > 0) {
      matchedPlaces = filtered;
    }
  }

  const scored: RecommendedActivity[] = matchedPlaces.map((p) => {
    const { score, aiBadge, aiReasoning } = scorePlace(p, weather, { preference: pref });
    return {
      ...p,
      score,
      aiBadge,
      aiReasoning,
      rank: 0,
    };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.distanceKm - b.distanceKm;
  });

  const topRecommendations = scored.slice(0, 4).map((p, idx) => ({
    ...p,
    rank: idx + 1,
  }));

  // 5. Generate Response Text via OpenAI LLM or Knowledge Engine
  let replyText = '';
  let dynamicSuggestions: string[] = [];
  const isPlaceQuery = isPlaceRecommendationIntent(params.message);
  let attachRecommendations = isPlaceQuery;

  const apiKey = process.env.CHAT_API_KEY || '';
  let usedLlm = false;

  if (apiKey && !apiKey.startsWith('sk-placeholder')) {
    const baseUrl = (process.env.CHAT_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = process.env.CHAT_MODEL || 'gpt-4o-mini';

    const systemPrompt = `Bạn là Trợ lý AI CraftLocal - chuyên gia hàng đầu về di sản văn hóa, làng nghề thủ công truyền thống Việt Nam và hướng dẫn du lịch trải nghiệm.

NHIỆM VỤ CỦA BẠN:
1. TRẢ LỜI MỌI CÂU HỎI của người dùng một cách thông minh, chính xác, am hiểu và nhiệt tình bằng tiếng Việt.
2. CÁC LĨNH VỰC BẠN AM HIỂU SÂU SẮC:
   - Kiến thức văn hóa & lịch sử: Lịch sử hình thành và phát triển của các làng nghề thủ công Việt Nam (gốm Bát Tràng, Chu Đậu, Phù Lãng, Hương Canh, Thanh Hà; lụa Vạn Phúc, Nha Xá, Mã Châu; đúc đồng Đại Bái, Ý Yên; chạm bạc Đồng Xâm; nón lá Làng Chuông, nón bài thơ Huế; tranh Đông Hồ, Hàng Trống; mây tre đan Phú Vinh; đá Non Nước; làm hương Thủy Xuân; quạt Chàng Sơn...).
   - Kỹ thuật & quy trình chế tác: Các bước làm gốm vuốt tay, đổ khuôn, tráng men, nung lò; quy trình ươm tơ, dệt lụa, nhuộm chàm tự nhiên; kỹ thuật đục chạm điêu khắc; cách bảo quản đồ thủ công; cách phân biệt sản phẩm thủ công truyền thống thật với hàng công nghiệp.
   - Hướng dẫn nền tảng CraftLocal: Cách tìm kiếm workshop, cách đặt vé trải nghiệm (chọn xưởng, chọn ngày giờ, số lượng người), phương thức thanh toán bảo mật PayOS (quét mã VietQR hoặc thẻ), quản lý vé đã đặt, kết nối nghệ nhân địa phương.
   - Gợi ý du lịch & trải nghiệm: Lộ trình tham quan làng nghề, thời điểm đẹp nhất, trang phục phù hợp, kết hợp thưởng thức ẩm thực bản địa.
   - Thiết kế lịch trình 1 ngày: Khi người dùng hỏi về lịch trình 1 ngày hoặc tìm nơi đi chơi, phác thảo ngắn gọn lịch trình sáng, trưa, chiều, tối có xen kẽ cà phê nghỉ ngơi và nhắc người dùng có thể nhấp nút bên dưới để mở công cụ chỉnh sửa chi tiết.
   - Trò chuyện & giao tiếp tổng quát: Trả lời lịch sự, thông minh, tinh tế mọi câu hỏi khác của người dùng.

THÔNG TIN ĐỊA PHƯƠNG & DỮ LIỆU THỰC TẾ TRÊN CRAFTLOCAL:
- Vị trí hiện tại: ${targetName}
- Thời tiết hiện tại: ${weather.condition}, ${weather.temperature}°C, khả năng mưa ${weather.rainProbability}%.
- Các cơ sở/workshop có thật trong hệ thống gần khu vực này:
${topRecommendations.map((r, i) => `${i + 1}. ${r.name} (${r.typeLabel}, cách ${r.distanceLabel}, giá: ${r.priceLabel || 'Miễn phí'}, đánh giá ${r.rating}★)`).join('\n')}

QUY TẮC PHẢN HỒI:
- Nếu người dùng hỏi kiến thức văn hóa, lịch sử, kỹ thuật, cách sử dụng nền tảng: Hãy trả lời đầy đủ, chi tiết, cấu trúc rõ ràng với Markdown (tiêu đề, gạch đầu dòng, in đậm). Chỉ gợi ý nhẹ nhàng workshop thực tế nếu có liên quan trực tiếp đến nghề đó.
- Nếu người dùng tìm kiếm địa điểm, hỏi thời tiết hoặc xin gợi ý nơi đi chơi: Hãy phân tích thời tiết và gợi ý các địa điểm có thật trong danh sách trên. KHÔNG tự bịa tên địa điểm hoặc thông tin sai lệch ngoài thực tế.
- Ở dòng cuối cùng của phản hồi, hãy đưa ra 3-4 câu hỏi gợi ý tiếp theo phù hợp với ngữ cảnh trò chuyện theo định dạng:
<suggestions>["Câu hỏi gợi ý 1", "Câu hỏi gợi ý 2", "Câu hỏi gợi ý 3"]</suggestions>`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const llmMessages: any[] = [{ role: 'system', content: systemPrompt }];
      if (Array.isArray(params.history)) {
        params.history.slice(-4).forEach((h) => {
          if (h.role && h.content) {
            llmMessages.push({ role: h.role, content: h.content });
          }
        });
      }
      llmMessages.push({ role: 'user', content: params.message });

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: llmMessages,
          temperature: 0.6,
          max_tokens: 600,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = (await res.json()) as any;
        let text = json?.choices?.[0]?.message?.content;
        if (text) {
          text = text.trim();
          // Extract suggestions tag if present
          const match = text.match(/<suggestions>([\s\S]*?)<\/suggestions>/);
          if (match) {
            try {
              const parsed = JSON.parse(match[1]);
              if (Array.isArray(parsed) && parsed.length > 0) {
                dynamicSuggestions = parsed.map((s: any) => String(s).trim()).filter(Boolean);
              }
            } catch {
              // Ignore json parse error
            }
            text = text.replace(/<suggestions>[\s\S]*?<\/suggestions>/g, '').trim();
          }
          replyText = text;
          usedLlm = true;
        }
      }
    } catch {
      // Fallback to deterministic knowledge base below
    }
  }

  if (!usedLlm) {
    const fallback = generateFallbackResponse(
      params.message,
      targetName,
      weather,
      topRecommendations,
      radiusKm
    );
    replyText = fallback.replyText;
    dynamicSuggestions = fallback.suggestedPrompts;
    attachRecommendations = fallback.attachRecommendations;
  }

  // 6. Contextual Suggested Prompts
  const suggestedPrompts: string[] =
    dynamicSuggestions.length > 0
      ? dynamicSuggestions
      : weather.isRainy
      ? ['Hoạt động trong nhà tránh mưa', 'Workshop làm gốm gần đây', 'Cửa hàng quà lưu niệm', 'Xem trên bản đồ']
      : ['Tìm hoạt động quanh tôi', 'Trải nghiệm làm gốm', 'Làng nghề dệt thủ công', 'Thời tiết & Đề xuất hôm nay'];

  return {
    reply: replyText,
    recommendations: attachRecommendations ? topRecommendations : [],
    weather,
    location: {
      lat: targetLat,
      lng: targetLng,
      name: targetName,
    },
    suggestedPrompts,
  };
}
