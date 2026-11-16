/**
 * Itinerary Service
 * Generates and customizes 1-day Vietnamese craft & cultural itineraries.
 * Powered by OpenAI gpt-4o-mini with real local database places and real-time weather.
 */

import { findNearbyPlaces, NearbyPlace } from './nearbyPlace.service';
import { getCurrentWeather, WeatherData } from './weather.service';

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

export interface GenerateItineraryParams {
  prompt?: string;
  destination?: string; // e.g. "Hội An", "Đà Nẵng", "Hà Nội - Bát Tràng", "Huế"
  theme?: 'CRAFT_WORKSHOP' | 'RELAX_EXPLORE' | 'CULTURE_FOOD' | 'ALL';
  pace?: 'RELAXED' | 'STANDARD' | 'INTENSIVE';
  userLocation?: {
    lat: number;
    lng: number;
    name?: string;
  };
  customRequirements?: string;
}

const DESTINATION_COORDINATES: Record<string, { lat: number; lng: number; name: string }> = {
  'hoi an': { lat: 15.8801, lng: 108.338, name: 'Phố cổ Hội An' },
  'da nang': { lat: 16.0544, lng: 108.2022, name: 'Đà Nẵng' },
  'hue': { lat: 16.4637, lng: 107.5909, name: 'Cố đô Huế' },
  'ha noi': { lat: 20.9782, lng: 105.9082, name: 'Bát Tràng, Hà Nội' },
  'bat trang': { lat: 20.9782, lng: 105.9082, name: 'Bát Tràng, Hà Nội' },
  'ho chi minh': { lat: 10.7769, lng: 106.7009, name: 'TP. Hồ Chí Minh' },
};

function normalizeDestinationKey(dest: string): string {
  const d = dest.toLowerCase();
  if (d.includes('hội an') || d.includes('hoi an')) return 'hoi an';
  if (d.includes('đà nẵng') || d.includes('da nang')) return 'da nang';
  if (d.includes('huế') || d.includes('hue')) return 'hue';
  if (d.includes('bát tràng') || d.includes('hà nội') || d.includes('ha noi')) return 'bat trang';
  if (d.includes('hồ chí minh') || d.includes('sài gòn') || d.includes('tphcm')) return 'ho chi minh';
  return 'hoi an';
}

/**
 * Curated regional cafe & rest spots for craft and heritage discovery.
 */
const REGIONAL_CAFES: Record<string, CafeSuggestion[]> = {
  'hoi an': [
    {
      id: 'cafe-ha-1',
      name: 'Nước Mót & Trà Thảo Mộc Phố Cổ',
      tagline: 'Trà sen lá sen thanh mát nức tiếng phố cổ',
      vibe: 'Không gian mở, mộc mạc hoài cổ, trang trí hoa sen và quế hồi',
      recommendedTime: '10:30 - 11:15',
      address: '150 Trần Phú, Minh An, Hội An',
      estimatedPrice: '18.000đ - 35.000đ',
      specialty: 'Trà thảo mộc sả chanh hạt sen, nước mát cổ truyền',
      reason: 'Giải nhiệt hoàn hảo sau buổi sáng đi bộ dạo ngắm các di tích phố cổ.',
    },
    {
      id: 'cafe-ha-2',
      name: 'Faifo Coffee & Rooftop Phố Cổ',
      tagline: 'Quán cà phê ngắm mái ngói âm dương rêu phong đẹp nhất Hội An',
      vibe: 'Nhà cổ 2 tầng gỗ trầm, ban công sân thượng view toàn cảnh phố cổ',
      recommendedTime: '14:00 - 15:15',
      address: '130 Trần Phú, Hội An',
      estimatedPrice: '45.000đ - 75.000đ',
      specialty: 'Cà phê cốt dừa, bạc xỉu phố Hội, trà trái cây nhiệt đới',
      reason: 'Khoảng dừng lý tưởng để tránh nắng gắt đầu giờ chiều và chụp ảnh check-in tuyệt đẹp.',
    },
    {
      id: 'cafe-ha-3',
      name: 'Reaching Out Teahouse (Trà Quán Không Lời)',
      tagline: 'Không gian tĩnh lặng do các bạn khiếm thính phục vụ',
      vibe: 'Cực kỳ yên bình, nội thất gốm thủ công và gỗ xưa thanh tao',
      recommendedTime: '16:00 - 17:00',
      address: '131 Trần Phú, Hội An',
      estimatedPrice: '50.000đ - 90.000đ',
      specialty: 'Set trà sen cung đình kèm bánh đậu xanh truyền thống',
      reason: 'Lắng đọng tâm hồn và thưởng thức đồ gốm thủ công mộc mạc bên tách trà thơm.',
    },
  ],
  'da nang': [
    {
      id: 'cafe-dn-1',
      name: 'The Hill Tea & Coffee Non Nước',
      tagline: 'Cà phê view chân núi Ngũ Hành Sơn thoáng mát',
      vibe: 'Sân vườn nhiều cây xanh, tiểu cảnh đá cẩm thạch thư thái',
      recommendedTime: '10:30 - 11:30',
      address: 'Đường Huyền Trân Công Chúa, Hòa Hải, Ngũ Hành Sơn',
      estimatedPrice: '30.000đ - 55.000đ',
      specialty: 'Cà phê muối xứ Quảng, sinh tố bơ mãng cầu',
      reason: 'Nghỉ ngơi tiếp thêm năng lượng sau khi trải nghiệm xưởng điêu khắc đá mỹ nghệ.',
    },
    {
      id: 'cafe-dn-2',
      name: 'Nối Cafe - Không Gian Hoài Niệm Bao Cấp',
      tagline: 'Cà phê phong cách cổ điển giữa lòng Đà Nẵng',
      vibe: 'Đồ đạc xưa cũ, bàn ghế gỗ mộc, băng cát-sét cổ và âm nhạc Trịnh Công Sơn',
      recommendedTime: '14:30 - 15:30',
      address: 'Hẻm 113/18 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng',
      estimatedPrice: '25.000đ - 45.000đ',
      specialty: 'Cà phê trứng béo ngậy, trà đào cam sả',
      reason: 'Trốn nóng buổi trưa trong không gian máy lạnh dịu dàng đầy chất hoài niệm.',
    },
  ],
  'bat trang': [
    {
      id: 'cafe-bt-1',
      name: 'Cafe Gốm Sứ Sân Vườn Bát Tràng',
      tagline: 'Thưởng cà phê trong những chiếc ly cốc gốm vuốt tay độc bản',
      vibe: 'Không gian xưởng gốm cổ kết hợp vườn bonsai mộc mạc',
      recommendedTime: '10:15 - 11:15',
      address: 'Xóm 2 Làng cổ Bát Tràng, Gia Lâm, Hà Nội',
      estimatedPrice: '35.000đ - 60.000đ',
      specialty: 'Cà phê pha phin truyền thống, trà hoa cúc mật ong',
      reason: 'Trải nghiệm cầm trên tay ly gốm nung củi độc đáo vừa ngắm nghệ nhân nhào đất.',
    },
    {
      id: 'cafe-bt-2',
      name: 'Tầng 4 Rooftop Bảo Tàng Gốm Bát Tràng',
      tagline: 'View 360 độ ngắm kiến trúc 7 bàn xoay khổng lồ độc nhất vô nhị',
      vibe: 'Hiện đại, lộng gió sông Hồng, kiến trúc uốn lượn bằng đất nung',
      recommendedTime: '15:00 - 16:00',
      address: 'Số 28 thôn 5, Bát Tràng, Gia Lâm, Hà Nội',
      estimatedPrice: '40.000đ - 70.000đ',
      specialty: 'Trà sen Hồ Tây, cà phê kem trứng Bát Tràng',
      reason: 'Thư giãn tuyệt đỉnh sau tour tham quan các tầng bảo tàng gốm.',
    },
  ],
  'hue': [
    {
      id: 'cafe-hue-1',
      name: 'Cà Phê Muối Xứ Huế (Quán Gốc Đặng Thái Thân)',
      tagline: 'Nơi khởi nguồn hương vị cà phê muối nức tiếng Cố Đô',
      vibe: 'Sân vườn rợp bóng cây cổ thụ dưới chân thành nội Huế',
      recommendedTime: '08:30 - 09:30',
      address: '10 Đặng Thái Thân, Thuận Thành, Huế',
      estimatedPrice: '20.000đ - 35.000đ',
      specialty: 'Cà phê muối truyền thống, sữa chua nếp cẩm',
      reason: 'Khởi đầu ngày mới tỉnh táo với hương vị cà phê muối đậm đà tinh tế của Huế.',
    },
    {
      id: 'cafe-hue-2',
      name: 'Trà Quán Thảo Mộc Làng Hương Thủy Xuân',
      tagline: 'Trạm dừng chân rực rỡ sắc màu hoa hương trầm',
      vibe: 'Không gian mở ngập tràn chân hương đa sắc, hương trầm thơm dịu nhẹ',
      recommendedTime: '15:30 - 16:30',
      address: 'Đường Huyền Trân Công Chúa, Thủy Xuân, Huế',
      estimatedPrice: '25.000đ - 45.000đ',
      specialty: 'Trà cung đình Huế thanh lọc cơ thể, kẹo mè xửng',
      reason: 'Nghỉ chân thưởng trà và chụp ảnh check-in với không gian làng hương nổi tiếng.',
    },
  ],
  'ho chi minh': [
    {
      id: 'cafe-hcm-1',
      name: 'Cheo Leo Cafe - Quán Cà Phê Vợt Lâu Đời Nhất Sài Gòn',
      tagline: 'Hơn 85 năm giữ trọn ngọn lửa lò than cà phê vợt',
      vibe: 'Mộc mạc, bình dị, đậm đà văn hóa cà phê Sài Gòn xưa',
      recommendedTime: '08:30 - 09:30',
      address: '109/36 Nguyễn Thiện Thuật, Phường 2, Quận 3, TP.HCM',
      estimatedPrice: '20.000đ - 35.000đ',
      specialty: 'Cà phê sữa đá vợt, bạc xỉu nóng béo thơm',
      reason: 'Bắt đầu ngày mới với ly cà phê vợt chuẩn phong cách người Sài Gòn xưa.',
    },
  ],
};

/**
 * Curated offline fallback itineraries for the top cultural destinations.
 */
function getOfflineItinerary(destKey: string, theme: string): OneDayItinerary {
  const now = new Date().toISOString();

  if (destKey === 'bat trang') {
    return {
      id: `itin-bat-trang-${Date.now()}`,
      title: 'Hành Trình 1 Ngày: Thổi Hồn Vào Đất Tại Làng Gốm Cổ Bát Tràng',
      destination: 'Bát Tràng, Hà Nội',
      theme,
      themeLabel: 'Trải nghiệm chế tác gốm sứ & Khám phá di sản',
      summary:
        'Một ngày thong thả tìm về cái nôi gốm sứ ngàn năm tuổi ven sông Hồng, tự tay vuốt nặn tác phẩm gốm đầu tay và chiêm ngưỡng kiến trúc Bảo tàng Gốm độc đáo.',
      totalEstimatedCost: '280.000đ - 450.000đ / người',
      weatherNote: 'Thời tiết mát mẻ thích hợp cho cả hoạt động trong xưởng và dạo làng cổ.',
      stops: [
        {
          id: 'bt-1',
          time: '08:30 - 09:30',
          period: 'MORNING',
          title: 'Cà phê sáng & Thưởng thức bánh tẻ Làng cổ',
          type: 'CAFE_REST',
          typeLabel: 'Cà phê & Điểm tâm',
          location: 'Xóm 2, Làng cổ Bát Tràng',
          costEstimate: '35.000đ',
          notes: 'Thưởng thức ly cà phê pha phin trong ly gốm vuốt tay mộc mạc và nếm thử bánh tẻ làng nghề còn nóng hổi.',
          durationMinutes: 60,
        },
        {
          id: 'bt-2',
          time: '09:45 - 11:45',
          period: 'MORNING',
          title: 'Workshop Nghệ Nhân: Tự tay vuốt nặn & vẽ gốm Bát Tràng',
          type: 'WORKSHOP',
          typeLabel: 'Workshop thủ công',
          location: 'Xưởng Gốm Vuốt Tay Truyền Thống Bát Tràng',
          costEstimate: '120.000đ (đã gồm nung)',
          notes: 'Nghệ nhân trực tiếp hướng dẫn kỹ thuật đạp bàn xoay, định hình đất sét và dùng cọ màu tự nhiên trang trí họa tiết.',
          durationMinutes: 120,
        },
        {
          id: 'bt-3',
          time: '12:00 - 13:15',
          period: 'NOON',
          title: 'Bữa trưa đặc sản: Canh măng mực & Xôi vò chè đường',
          type: 'FOOD',
          typeLabel: 'Ẩm thực truyền thống',
          location: 'Nhà hàng Ẩm thực Cổ Bát Tràng',
          costEstimate: '110.000đ',
          notes: 'Món canh măng mực truyền thống chỉ có trong cỗ cưới và ngày lễ tết của người dân Bát Tràng xưa.',
          durationMinutes: 75,
        },
        {
          id: 'bt-4',
          time: '13:30 - 14:30',
          period: 'AFTERNOON',
          title: 'Nghỉ trưa & Thưởng trà Rooftop Bảo tàng Gốm',
          type: 'CAFE_REST',
          typeLabel: 'Cà phê nghỉ ngơi',
          location: 'Tầng 4 Rooftop, Trung tâm Tinh hoa Làng nghề Việt',
          costEstimate: '45.000đ',
          notes: 'Trốn nắng giữa trưa trong không gian lộng gió sông Hồng, ngắm toàn cảnh 7 bàn xoay khổng lồ bằng đất nung.',
          durationMinutes: 60,
          isAiSuggested: true,
        },
        {
          id: 'bt-5',
          time: '14:45 - 16:30',
          period: 'AFTERNOON',
          title: 'Tham quan Bảo tàng Gốm & Khám phá Chợ Gốm Làng Nghề',
          type: 'SIGHTSEEING',
          typeLabel: 'Tham quan & Mua sắm',
          location: 'Bảo tàng Gốm Bát Tràng & Chợ Gốm Bát Tràng',
          costEstimate: '50.000đ vé vào cổng',
          notes: 'Tìm hiểu lịch sử các dòng men quý (men rạn, men ngọc, vẽ lam) và mua quà lưu niệm thủ công với giá xưởng.',
          durationMinutes: 105,
        },
        {
          id: 'bt-6',
          time: '17:00 - 18:00',
          period: 'EVENING',
          title: 'Dạo ven đê sông Hồng & Nhận thành phẩm gốm',
          type: 'SIGHTSEEING',
          typeLabel: 'Kết thúc hành trình',
          location: 'Bến đò Bát Tràng ven sông Hồng',
          costEstimate: 'Miễn phí',
          notes: 'Nhận thành phẩm gốm đã sấy nung hoàn tất, ngắm hoàng hôn buông xuống dòng sông Hồng êm ả.',
          durationMinutes: 60,
        },
      ],
      generatedAt: now,
      engine: 'smart_itinerary_engine',
    };
  }

  if (destKey === 'da nang') {
    return {
      id: `itin-da-nang-${Date.now()}`,
      title: 'Hành Trình 1 Ngày: Hồn Đá Ngũ Hành & Không Gian Thủ Công Đà Nẵng',
      destination: 'Đà Nẵng',
      theme,
      themeLabel: 'Điêu khắc đá cẩm thạch & Văn hóa duyên hải',
      summary:
        'Hành trình kết hợp tuyệt vời giữa nghệ thuật điêu khắc đá mỹ nghệ Non Nước hơn 400 năm tuổi và các quán cà phê vườn yên bình đón gió biển Đà Nẵng.',
      totalEstimatedCost: '250.000đ - 420.000đ / người',
      weatherNote: 'Buổi sáng thích hợp ghé xưởng điêu khắc, buổi trưa nghỉ ngơi quán vườn thoáng mát.',
      stops: [
        {
          id: 'dn-1',
          time: '08:00 - 09:00',
          period: 'MORNING',
          title: 'Cà phê sáng ngắm bình minh biển Mỹ Khê',
          type: 'CAFE_REST',
          typeLabel: 'Cà phê & Khởi đầu',
          location: 'Khu phố biển An Thượng, Mỹ An, Đà Nẵng',
          costEstimate: '35.000đ',
          notes: 'Hít thở không khí biển trong lành và thưởng thức ly cà phê phin đậm đà trước khi bắt đầu hành trình.',
          durationMinutes: 60,
        },
        {
          id: 'dn-2',
          time: '09:30 - 11:30',
          period: 'MORNING',
          title: 'Workshop Nghệ Nhân: Chế tác vòng đá mỹ nghệ Non Nước',
          type: 'WORKSHOP',
          typeLabel: 'Workshop thủ công',
          location: 'Xưởng Điêu Khắc Đá Non Nước (Ngũ Hành Sơn)',
          costEstimate: '150.000đ',
          notes: 'Nghệ nhân giới thiệu các loại đá tự nhiên, hướng dẫn kỹ thuật mài nhẵn, đánh bóng và xâu chuỗi vòng hộ mệnh.',
          durationMinutes: 120,
        },
        {
          id: 'dn-3',
          time: '12:00 - 13:15',
          period: 'NOON',
          title: 'Thưởng thức Bánh tráng cuốn thịt heo Đại Lộc',
          type: 'FOOD',
          typeLabel: 'Ẩm thực địa phương',
          location: 'Quán Ẩm thực Xứ Quảng, đường Lê Văn Hiến',
          costEstimate: '85.000đ',
          notes: 'Món ăn trứ danh với rau rừng xanh mát, mắm nêm đậm vị đặc trưng miền Trung.',
          durationMinutes: 75,
        },
        {
          id: 'dn-4',
          time: '13:45 - 15:00',
          period: 'AFTERNOON',
          title: 'Nghỉ trưa & Thưởng thức Cà phê muối tại Quán Vườn',
          type: 'CAFE_REST',
          typeLabel: 'Cà phê nghỉ ngơi',
          location: 'The Hill Coffee chân núi Ngũ Hành Sơn',
          costEstimate: '40.000đ',
          notes: 'Không gian bóng cây râm mát, thưởng thức cà phê muối thơm béo và đọc sách thư giãn.',
          durationMinutes: 75,
          isAiSuggested: true,
        },
        {
          id: 'dn-5',
          time: '15:15 - 17:00',
          period: 'AFTERNOON',
          title: 'Dạo Động Huyền Không & Thăm các gian hàng đá phong thủy',
          type: 'SIGHTSEEING',
          typeLabel: 'Di tích & Thắng cảnh',
          location: 'Ngọn Thủy Sơn, Danh thắng Ngũ Hành Sơn',
          costEstimate: '40.000đ vé thắng cảnh',
          notes: 'Ngắm những vạt nắng xuyên qua vòm hang động kỳ ảo và chọn mua mặt dây chuyền đá cẩm thạch kỷ niệm.',
          durationMinutes: 105,
        },
        {
          id: 'dn-6',
          time: '17:30 - 18:30',
          period: 'EVENING',
          title: 'Dạo ngắm hoàng hôn Bán đảo Sơn Trà & Thưởng thức chè sầu',
          type: 'SIGHTSEEING',
          typeLabel: 'Kết thúc hành trình',
          location: 'Cung đường Hoàng Sa & Phố ẩm thực Sơn Trà',
          costEstimate: '35.000đ',
          notes: 'Ngắm thành phố biển lên đèn lộng lẫy và thưởng thức một bát chè sầu riêng béo ngọt ngào.',
          durationMinutes: 60,
        },
      ],
      generatedAt: now,
      engine: 'smart_itinerary_engine',
    };
  }

  // Default: Hội An (Phố cổ & Làng nghề sông Thu Bồn)
  return {
    id: `itin-hoi-an-${Date.now()}`,
    title: 'Hành Trình 1 Ngày: Dấu Ấn Làng Nghề & Hoài Niệm Phố Cổ Hội An',
    destination: 'Phố cổ Hội An',
    theme,
    themeLabel: 'Gốm đất nung, Dệt lụa tơ tằm & Thư giãn phố cổ',
    summary:
      'Trọn vẹn 1 ngày len lỏi qua những con hẻm vàng rực hoa giấy, tự tay vuốt gốm Thanh Hà, dệt lụa tơ tằm và thảnh thơi nhâm nhi tách cà phê rêu phong.',
    totalEstimatedCost: '260.000đ - 450.000đ / người',
    weatherNote: 'Thời tiết ấm áp nắng ráo, lý tưởng để kết hợp workshop trong xưởng và dạo thuyền sông Hoài.',
    stops: [
      {
        id: 'ha-1',
        time: '08:00 - 09:00',
        period: 'MORNING',
        title: 'Cà phê sáng & Điểm tâm Bánh mì Phượng / Madam Khánh',
        type: 'CAFE_REST',
        typeLabel: 'Cà phê & Điểm tâm',
        location: 'Quán cà phê cổ ven sông Hoài, Hội An',
        costEstimate: '45.000đ',
        notes: 'Khởi đầu ngày mới với ổ bánh mì giòn rụm và ly cà phê sữa đá đậm đà ngắm thuyền ghe tấp nập buổi sớm.',
        durationMinutes: 60,
      },
      {
        id: 'ha-2',
        time: '09:15 - 11:30',
        period: 'MORNING',
        title: 'Workshop Nghệ Nhân: Vuốt gốm đất nung Làng Gốm Thanh Hà',
        type: 'WORKSHOP',
        typeLabel: 'Workshop thủ công',
        location: 'Làng Gốm Thanh Hà (cách phố cổ 2.5km)',
        costEstimate: '60.000đ (đã gồm vé tham quan & trải nghiệm)',
        notes: 'Tự tay ngồi bên bàn xoay đạp chân truyền thống hơn 500 năm tuổi, nặn chiếc bình gốm nhỏ xinh mang về.',
        durationMinutes: 135,
      },
      {
        id: 'ha-3',
        time: '12:00 - 13:15',
        period: 'NOON',
        title: 'Bữa trưa đậm vị: Cao lầu truyền thống & Bánh bao bánh vạc',
        type: 'FOOD',
        typeLabel: 'Ẩm thực phố Hội',
        location: 'Quán Cao lầu Thanh / Trung Bắc, phố cổ Hội An',
        costEstimate: '75.000đ',
        notes: 'Sợi cao lầu màu tro làm từ củi Cù Lao Chàm, ăn kèm thịt xíu thơm lừng và tóp mỡ giòn rụm.',
        durationMinutes: 75,
      },
      {
        id: 'ha-4',
        time: '13:45 - 15:00',
        period: 'AFTERNOON',
        title: 'Nghỉ trưa & Thưởng thức Trà Thảo Mộc Nước Mót / Faifo',
        type: 'CAFE_REST',
        typeLabel: 'Cà phê nghỉ ngơi',
        location: '150 Trần Phú / Faifo Rooftop Coffee',
        costEstimate: '35.000đ',
        notes: 'Tránh nắng trưa oi ả trong không gian mát mẻ, nhấp ngụm trà sen chanh sả thanh lọc cơ thể và ngắm phố xá.',
        durationMinutes: 75,
        isAiSuggested: true,
      },
      {
        id: 'ha-5',
        time: '15:15 - 17:00',
        period: 'AFTERNOON',
        title: 'Trải nghiệm Dệt Lụa & Tự tay dệt vải lụa tơ tằm Mã Châu',
        type: 'WORKSHOP',
        typeLabel: 'Trải nghiệm văn hóa',
        location: 'Làng Lụa Mã Châu / Không gian lụa Hội An',
        costEstimate: '80.000đ',
        notes: 'Chiêm ngưỡng nong tằm nhả tơ vàng óng, thử ngồi bên khung cửi dệt sợi tơ óng ả và tìm hiểu kỹ thuật nhuộm màu thảo mộc.',
        durationMinutes: 105,
      },
      {
        id: 'ha-6',
        time: '17:30 - 19:30',
        period: 'EVENING',
        title: 'Dạo phố lồng đèn, Đi thuyền sông Hoài & Thả hoa đăng cầu may',
        type: 'SIGHTSEEING',
        typeLabel: 'Hoàng hôn & Phố đêm',
        location: 'Chùa Cầu & Bến thuyền sông Hoài',
        costEstimate: '50.000đ (thuyền & đèn hoa đăng)',
        notes: 'Khi phố cổ lên đèn lung linh huyền ảo, ngồi thuyền gỗ trôi nhẹ trên sông và thả ngọn hoa đăng lấp lánh nguyện ước an lành.',
        durationMinutes: 120,
      },
    ],
    generatedAt: now,
    engine: 'smart_itinerary_engine',
  };
}

/**
 * Generates a full 1-day itinerary using OpenAI GPT-4o-mini with real places and weather.
 * Gracefully falls back to curated offline itineraries if the API is offline.
 */
export async function generateOneDayItinerary(
  params: GenerateItineraryParams
): Promise<OneDayItinerary> {
  const destination = (params.destination || 'Hội An').trim();
  const theme = params.theme || 'ALL';
  const pace = params.pace || 'STANDARD';
  const destKey = normalizeDestinationKey(destination);
  const coords = DESTINATION_COORDINATES[destKey] || { lat: 15.8801, lng: 108.338, name: destination };

  // Fetch real weather and real candidate places concurrently
  const [weather, { places }] = await Promise.all([
    getCurrentWeather(coords.lat, coords.lng).catch(() => null),
    findNearbyPlaces(coords.lat, coords.lng, 15).catch(() => ({ places: [] })),
  ]);

  const apiKey = process.env.CHAT_API_KEY || '';
  if (apiKey && !apiKey.startsWith('sk-placeholder')) {
    const baseUrl = (process.env.CHAT_API_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const model = process.env.CHAT_MODEL || 'gpt-4o-mini';

    const systemPrompt = `Bạn là Chuyên gia thiết kế lịch trình du lịch văn hóa & làng nghề thủ công Việt Nam của nền tảng CraftLocal.
Nhiệm vụ: Tạo một lịch trình du lịch trải nghiệm trọn vẹn 1 NGÀY (One-Day Itinerary) hoàn hảo, thông minh và khả thi cho người dùng.

BỐI CẢNH THỰC TẾ:
- Điểm đến: ${coords.name} (Tọa độ: ${coords.lat}, ${coords.lng})
- Phong cách: ${theme === 'CRAFT_WORKSHOP' ? 'Tập trung trải nghiệm làm nghề thủ công' : theme === 'RELAX_EXPLORE' ? 'Thư thả, ngắm cảnh & check-in' : 'Hòa quyện thủ công, ẩm thực & văn hóa'}
- Nhịp độ: ${pace === 'RELAXED' ? 'Thong thả, ít di chuyển' : pace === 'INTENSIVE' ? 'Năng động, nhiều hoạt động' : 'Cân bằng, tiêu chuẩn'}
${weather ? `- Thời tiết hôm nay: ${weather.condition}, ${weather.temperature}°C, khả năng mưa ${weather.rainProbability}%` : ''}
${params.prompt ? `- NỘI DUNG YÊU CẦU TỪ NGƯỜI DÙNG: "${params.prompt}"\nHãy đọc kỹ nội dung người dùng viết ở trên để xây dựng lịch trình và các điểm dừng phù hợp chính xác theo mong muốn đó!` : ''}
${params.customRequirements ? `- Yêu cầu bổ sung: ${params.customRequirements}` : ''}

CÁC ĐỊA ĐIỂM/WORKSHOP CÓ THẬT TRONG HỆ THỐNG GẦN ĐÓ:
${places.slice(0, 5).map((p, i) => `${i + 1}. ${p.name} (${p.typeLabel}, ${p.priceLabel || 'Miễn phí'}, đánh giá ${p.rating}★)`).join('\n')}

QUY TẮC BẮT BUỘC KHI LẬP LỊCH TRÌNH:
1. Sắp xếp từ 5 đến 6 điểm dừng theo trình tự thời gian hợp lý (Sáng 08:00 -> Tối 19:30).
2. Phải có XEN KẼ các chặng nghỉ ngơi, cà phê sáng hoặc cà phê chiều thư thái để người dùng không bị mệt mỏi.
3. Ưu tiên các xưởng thủ công hoặc trải nghiệm văn hóa truyền thống đặc sắc của vùng đất đó.
4. Trả về ĐÚNG ĐỊNH DẠNG JSON duy nhất, không kèm văn bản markdown ngoài JSON, theo cấu trúc:
{
  "title": "Tên lịch trình truyền cảm hứng",
  "summary": "Tóm tắt ngắn gọn 1-2 câu về trải nghiệm trong ngày",
  "themeLabel": "Nhãn chủ đề (ví dụ: Làm gốm & Thưởng trà phố Hội)",
  "totalEstimatedCost": "Ước tính chi phí (ví dụ: 300.000đ - 450.000đ / người)",
  "weatherNote": "Lời khuyên thời tiết ngắn gọn",
  "stops": [
    {
      "id": "stop-1",
      "time": "08:30 - 09:30",
      "period": "MORNING", // MORNING | NOON | AFTERNOON | EVENING
      "title": "Tên hoạt động",
      "type": "CAFE_REST", // WORKSHOP | CAFE_REST | FOOD | SIGHTSEEING
      "typeLabel": "Cà phê & Điểm tâm",
      "location": "Tên địa điểm cụ thể",
      "costEstimate": "35.000đ",
      "notes": "Mẹo trải nghiệm hoặc lưu ý",
      "durationMinutes": 60,
      "isAiSuggested": true
    }
  ]
}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 18000);

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
            { role: 'user', content: params.prompt
              ? `Hãy tạo lịch trình 1 ngày theo đúng nội dung sau của tôi: "${params.prompt}"`
              : `Hãy tạo lịch trình 1 ngày chi tiết tại ${coords.name} cho tôi.` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const json = (await res.json()) as any;
        const content = json?.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.stops) && parsed.stops.length >= 3) {
            return {
              id: `itin-${Date.now()}`,
              title: parsed.title || `Lịch trình 1 ngày trải nghiệm tại ${coords.name}`,
              destination: parsed.destination || coords.name,
              theme,
              themeLabel: parsed.themeLabel || 'Văn hóa & Trải nghiệm thủ công',
              summary: parsed.summary || 'Lịch trình được cá nhân hóa bởi AI dựa trên thời tiết và các làng nghề địa phương.',
              totalEstimatedCost: parsed.totalEstimatedCost || 'Khoảng 300.000đ - 450.000đ',
              weatherNote: parsed.weatherNote || (weather ? `${weather.condition}, ${weather.temperature}°C` : undefined),
              stops: parsed.stops.map((s: any, idx: number) => ({
                id: s.id || `stop-${idx + 1}-${Date.now()}`,
                time: s.time || '09:00 - 10:00',
                period: s.period || (idx < 2 ? 'MORNING' : idx === 2 ? 'NOON' : idx < 5 ? 'AFTERNOON' : 'EVENING'),
                title: s.title || 'Điểm trải nghiệm văn hóa',
                type: s.type || 'SIGHTSEEING',
                typeLabel: s.typeLabel || 'Hoạt động trải nghiệm',
                location: s.location || coords.name,
                costEstimate: s.costEstimate || 'Miễn phí',
                notes: s.notes || '',
                durationMinutes: s.durationMinutes || 60,
                isAiSuggested: s.isAiSuggested ?? true,
              })),
              generatedAt: new Date().toISOString(),
              engine: 'openai+smart_itinerary',
            };
          }
        }
      }
    } catch (err) {
      console.warn('[generateOneDayItinerary] OpenAI error, falling back to offline engine:', err);
    }
  }

  // Fallback to offline curated itinerary
  return getOfflineItinerary(destKey, theme);
}

/**
 * Suggests authentic coffee and rest stops to interleave into an existing itinerary.
 */
export async function suggestCafeStops(params: {
  destination?: string;
  currentStopsCount?: number;
}): Promise<CafeSuggestion[]> {
  const destKey = normalizeDestinationKey(params.destination || 'hoi an');
  const regionalList = REGIONAL_CAFES[destKey] || REGIONAL_CAFES['hoi an'];
  return regionalList;
}
