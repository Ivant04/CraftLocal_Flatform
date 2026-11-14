import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Coffee,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Check,
  X,
  Loader2,
  Compass,
  Utensils,
  Camera,
  Hammer,
  Bookmark,
} from 'lucide-react';
import type {
  OneDayItinerary,
  ItineraryStop,
  CafeSuggestion,
  ActivityType,
} from '../../types/itinerary.type';
import { recommendationService } from '../../services/recommendationService';

interface ItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialDestination?: string;
}

const TYPE_CONFIG: Record<
  ActivityType,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  WORKSHOP: {
    label: 'Workshop thủ công',
    badgeClass: 'bg-[#964824]/12 text-[#964824] border-[#964824]/20',
    icon: Hammer,
  },
  CAFE_REST: {
    label: 'Cà phê & Nghỉ ngơi',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: Coffee,
  },
  FOOD: {
    label: 'Ẩm thực truyền thống',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: Utensils,
  },
  SIGHTSEEING: {
    label: 'Tham quan & Check-in',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: Camera,
  },
};

export const ItineraryModal: React.FC<ItineraryModalProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialDestination,
}) => {
  const [promptInput, setPromptInput] = useState<string>('');
  const [itinerary, setItinerary] = useState<OneDayItinerary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // AI Cafe Suggestion Panel State
  const [showCafePanel, setShowCafePanel] = useState<boolean>(false);
  const [cafeSuggestions, setCafeSuggestions] = useState<CafeSuggestion[]>([]);
  const [isLoadingCafes, setIsLoadingCafes] = useState<boolean>(false);

  // Edit / Add Stop Modal State
  const [editingStop, setEditingStop] = useState<ItineraryStop | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [stopForm, setStopForm] = useState<Partial<ItineraryStop>>({
    time: '14:00 - 15:00',
    period: 'AFTERNOON',
    title: '',
    type: 'CAFE_REST',
    typeLabel: 'Cà phê & Nghỉ ngơi',
    location: '',
    costEstimate: '35.000đ',
    notes: '',
  });

  // Generate Itinerary by Natural Language Prompt
  const handleGenerate = useCallback(async (customText?: string) => {
    const text = (customText !== undefined ? customText : promptInput).trim();
    if (!text) return;

    setIsLoading(true);
    setShowCafePanel(false);
    try {
      const data = await recommendationService.generateItinerary({
        prompt: text,
      });
      setItinerary(data);
    } catch (err) {
      console.error('[ItineraryModal] Failed to load itinerary:', err);
    } finally {
      setIsLoading(false);
    }
  }, [promptInput]);

  // Initial trigger on open
  useEffect(() => {
    if (isOpen) {
      const explicitPrompt = (initialPrompt || initialDestination || '').trim();
      if (explicitPrompt) {
        setPromptInput(explicitPrompt);
        handleGenerate(explicitPrompt);
      } else {
        setPromptInput('');
        setItinerary(null);
        setIsLoading(false);
      }
    } else {
      setShowCafePanel(false);
      setEditingStop(null);
      setIsAddingNew(false);
    }
  }, [isOpen, initialPrompt, initialDestination]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load AI Cafe suggestions
  const handleLoadCafes = async () => {
    setShowCafePanel(true);
    setIsLoadingCafes(true);
    try {
      const list = await recommendationService.suggestCafes(
        itinerary?.destination || promptInput,
        itinerary?.stops.length || 0
      );
      setCafeSuggestions(list);
    } catch (err) {
      console.error('[ItineraryModal] Failed to suggest cafes:', err);
    } finally {
      setIsLoadingCafes(false);
    }
  };

  // Add suggested cafe into itinerary
  const handleAddCafeToItinerary = (cafe: CafeSuggestion) => {
    if (!itinerary) return;

    const newStop: ItineraryStop = {
      id: `cafe-${Date.now()}`,
      time: cafe.recommendedTime || '14:30 - 15:30',
      period: 'AFTERNOON',
      title: `Thư giãn & Cà phê: ${cafe.name}`,
      type: 'CAFE_REST',
      typeLabel: 'Cà phê nghỉ ngơi (AI)',
      location: cafe.address,
      costEstimate: cafe.estimatedPrice,
      notes: `${cafe.specialty}. ${cafe.reason}`,
      durationMinutes: 60,
      isAiSuggested: true,
    };

    // Smart insertion: insert in afternoon or after lunch
    const noonIdx = itinerary.stops.findIndex(
      (s) => s.period === 'NOON' || s.type === 'FOOD'
    );
    const insertIdx =
      noonIdx !== -1
        ? noonIdx + 1
        : Math.max(1, Math.floor(itinerary.stops.length / 2));

    const updatedStops = [...itinerary.stops];
    updatedStops.splice(insertIdx, 0, newStop);

    setItinerary({
      ...itinerary,
      stops: updatedStops,
    });

    setShowCafePanel(false);
  };

  // Delete a stop
  const handleDeleteStop = (id: string) => {
    if (!itinerary) return;
    setItinerary({
      ...itinerary,
      stops: itinerary.stops.filter((s) => s.id !== id),
    });
  };

  // Move a stop up or down
  const handleMoveStop = (idx: number, direction: 'UP' | 'DOWN') => {
    if (!itinerary) return;
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= itinerary.stops.length) return;

    const updated = [...itinerary.stops];
    const temp = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = temp;

    setItinerary({
      ...itinerary,
      stops: updated,
    });
  };

  // Save stop form (Add or Edit)
  const handleSaveStopForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itinerary || !stopForm.title?.trim()) return;

    const typeConfig =
      TYPE_CONFIG[stopForm.type as ActivityType] || TYPE_CONFIG.SIGHTSEEING;

    if (isAddingNew) {
      const newStop: ItineraryStop = {
        id: `stop-${Date.now()}`,
        time: stopForm.time || '14:00 - 15:00',
        period: (stopForm.period as any) || 'AFTERNOON',
        title: stopForm.title.trim(),
        type: (stopForm.type as ActivityType) || 'SIGHTSEEING',
        typeLabel: typeConfig.label,
        location: stopForm.location?.trim() || itinerary.destination,
        costEstimate: stopForm.costEstimate || 'Miễn phí',
        notes: stopForm.notes?.trim() || '',
        durationMinutes: 60,
      };

      setItinerary({
        ...itinerary,
        stops: [...itinerary.stops, newStop],
      });
    } else if (editingStop) {
      const updated = itinerary.stops.map((s) => {
        if (s.id === editingStop.id) {
          return {
            ...s,
            time: stopForm.time || s.time,
            period: (stopForm.period as any) || s.period,
            title: stopForm.title?.trim() || s.title,
            type: (stopForm.type as ActivityType) || s.type,
            typeLabel: typeConfig.label,
            location: stopForm.location?.trim() || s.location,
            costEstimate: stopForm.costEstimate || s.costEstimate,
            notes: stopForm.notes?.trim() || s.notes,
          };
        }
        return s;
      });

      setItinerary({
        ...itinerary,
        stops: updated,
      });
    }

    setEditingStop(null);
    setIsAddingNew(false);
  };

  // Open edit modal for stop
  const openEditModal = (stop: ItineraryStop) => {
    setEditingStop(stop);
    setIsAddingNew(false);
    setStopForm({
      time: stop.time,
      period: stop.period,
      title: stop.title,
      type: stop.type,
      typeLabel: stop.typeLabel,
      location: stop.location,
      costEstimate: stop.costEstimate,
      notes: stop.notes,
    });
  };

  // Open add new stop modal
  const openAddModal = () => {
    setIsAddingNew(true);
    setEditingStop(null);
    setStopForm({
      time: '14:00 - 15:00',
      period: 'AFTERNOON',
      title: '',
      type: 'CAFE_REST',
      typeLabel: 'Cà phê & Nghỉ ngơi',
      location: itinerary?.destination || '',
      costEstimate: '35.000đ',
      notes: '',
    });
  };

  // Copy itinerary to clipboard
  const handleCopyItinerary = () => {
    if (!itinerary) return;

    let text = `LỊCH TRÌNH 1 NGÀY: ${itinerary.title}\n`;
    text += `Địa điểm: ${itinerary.destination}\n`;
    text += `Ước tính chi phí: ${itinerary.totalEstimatedCost}\n\n`;
    text += `CHI TIẾT LỊCH TRÌNH:\n`;

    itinerary.stops.forEach((s, idx) => {
      text += `${idx + 1}. [${s.time}] ${s.title}\n`;
      text += `   - Phân loại: ${s.typeLabel}\n`;
      text += `   - Địa điểm: ${s.location}\n`;
      if (s.costEstimate) text += `   - Chi phí: ${s.costEstimate}\n`;
      if (s.notes) text += `   - Ghi chú: ${s.notes}\n`;
      text += `\n`;
    });

    text += `Được tạo bởi Trợ lý AI CraftLocal - Nền tảng Du lịch Làng nghề & Trải nghiệm Thủ công Việt Nam.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lịch trình 1 ngày trải nghiệm làng nghề"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity z-0"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative z-10 w-full max-w-4xl bg-[#FAF9F5] rounded-3xl shadow-[0_25px_70px_rgba(61,43,31,0.3)] border border-[#EAD8CC] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#3D2B1F] text-white flex items-center justify-between shrink-0 border-b border-[#5A3E2D]/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#964824] flex items-center justify-center text-white shrink-0">
              <Calendar size={17} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base md:text-lg text-white tracking-wide truncate">
                  Lịch trình 1 ngày
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <Sparkles size={10} />
                  <span>AI Tự động tạo</span>
                </span>
              </div>
              <p className="text-xs text-stone-300 hidden sm:block">
                Ghi bất kỳ nội dung nào bạn muốn, AI sẽ tự động phân tích và tạo lịch trình phù hợp
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopyItinerary}
              disabled={!itinerary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer disabled:opacity-50"
              title="Sao chép toàn bộ lịch trình"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-400" />
                  <span className="text-emerald-300">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span className="hidden sm:inline">Sao chép</span>
                </>
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Natural Language Prompt Bar (Pure Text Input - No Click/Select Needed) */}
        <div className="p-4 bg-white border-b border-[#EAD8CC] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Sparkles
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#964824]"
              />
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ghi mong muốn của bạn (ví dụ: Đi Hội An 1 ngày làm gốm và đi uống cafe view đẹp, hoặc Đi Đà Nẵng thư thả...)"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border border-[#EAD8CC] focus:border-[#964824] focus:bg-white rounded-2xl text-xs sm:text-sm text-[#3D2B1F] placeholder-[#9E8B80] outline-hidden shadow-2xs transition-all disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={!promptInput.trim() || isLoading}
              className="px-4 sm:px-5 py-3 rounded-2xl bg-[#964824] hover:bg-[#7D3B1D] disabled:bg-stone-300 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer disabled:cursor-not-allowed shrink-0"
              title="Tạo lịch trình bằng AI"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              <span>Tạo lịch trình</span>
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8C7A70] px-1">
            <span>Chỉ cần ghi nội dung bạn muốn, AI sẽ tự động phân tích và tạo lịch trình phù hợp nhất.</span>
            {itinerary && (
              <span className="hidden sm:inline-block font-semibold text-[#964824]">
                {itinerary.stops.length} điểm dừng · {itinerary.totalEstimatedCost}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#964824]/10 text-[#964824] flex items-center justify-center">
                <Loader2 size={24} className="animate-spin" />
              </div>
              <h3 className="font-bold text-sm text-[#3D2B1F]">
                AI đang thiết kế lịch trình 1 ngày theo nội dung bạn ghi...
              </h3>
              <p className="text-xs text-[#7A6255] max-w-sm">
                Tính toán thời gian di chuyển, chọn xưởng thủ công phù hợp và sắp xếp chặng dừng nghỉ hợp lý.
              </p>
            </div>
          ) : itinerary ? (
            <>
              {/* Itinerary Banner Card */}
              <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 shadow-2xs space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-[#F0E6DE] pb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#964824]/10 text-[#964824] uppercase tracking-wider">
                      {itinerary.themeLabel}
                    </span>
                    <h3 className="font-bold text-base md:text-lg text-[#3D2B1F] mt-1">
                      {itinerary.title}
                    </h3>
                  </div>

                  {/* Summary Metric Chips */}
                  <div className="flex items-center gap-3 text-xs font-semibold text-[#7A6255]">
                    <div className="flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EAD8CC]">
                      <Clock size={13} className="text-[#964824]" />
                      <span>{itinerary.stops.length} điểm dừng</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EAD8CC]">
                      <Bookmark size={13} className="text-[#964824]" />
                      <span>{itinerary.totalEstimatedCost}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs md:text-sm text-[#5A4A41] leading-relaxed">
                  {itinerary.summary}
                </p>

                {itinerary.weatherNote && (
                  <div className="flex items-center gap-2 text-xs text-[#7A6255] bg-[#FAF7F2] px-3 py-2 rounded-xl border border-[#EAD8CC]/60">
                    <Sparkles size={13} className="text-amber-600 shrink-0" />
                    <span><strong>Lưu ý thời tiết:</strong> {itinerary.weatherNote}</span>
                  </div>
                )}
              </div>

              {/* AI Cafe Suggester Action Banner */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50/60 rounded-2xl border border-amber-200/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Coffee size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-[#3D2B1F] flex items-center gap-1.5">
                      <span>Gợi ý quán cà phê nghỉ ngơi xen kẽ bằng AI</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900">
                        AI
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#7A6255] mt-0.5">
                      Tự động gợi ý các quán cà phê rêu phong, trà thảo mộc văn hóa để nghỉ chân giữa các hoạt động.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadCafes}
                  disabled={isLoadingCafes}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#3D2B1F] hover:bg-[#5A3E2D] text-white shrink-0 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {isLoadingCafes ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Sparkles size={13} className="text-amber-400" />
                  )}
                  <span>Xem gợi ý quán cà phê</span>
                </button>
              </div>

              {/* Cafe Suggestions Drawer / Cards (If Open) */}
              {showCafePanel && (
                <div className="bg-white rounded-2xl border border-amber-300 p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Coffee size={15} className="text-amber-600" />
                      <h4 className="font-bold text-xs md:text-sm text-[#3D2B1F]">
                        Các điểm cà phê văn hóa tiêu biểu phù hợp nghỉ chân
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCafePanel(false)}
                      className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
                      title="Đóng gợi ý"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cafeSuggestions.map((cafe) => (
                      <div
                        key={cafe.id}
                        className="bg-[#FAF7F2] rounded-xl border border-[#EAD8CC] p-3 flex flex-col justify-between space-y-2 hover:border-amber-400 transition-colors"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-xs text-[#3D2B1F]">
                              {cafe.name}
                            </h5>
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                              {cafe.estimatedPrice}
                            </span>
                          </div>
                          <p className="text-[11px] font-medium text-[#964824] mt-0.5">
                            {cafe.tagline}
                          </p>
                          <p className="text-[10px] text-[#7A6255] mt-1 line-clamp-2">
                            {cafe.reason}
                          </p>
                          <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                            <MapPin size={10} className="shrink-0 text-stone-400" />
                            <span className="truncate">{cafe.address}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddCafeToItinerary(cafe)}
                          className="w-full mt-2 py-1.5 rounded-lg text-xs font-bold bg-[#964824] hover:bg-[#7D3B1D] text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus size={12} />
                          <span>Thêm vào lịch trình</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline Stops List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-xs md:text-sm text-[#3D2B1F] flex items-center gap-2">
                    <Compass size={15} className="text-[#964824]" />
                    <span>Lịch trình chi tiết trong ngày ({itinerary.stops.length} chặng)</span>
                  </h4>
                  <button
                    type="button"
                    onClick={openAddModal}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#964824] hover:text-[#7D3B1D] bg-[#964824]/10 hover:bg-[#964824]/20 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Thêm hoạt động</span>
                  </button>
                </div>

                <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-[#EAD8CC] before:z-0">
                  {itinerary.stops.map((stop, idx) => {
                    const typeConfig =
                      TYPE_CONFIG[stop.type] || TYPE_CONFIG.SIGHTSEEING;
                    const TypeIcon = typeConfig.icon;

                    return (
                      <div
                        key={stop.id}
                        className="relative z-10 group bg-white rounded-2xl border border-[#EAD8CC] p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-start gap-3.5"
                      >
                        {/* Time & Type Column */}
                        <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 md:w-36 shrink-0">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#3D2B1F] text-white text-xs font-bold tracking-tight">
                            <Clock size={11} className="text-amber-400" />
                            <span>{stop.time}</span>
                          </div>

                          <div
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeConfig.badgeClass}`}
                          >
                            <TypeIcon size={10} />
                            <span>{typeConfig.label}</span>
                          </div>
                        </div>

                        {/* Content Column */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-sm text-[#3D2B1F] group-hover:text-[#964824] transition-colors">
                              {stop.title}
                            </h5>

                            {stop.isAiSuggested && (
                              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                AI Đề xuất
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[#7A6255] mt-1">
                            <MapPin size={12} className="text-[#964824] shrink-0" />
                            <span className="truncate">{stop.location}</span>
                            {stop.costEstimate && (
                              <span className="text-[11px] font-semibold text-[#964824] shrink-0 ml-1">
                                · {stop.costEstimate}
                              </span>
                            )}
                          </div>

                          {stop.notes && (
                            <p className="text-xs text-[#5A4A41] mt-1.5 leading-relaxed bg-[#FAF9F5] p-2 rounded-xl border border-[#EAD8CC]/60">
                              {stop.notes}
                            </p>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex items-center md:flex-col justify-end gap-1 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveStop(idx, 'UP')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển lên"
                          >
                            <ArrowUp size={13} />
                          </button>

                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveStop(idx, 'DOWN')}
                            disabled={idx === itinerary.stops.length - 1}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                            title="Di chuyển xuống"
                          >
                            <ArrowDown size={13} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(stop)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-[#964824] hover:bg-[#964824]/10 cursor-pointer transition-colors"
                            title="Chỉnh sửa chi tiết"
                          >
                            <Pencil size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStop(stop.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                            title="Xóa chặng này"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-12 px-4 flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#964824]/10 to-amber-500/10 border border-[#964824]/20 text-[#964824] flex items-center justify-center mb-4 shadow-xs">
                <Compass size={32} className="text-[#964824]" />
              </div>
              <h3 className="font-bold text-base md:text-lg text-[#3D2B1F] mb-1.5 font-playfair">
                Nhập mong muốn để AI thiết kế lịch trình 1 ngày
              </h3>
              <p className="text-xs md:text-sm text-[#7A6255] leading-relaxed mb-6">
                Chỉ cần ghi sở thích hoặc kế hoạch của bạn vào ô tìm kiếm ở trên và nhấn <strong>Tạo lịch trình</strong>. AI sẽ tự động phân tích thời gian di chuyển, chọn xưởng thủ công và sắp xếp chặng dừng chân nghỉ ngơi hợp lý.
              </p>

              {/* Gợi ý mẫu để người dùng tham khảo hoặc bấm chọn nhanh */}
              <div className="w-full text-left space-y-2.5">
                <p className="text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-600" />
                  <span>Gợi ý mẫu để bạn thử:</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    'Đi Hội An 1 ngày: làm gốm Thanh Hà, dệt lụa và cà phê phố cổ',
                    'Trải nghiệm mây tre đan Cẩm Thanh và ẩm thực làng rau Trà Quế',
                    'Điêu khắc đá Non Nước Đà Nẵng kết hợp cà phê ngắm biển',
                    'Khám phá tranh sơn mài, trà đạo truyền thống và dạo phố cổ',
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPromptInput(sample);
                      }}
                      className="text-left p-2.5 rounded-xl bg-white border border-[#EAD8CC] hover:border-[#964824] hover:bg-[#FAF7F2] text-[#5A4A41] transition-all cursor-pointer shadow-2xs group"
                    >
                      <span className="font-medium text-[#3D2B1F] group-hover:text-[#964824] line-clamp-2">
                        {sample}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-5 py-3.5 bg-white border-t border-[#EAD8CC] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-[#7A6255]">
            Mẹo: Bạn có thể nhập nội dung mới vào ô phía trên bất cứ lúc nào để AI tạo lại lịch trình.
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAddModal}
              disabled={!itinerary}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#3D2B1F] bg-[#FAF7F2] hover:bg-[#F2ECE4] border border-[#EAD8CC] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Thêm hoạt động
            </button>
            <button
              type="button"
              onClick={handleCopyItinerary}
              disabled={!itinerary}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#964824] hover:bg-[#7D3B1D] text-white shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Đã sao chép lịch trình' : 'Sao chép để lưu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit / Add Stop Modal Popover */}
      {(editingStop || isAddingNew) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-2xs"
            onClick={() => {
              setEditingStop(null);
              setIsAddingNew(false);
            }}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EAD8CC] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h4 className="font-bold text-sm text-[#3D2B1F]">
                {isAddingNew
                  ? 'Thêm hoạt động mới vào lịch trình'
                  : 'Chỉnh sửa hoạt động'}
              </h4>
              <button
                type="button"
                onClick={() => {
                  setEditingStop(null);
                  setIsAddingNew(false);
                }}
                className="p-1 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStopForm} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#3D2B1F] mb-1">
                  Khung giờ (Ví dụ: 09:30 - 11:30)
                </label>
                <input
                  type="text"
                  value={stopForm.time}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, time: e.target.value })
                  }
                  required
                  className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D2B1F] mb-1">
                  Tên hoạt động / Trải nghiệm
                </label>
                <input
                  type="text"
                  value={stopForm.title}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, title: e.target.value })
                  }
                  placeholder="Ví dụ: Workshop vuốt gốm Bát Tràng"
                  required
                  className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#3D2B1F] mb-1">
                    Phân loại
                  </label>
                  <select
                    value={stopForm.type}
                    onChange={(e) =>
                      setStopForm({
                        ...stopForm,
                        type: e.target.value as ActivityType,
                      })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                  >
                    <option value="WORKSHOP">Workshop thủ công</option>
                    <option value="CAFE_REST">Cà phê & Nghỉ ngơi</option>
                    <option value="FOOD">Ẩm thực truyền thống</option>
                    <option value="SIGHTSEEING">Tham quan & Check-in</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#3D2B1F] mb-1">
                    Buổi trong ngày
                  </label>
                  <select
                    value={stopForm.period}
                    onChange={(e) =>
                      setStopForm({ ...stopForm, period: e.target.value as any })
                    }
                    className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                  >
                    <option value="MORNING">Buổi Sáng</option>
                    <option value="NOON">Buổi Trưa</option>
                    <option value="AFTERNOON">Buổi Chiều</option>
                    <option value="EVENING">Buổi Tối</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3D2B1F] mb-1">
                  Địa điểm / Tên xưởng / Quán
                </label>
                <input
                  type="text"
                  value={stopForm.location}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, location: e.target.value })
                  }
                  placeholder="Ví dụ: Làng Gốm Thanh Hà, Hội An"
                  className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D2B1F] mb-1">
                  Chi phí dự kiến (tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={stopForm.costEstimate}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, costEstimate: e.target.value })
                  }
                  placeholder="Ví dụ: 60.000đ hoặc Miễn phí"
                  className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3D2B1F] mb-1">
                  Ghi chú / Mẹo trải nghiệm
                </label>
                <textarea
                  rows={2}
                  value={stopForm.notes}
                  onChange={(e) =>
                    setStopForm({ ...stopForm, notes: e.target.value })
                  }
                  placeholder="Ví dụ: Nên đến sớm để tránh đông khách, mặc trang phục thoải mái..."
                  className="w-full bg-[#FAF9F5] border border-[#EAD8CC] rounded-xl px-3 py-2 text-xs text-[#3D2B1F] focus:border-[#964824] outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStop(null);
                    setIsAddingNew(false);
                  }}
                  className="px-3.5 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#964824] hover:bg-[#7D3B1D] text-white font-bold transition-colors cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryModal;
