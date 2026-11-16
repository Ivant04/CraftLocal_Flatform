import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  X,
  Star,
  Navigation,
  Loader2,
  MapPin,
  ChevronDown,
  AlertCircle,
  Check,
  LocateFixed,
} from 'lucide-react';
import type {
  AiChatMessage,
  NearbyPlace,
} from '../../types/recommendation.type';
import { recommendationService } from '../../services/recommendationService';
import { locationService } from '../../services/locationService';
import ImageWithFallback from '../common/ImageWithFallback';
import { useNearbyModal } from '../../context/NearbyModalContext';

interface AiChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_LOCATIONS = [
  { name: 'Đà Nẵng', lat: 16.0544, lng: 108.2022, desc: 'Trung tâm TP. Đà Nẵng' },
  { name: 'Phố cổ Hội An', lat: 15.8801, lng: 108.3380, desc: 'Làng gốm, đèn lồng, lụa' },
  { name: 'Bát Tràng, Hà Nội', lat: 20.9782, lng: 105.9082, desc: 'Làng gốm Bát Tràng cổ truyền' },
  { name: 'TP. Hồ Chí Minh', lat: 10.7769, lng: 106.7009, desc: 'Quận 1, xưởng sáng tạo' },
  { name: 'Cố đô Huế', lat: 16.4637, lng: 107.5909, desc: 'Nón lá, đúc đồng, kim hoàn' },
];

const INITIAL_SUGGESTED_PROMPTS = [
  'Thời tiết Hội An hôm nay & gợi ý chuyến đi',
  'Thời tiết hôm nay nên đi đâu?',
  'Lập lịch trình 1 ngày ở Hội An',
  'Workshop làm gốm gần tôi',
  'Cách đặt vé workshop & thanh toán',
];

/**
 * Safely formats AI Markdown text with bold and bullet points without raw HTML injection risks.
 */
function formatAiText(text: string) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5 leading-relaxed text-xs md:text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Bullet points
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^[-•*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#964824] shrink-0 mt-1.5" />
              <span dangerouslySetInnerHTML={{ __html: renderInlineFormatting(content) }} />
            </div>
          );
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{ __html: renderInlineFormatting(line) }}
          />
        );
      })}
    </div>
  );
}

function renderInlineFormatting(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#3D2B1F]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-[#7A6255]">$1</em>');
}

export const AiChatBox: React.FC<AiChatBoxProps> = ({ isOpen, onClose }) => {
  const { openItineraryModal } = useNearbyModal();

  // Chat conversation state
  const [messages, setMessages] = useState<AiChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Xin chào! Mình là **Trợ lý AI CraftLocal** ✨\n\nMình có thể giải đáp mọi thắc mắc của bạn về **di sản & làng nghề truyền thống Việt Nam** (gốm sứ, dệt lụa, làm nón lá, điêu khắc đá...), hướng dẫn **quy trình chế tác thủ công**, hỗ trợ **đặt vé & thanh toán workshop qua VietQR**, cũng như **gợi ý điểm đến văn hóa** lý tưởng theo thời tiết hôm nay.\n\nBạn muốn tìm hiểu hay hỏi thông tin gì nào?`,
      suggestedPrompts: INITIAL_SUGGESTED_PROMPTS,
      createdAt: new Date().toISOString(),
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // User location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; name: string } | null>(() => {
    return locationService.getSavedLocation();
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Get user's actual browser GPS location
  const handleGetBrowserLocation = async (isSilent: boolean = false) => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const geo = await locationService.getBrowserGeolocation(15000);
      const newLoc = {
        lat: geo.lat,
        lng: geo.lng,
        name: geo.name || `Tọa độ (${geo.lat.toFixed(4)}, ${geo.lng.toFixed(4)})`,
      };

      locationService.saveLocation(newLoc);
      setUserLocation(newLoc);
      setShowLocationPicker(false);

      if (!isSilent) {
        const confirmMsg: AiChatMessage = {
          id: `loc-success-${Date.now()}`,
          role: 'assistant',
          content: `📍 **Đã xác định vị trí thực tế của bạn**: **${newLoc.name}**\n\n- Độ chính xác: ${geo.accuracyLabel}\n- Tọa độ GPS: \`${newLoc.lat.toFixed(4)}, ${newLoc.lng.toFixed(4)}\`\n\nMình đã cập nhật vị trí này. Tất cả tính toán khoảng cách và gợi ý workshop sắp tới sẽ dựa trên vị trí thực tế của bạn!`,
          suggestedPrompts: [
            'Workshop thủ công gần tôi nhất',
            'Lịch trình 1 ngày quanh khu vực này',
            'Thời tiết hôm nay thế nào?',
          ],
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, confirmMsg]);
      }

      return newLoc;
    } catch (err: any) {
      console.warn('[AiChatBox] Geolocation failed:', err);
      const errMsg =
        err?.message ||
        'Không thể lấy vị trí hiện tại. Vui lòng cho phép quyền truy cập Vị trí trên trình duyệt hoặc chọn khu vực.';
      setLocationError(errMsg);

      if (!isSilent) {
        const failMsg: AiChatMessage = {
          id: `loc-err-${Date.now()}`,
          role: 'assistant',
          content: `⚠️ **Không thể tự động lấy vị trí GPS**: ${errMsg}\n\n*Cách xử lý*: Bạn hãy nhấn vào biểu tượng ổ khóa/cài đặt trên thanh địa chỉ URL của trình duyệt, bật **Cho phép Vị trí**, rồi thử lại. Hoặc bạn có thể chọn nhanh khu vực bên dưới!`,
          suggestedPrompts: [
            'Đà Nẵng',
            'Phố cổ Hội An',
            'Bát Tràng, Hà Nội',
            'TP. Hồ Chí Minh',
            'Cố đô Huế',
          ],
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, failMsg]);
      }

      return null;
    } finally {
      setIsLocating(false);
    }
  };

  // Switch location via preset
  const handleSelectPreset = (preset: { name: string; lat: number; lng: number; desc: string }) => {
    const loc = { lat: preset.lat, lng: preset.lng, name: preset.name };
    locationService.saveLocation(loc);
    setUserLocation(loc);
    setShowLocationPicker(false);
    setLocationError(null);

    const switchMsg: AiChatMessage = {
      id: `preset-${Date.now()}`,
      role: 'assistant',
      content: `📍 Đã chuyển khu vực tìm kiếm sang: **${preset.name}** (*${preset.desc}*).\n\nBạn muốn tìm hiểu workshop hay làng nghề truyền thống nào tại đây?`,
      suggestedPrompts: [
        `Workshop làm gốm ở ${preset.name}`,
        `Lịch trình 1 ngày ở ${preset.name}`,
        `Thời tiết hôm nay ở ${preset.name}`,
      ],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, switchMsg]);
  };

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Zero-click automatic location detection when chat opens or mounts
  useEffect(() => {
    if (!isOpen) return;

    const saved = locationService.getSavedLocation();
    if (saved) {
      setUserLocation(saved);
      return;
    }

    // Auto-detect silently without prompting clicks (Browser GPS or Network IP lookup)
    setIsLocating(true);
    locationService
      .getDirectLocation()
      .then((loc) => {
        if (loc) {
          const resolved = { lat: loc.lat, lng: loc.lng, name: loc.name };
          setUserLocation(resolved);
          locationService.saveLocation(resolved);
        }
      })
      .catch((err) => {
        console.warn('[AiChatBox] Background auto-location failed:', err);
      })
      .finally(() => {
        setIsLocating(false);
      });
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, scrollToBottom]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Send Chat message handler
  const handleSendMessage = async (textToSend?: string) => {
    let content = (textToSend || inputText).trim();
    if (!content || isThinking) return;

    setInputText('');

    // Ensure we always have active location resolved seamlessly
    let activeLocation = userLocation;
    if (!activeLocation) {
      try {
        const quickLoc = await Promise.race([
          locationService.getDirectLocation(),
          new Promise<{ lat: number; lng: number; name: string } | null>((resolve) =>
            setTimeout(() => resolve(null), 2000)
          ),
        ]);
        if (quickLoc) {
          activeLocation = { lat: quickLoc.lat, lng: quickLoc.lng, name: quickLoc.name };
          setUserLocation(activeLocation);
          locationService.saveLocation(activeLocation);
        }
      } catch (e) {
        console.warn('[AiChatBox] Quick direct location failed:', e);
      }
    }

    // Append user message
    const userMsg: AiChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Build history for backend LLM
      const history = messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await recommendationService.sendChat({
        message: content,
        history,
        userLocation: activeLocation
          ? {
              lat: activeLocation.lat,
              lng: activeLocation.lng,
              name: activeLocation.name,
            }
          : undefined,
      });

      // Append assistant response
      const assistantMsg: AiChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        recommendations: res.recommendations,
        weather: res.weather,
        location: res.location,
        suggestedPrompts: res.suggestedPrompts || [],
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('[AiChatBox] Send failed:', err);
      const errorReply: AiChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'Xin lỗi bạn, máy chủ AI đang bận xử lý hoặc gặp gián đoạn tạm thời. Bạn vui lòng thử lại sau giây lát hoặc nhấp chọn các câu hỏi gợi ý bên dưới nhé!',
        suggestedPrompts: INITIAL_SUGGESTED_PROMPTS,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsThinking(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Đoạn chat đã được làm mới! Mình là **Trợ lý AI CraftLocal** ✨\n\nBạn muốn tìm hiểu về làng nghề nào hoặc cần mình hỗ trợ điều gì hôm nay?`,
        suggestedPrompts: INITIAL_SUGGESTED_PROMPTS,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trợ lý AI CraftLocal"
      className="fixed inset-0 sm:inset-auto sm:bottom-5 sm:right-5 z-50 flex items-end sm:items-auto justify-center pointer-events-auto"
    >
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs sm:hidden z-0"
        onClick={onClose}
      />

      {/* Main Chat Box Container */}
      <div className="relative z-10 bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_20px_60px_rgba(61,43,31,0.25)] border border-[#EAD8CC] flex flex-col overflow-hidden transition-all duration-300 w-full sm:w-[440px] md:w-[460px] h-[85vh] sm:h-[620px]">
        {/* Minimalist Top Header Bar */}
        <div className="px-4 py-3 bg-[#3D2B1F] text-white flex items-center justify-between shrink-0 border-b border-[#5A3E2D]/40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <h2 className="font-semibold text-sm text-white tracking-wide truncate">
              Trợ lý AI
            </h2>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Open 1-Day Itinerary Planner */}
            <button
              type="button"
              onClick={() => {
                const lastUser = [...messages].reverse().find((m) => m.role === 'user');
                openItineraryModal(
                  lastUser?.content ||
                    (userLocation
                      ? `Lịch trình 1 ngày ở ${userLocation.name}`
                      : 'Đi Hội An 1 ngày: làm gốm, dệt lụa và cà phê nghỉ ngơi')
                );
              }}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Lập lịch trình 1 ngày bằng AI"
              aria-label="Lịch trình 1 ngày"
            >
              <Calendar size={15} />
            </button>

            {/* Reset Chat */}
            <button
              type="button"
              onClick={handleResetChat}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Làm mới đoạn chat"
              aria-label="Làm mới"
            >
              <RotateCcw size={15} />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Đóng (ESC)"
              aria-label="Đóng cửa sổ"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Location Status Bar */}
        <div className="bg-[#FAF5EF] px-3.5 py-2 border-b border-[#EAD8CC] flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[#964824] shrink-0">
              <MapPin size={13} />
            </span>
            <span className="text-[#7A6255] font-medium shrink-0">Vị trí:</span>
            <span
              className="font-bold text-[#3D2B1F] truncate"
              title={
                userLocation
                  ? `${userLocation.name} (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`
                  : 'Đang dùng vị trí mặc định (Đà Nẵng)'
              }
            >
              {userLocation ? userLocation.name : 'Đà Nẵng (Mặc định)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleGetBrowserLocation(false)}
              disabled={isLocating}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#964824] hover:bg-[#7D3B1D] text-white font-medium text-[11px] shadow-2xs transition-all cursor-pointer disabled:opacity-60"
              title="Lấy chính xác tọa độ GPS hiện tại từ trình duyệt"
            >
              {isLocating ? (
                <>
                  <Loader2 size={11} className="animate-spin" />
                  <span>Đang lấy...</span>
                </>
              ) : (
                <>
                  <Navigation size={11} />
                  <span>Lấy vị trí của tôi</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowLocationPicker((prev) => !prev)}
              className="px-2 py-1 rounded-lg border border-[#EAD8CC] bg-white hover:bg-stone-50 text-[#7A6255] font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-0.5"
              title="Chọn tỉnh/thành phố khác"
            >
              <span>{showLocationPicker ? 'Đóng' : 'Đổi'}</span>
              <ChevronDown
                size={11}
                className={`transition-transform duration-200 ${
                  showLocationPicker ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Location Selector Dropdown Panel */}
        {showLocationPicker && (
          <div className="bg-white border-b border-[#EAD8CC] p-3 text-xs shadow-inner animate-in fade-in slide-in-from-top-2 duration-200 shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#3D2B1F]">
                Chọn vị trí tìm kiếm workshop:
              </span>
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* GPS Locate Button */}
            <button
              type="button"
              onClick={() => handleGetBrowserLocation(false)}
              disabled={isLocating}
              className="w-full mb-2.5 py-2 px-3 rounded-xl bg-[#FAF5EF] hover:bg-[#964824]/10 border border-[#EAD8CC] hover:border-[#964824] text-[#964824] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isLocating ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Đang kết nối GPS thiết bị...</span>
                </>
              ) : (
                <>
                  <LocateFixed size={13} />
                  <span>Lấy tọa độ GPS thiết bị hiện tại</span>
                </>
              )}
            </button>

            {locationError && (
              <div className="mb-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-1.5">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">Không thể truy cập GPS:</p>
                  <p>{locationError}</p>
                </div>
              </div>
            )}

            <div className="text-[11px] font-medium text-[#7A6255] mb-1.5">
              Hoặc chọn nhanh điểm đến du lịch:
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_LOCATIONS.map((preset) => {
                const isSelected = userLocation?.name === preset.name;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-1.5 px-2.5 rounded-lg text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#964824] text-white border-[#964824]'
                        : 'bg-[#FAF9F5] hover:bg-white text-[#3D2B1F] border-[#EAD8CC] hover:border-[#964824]/40'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold truncate">{preset.name}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-stone-200' : 'text-[#7A6255]'
                        }`}
                      >
                        {preset.desc}
                      </div>
                    </div>
                    {isSelected && <Check size={12} className="shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF9F5]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {/* Sender Tag */}
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-bold text-[#7A6255]">
                {msg.role === 'assistant' ? (
                  <>
                    <Bot size={13} className="text-[#964824]" />
                    <span>Trợ lý AI</span>
                  </>
                ) : (
                  <>
                    <span>Bạn</span>
                    <User size={13} className="text-[#964824]" />
                  </>
                )}
              </div>

              {/* Chat Bubble */}
              <div
                className={`max-w-[90%] md:max-w-[85%] rounded-2xl p-3.5 shadow-2xs leading-relaxed text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#964824] text-white rounded-tr-xs'
                    : 'bg-white text-[#3D2B1F] border border-[#EAD8CC] rounded-tl-xs'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <>
                    {formatAiText(msg.content)}
                    {(msg.content.toLowerCase().includes('lịch trình') ||
                      msg.content.toLowerCase().includes('hành trình') ||
                      msg.content.toLowerCase().includes('chuyến đi') ||
                      msg.content.toLowerCase().includes('thời tiết') ||
                      msg.content.toLowerCase().includes('đề xuất')) && (
                      <div className="mt-2.5 pt-2 border-t border-[#F0E6DE]">
                        <button
                          type="button"
                          onClick={() => openItineraryModal(msg.location?.name || 'Phố cổ Hội An')}
                          className="w-full py-2 px-3 rounded-xl bg-[#964824] hover:bg-[#7D3B1D] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <Calendar size={13} />
                          <span>Mở & Tùy chỉnh Lịch trình 1 ngày chi tiết</span>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}

                {/* Embedded Craft Recommendation Cards */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#F0E6DE] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#7A6255]">
                      <span className="flex items-center gap-1 text-[#964824]">
                        <Sparkles size={12} />
                        <span>Địa điểm đề xuất</span>
                      </span>
                      <span>{msg.recommendations.length} địa điểm</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5">
                      {msg.recommendations.map((place) => (
                        <div
                          key={place.id}
                          className="group bg-[#FAF7F2] hover:bg-white rounded-xl border border-[#EAD8CC] hover:border-[#964824]/40 p-2.5 transition-all shadow-2xs hover:shadow-xs flex gap-3"
                        >
                          {/* Thumbnail */}
                          <div className="w-18 h-18 rounded-lg overflow-hidden shrink-0 relative bg-stone-200">
                            <ImageWithFallback
                              src={place.image}
                              alt={place.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {place.distanceLabel && (
                              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#3D2B1F]/80 text-white backdrop-blur-xs">
                                {place.distanceLabel}
                              </span>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#964824]/10 text-[#964824]">
                                  {place.typeLabel}
                                </span>
                                <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600">
                                  <Star size={11} className="fill-amber-500 text-amber-500" />
                                  <span>{place.rating}</span>
                                </div>
                              </div>

                              <h4 className="font-bold text-xs text-[#3D2B1F] group-hover:text-[#964824] truncate transition-colors">
                                {place.name}
                              </h4>
                              <p className="text-[10px] text-[#7A6255] line-clamp-1 mt-0.5">
                                {place.shortDescription}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-1.5 border-t border-[#F0E6DE]/60 mt-1">
                              <span className="text-[11px] font-bold text-[#964824]">
                                {place.priceLabel || 'Miễn phí'}
                              </span>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={place.directionsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded text-stone-500 hover:text-[#964824] hover:bg-[#964824]/10 transition-colors"
                                  title="Chỉ đường trên Google Maps"
                                >
                                  <Navigation size={12} />
                                </a>
                                <Link
                                  to={place.detailUrl}
                                  onClick={onClose}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#964824] text-white hover:bg-[#7D3B1D] transition-colors"
                                >
                                  Xem
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestion Prompt Chips */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5 max-w-[95%]">
                  {msg.suggestedPrompts.map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      disabled={isThinking}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white hover:bg-[#964824] text-[#5A4A41] hover:text-white border border-[#EAD8CC] hover:border-[#964824] shadow-2xs transition-all cursor-pointer disabled:opacity-50 text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Thinking / Typing Indicator */}
          {isThinking && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-[#964824]/10 text-[#964824] flex items-center justify-center shrink-0 mt-1">
                <Loader2 size={14} className="animate-spin" />
              </div>
              <div className="bg-white border border-[#EAD8CC] rounded-2xl rounded-tl-xs px-3.5 py-2 text-xs text-[#7A6255] flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#964824] animate-bounce" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#964824] animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#964824] animate-bounce [animation-delay:0.4s]" />
                <span>Trợ lý AI đang suy nghĩ...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#EAD8CC] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Hỏi về làng nghề, kỹ thuật, cách đặt vé..."
              disabled={isThinking}
              className="flex-1 bg-[#FAF9F5] border border-[#EAD8CC] focus:border-[#964824] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-[#3D2B1F] placeholder-[#9E8B80] outline-hidden transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="w-10 h-10 rounded-xl bg-[#964824] hover:bg-[#7D3B1D] disabled:bg-stone-300 text-white flex items-center justify-center shrink-0 shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:cursor-not-allowed"
              title="Gửi tin nhắn"
              aria-label="Gửi tin nhắn"
            >
              <Send size={15} />
            </button>
          </form>
          <div className="mt-1.5 text-center">
            <span className="text-[10px] text-[#A8988E]">
              Trợ lý AI CraftLocal kết hợp OpenAI & cơ sở dữ liệu làng nghề thực tế
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiChatBox;
