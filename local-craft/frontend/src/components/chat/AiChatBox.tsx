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
} from 'lucide-react';
import type {
  AiChatMessage,
  NearbyPlace,
} from '../../types/recommendation.type';
import { recommendationService } from '../../services/recommendationService';
import ImageWithFallback from '../common/ImageWithFallback';
import { useNearbyModal } from '../../context/NearbyModalContext';

interface AiChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_SUGGESTED_PROMPTS = [
  'Lập lịch trình 1 ngày ở Hội An',
  'Lịch sử làng gốm Bát Tràng',
  'Gợi ý quán cà phê nghỉ ngơi',
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

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

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
    const content = (textToSend || inputText).trim();
    if (!content || isThinking) return;

    setInputText('');

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
                            openItineraryModal(lastUser?.content || 'Đi Hội An 1 ngày: làm gốm, dệt lụa và cà phê nghỉ ngơi');
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
                      msg.content.toLowerCase().includes('hành trình')) && (
                      <div className="mt-2.5 pt-2 border-t border-[#F0E6DE]">
                        <button
                          type="button"
                          onClick={() => openItineraryModal()}
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
