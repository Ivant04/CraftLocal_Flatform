import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Headphones, Sparkles, Loader2, RefreshCw, Trash2, Volume2 } from 'lucide-react';
import workshopApi from '../../api/workshopApi';
import axiosClient from '../../api/axiosClient';
import audioGuideApi from '../../api/audioGuideApi';
import AudioGuidePlayer from '../../components/audio/AudioGuidePlayer';
import type { WorkshopDetail } from '../../types/workshopDetail.type';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';

interface WorkshopAudioGuide {
  audioUrl?: string;
  narrativeText?: string;
  durationSeconds?: number;
  voice?: string;
}

const WorkshopFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<WorkshopDetail | null>(null);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [price, setPrice] = useState(0);
  const [hasPromotion, setHasPromotion] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // AI Audio Guide states
  const [audioGuide, setAudioGuide] = useState<WorkshopAudioGuide | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>('nhu');
  const [narrativeScript, setNarrativeScript] = useState<string>('');
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string>('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    Promise.all([axiosClient.get('/categories', { params: { type: 'WORKSHOP' } }), id ? workshopApi.getById(id) : Promise.resolve(null)])
      .then(([categoryResponse, workshopResponse]) => {
        if (!active) return;
        const data: WorkshopDetail | null = workshopResponse?.data.data || null;
        setCategories(categoryResponse.data.data);
        setWorkshop(data);
        setPrice(data?.price || 0);
        setHasPromotion(!!data?.promotion);
        setAudioGuide(data?.audioGuide || null);
        if (data?.audioGuide?.narrativeText) {
          setNarrativeScript(data.audioGuide.narrativeText);
        }
        if (data?.audioGuide?.voice) {
          setSelectedVoice(data.audioGuide.voice);
        }
      }).catch(() => { if (active) setLoadError('Không tải được thông tin workshop.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt]);

  const getFormData = () => {
    const formEl = document.querySelector('form') as HTMLFormElement;
    const currentTitle = (formEl?.elements.namedItem('title') as HTMLInputElement)?.value?.trim() || workshop?.title || '';
    const currentDesc = (formEl?.elements.namedItem('description') as HTMLTextAreaElement)?.value?.trim() || workshop?.description || '';
    const currentLocation = (formEl?.elements.namedItem('locationLabel') as HTMLInputElement)?.value?.trim() || workshop?.locationLabel || '';
    return { currentTitle, currentDesc, currentLocation };
  };

  // 1. AI gợi ý kịch bản cho Host
  const handleGenerateScript = async () => {
    setAudioError('');
    const { currentTitle, currentDesc, currentLocation } = getFormData();
    if (!currentTitle) {
      setAudioError('Vui lòng nhập "Tiêu đề" workshop trước khi tạo kịch bản.');
      return;
    }
    setIsGeneratingScript(true);
    try {
      const res = await audioGuideApi.generateNarrative({
        title: currentTitle,
        location: currentLocation || 'Làng nghề truyền thống Việt Nam',
        type: 'Workshop làng nghề thủ công',
        notes: currentDesc,
      });
      if (res.data?.narrativeText) {
        setNarrativeScript(res.data.narrativeText);
      }
    } catch (err: any) {
      setAudioError(err?.response?.data?.message || 'Không thể tạo kịch bản lúc này.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 2. Chuyển kịch bản thành file MP3 với giọng đã chọn
  const handleSynthesizeFromScript = async () => {
    setAudioError('');
    const textToRead = narrativeScript.trim();
    if (!textToRead) {
      setAudioError('Vui lòng nhập nội dung kịch bản hoặc bấm "AI gợi ý kịch bản" trước khi tạo file âm thanh.');
      return;
    }
    setIsSynthesizingAudio(true);
    try {
      const res = await audioGuideApi.synthesizeAudio(textToRead, selectedVoice);
      if (res.data) {
        setAudioGuide({
          audioUrl: res.data.audioUrl,
          narrativeText: textToRead,
          durationSeconds: res.data.durationSeconds,
          voice: selectedVoice,
        });
      }
    } catch (err: any) {
      setAudioError(err?.response?.data?.message || 'Không thể tổng hợp giọng đọc lúc này.');
    } finally {
      setIsSynthesizingAudio(false);
    }
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setError('');
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) || '').trim();
    const payload = {
      title: text('title'), description: text('description'), categoryId: text('categoryId'),
      locationLabel: text('locationLabel'),
      address: workshop?.address?.fullAddress === text('address') ? workshop.address : text('address'),
      mapLocation: { lat: Number(form.get('lat')), lng: Number(form.get('lng')) },
      price, duration: Number(form.get('duration')), maxGuestsPerSlot: Number(form.get('maxGuestsPerSlot')),
      images: text('images').split('\n').map((url) => url.trim()).filter(Boolean),
      promotion: price > 0 && hasPromotion ? { code: text('couponCode').toUpperCase(), percentOff: Number(form.get('percentOff')) } : null,
      audioGuide: audioGuide || null,
    };
    setSaving(true);
    try {
      if (id) await workshopApi.update(id, payload);
      else await workshopApi.create(payload);
      navigate('/host/workshops');
    } catch (error: any) { setError(error.response?.data?.message || 'Không lưu được workshop. Vui lòng thử lại.'); }
    finally { setSaving(false); }
  }

  if (loading) return <p role="status">Đang tải thông tin workshop…</p>;
  if (loadError) return <div><p role="alert">{loadError}</p><Button onClick={() => setAttempt((value) => value + 1)}>Thử lại</Button></div>;

  return (
    <div className="max-w-2xl">
      <div className="mb-8"><h1 className="font-headline-lg text-headline-md text-[#3D2B1F]">Thông tin Workshop</h1><p className="text-[#7A6255] text-sm mt-1">Cập nhật địa điểm, ảnh và ưu đãi cho trải nghiệm của bạn</p></div>
      <form key={id || 'new'} onSubmit={onSubmit} className="bg-white rounded-3xl border border-[#EAD8CC] p-6 md:p-8 space-y-5">
        <fieldset disabled={saving} className="space-y-5 border-0 p-0 m-0">
          <Input name="title" label="Tiêu đề" defaultValue={workshop?.title} required />
          <Textarea name="description" label="Mô tả" defaultValue={workshop?.description} required />

          {/* Host Voice Design Studio */}
          <div className="border border-amber-200/90 rounded-3xl p-6 bg-[#FFFDF8] space-y-6 shadow-xs">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#964824] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Headphones size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-[#3D2B1F]">
                      AI Audio Guide (Thuyết minh âm thanh cho Workshop)
                    </h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#964824]/10 text-[#964824]">
                      Giọng Vũ Nhàn (Eleven v4)
                    </span>
                  </div>
                  <p className="text-xs text-[#7A6255] mt-0.5">
                    Soạn kịch bản và xuất bản audio thuyết minh văn hóa làng nghề cho du khách lắng nghe trước khi đặt chỗ.
                  </p>
                </div>
              </div>

              {audioGuide?.audioUrl && (
                <button
                  type="button"
                  onClick={() => setAudioGuide(null)}
                  className="text-stone-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                  title="Xóa audio"
                >
                  <Trash2 size={14} /> Xóa audio
                </button>
              )}
            </div>

            {/* Kịch bản Thuyết minh (Script Editor) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-bold text-[#3D2B1F] uppercase tracking-wider">
                  Kịch bản Thuyết minh (Nghệ nhân có thể tự do chỉnh sửa)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateScript}
                  disabled={isGeneratingScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold text-[#964824] bg-amber-100 hover:bg-amber-200/80 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingScript ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>AI đang soạn kịch bản...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      <span>✨ AI gợi ý kịch bản (Kể chuyện Vũ Nhàn)</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={narrativeScript}
                onChange={(e) => setNarrativeScript(e.target.value)}
                rows={4}
                placeholder="Nhập nội dung bạn muốn nghệ nhân/hướng dẫn viên nói, hoặc bấm 'AI gợi ý kịch bản' để tạo tự động..."
                className="w-full text-xs text-[#3D2B1F] p-3.5 rounded-2xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-[#964824] bg-white leading-relaxed resize-y"
              />

              <div className="flex items-center justify-between text-[11px] text-[#7A6255]">
                <span>Gợi ý độ dài: ~80-120 từ để du khách nghe trọn vẹn trong 45-60 giây.</span>
                <span>{narrativeScript.trim().split(/\s+/).filter(Boolean).length} từ</span>
              </div>
            </div>

            {/* Xuất bản và Nghe thử */}
            <div className="space-y-3 pt-2 border-t border-amber-100">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <label className="block text-xs font-bold text-[#3D2B1F] uppercase tracking-wider">
                  Xuất bản & Nghe thử Audio
                </label>

                <button
                  type="button"
                  onClick={handleSynthesizeFromScript}
                  disabled={isSynthesizingAudio || !narrativeScript.trim()}
                  className="px-4 py-2 bg-[#964824] hover:bg-[#7e3a1b] text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSynthesizingAudio ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang tạo giọng đọc MP3...</span>
                    </>
                  ) : (
                    <>
                      <Volume2 size={14} />
                      <span>🎙️ Tạo file Audio MP3 (Giọng Vũ Nhàn)</span>
                    </>
                  )}
                </button>
              </div>

              {audioGuide?.audioUrl && (
                <div className="mt-3 space-y-2">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <span>File MP3 đã sẵn sàng! Bấm nút bên dưới để nghe thử chất lượng giọng đọc:</span>
                  </div>

                  <AudioGuidePlayer
                    title="Audio Thuyết minh Workshop"
                    narrativeText={audioGuide.narrativeText}
                    audioUrl={audioGuide.audioUrl}
                    compact={false}
                  />
                </div>
              )}
            </div>

            {audioError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {audioError}
              </p>
            )}
          </div>
          <div><label htmlFor="workshop-category" className="block text-sm mb-2">Danh mục</label><select id="workshop-category" name="categoryId" className="w-full border rounded-lg p-3" required defaultValue={typeof workshop?.categoryId === 'object' ? workshop.categoryId._id : workshop?.categoryId || ''}><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></div>
          <Input name="locationLabel" label="Khu vực" placeholder="Hội An, Quảng Nam" defaultValue={workshop?.locationLabel} required />
          <Input name="address" label="Địa chỉ đầy đủ" defaultValue={workshop?.address?.fullAddress} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5"><Input name="lat" label="Vĩ độ" type="number" min={-90} max={90} step="any" defaultValue={workshop?.mapLocation?.lat} required /><Input name="lng" label="Kinh độ" type="number" min={-180} max={180} step="any" defaultValue={workshop?.mapLocation?.lng} required /></div>
          <p className="text-sm text-[#7A6255]">Lấy tọa độ vị trí thực tế từ Google Maps để khách được chỉ đường đúng địa điểm.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5"><Input name="price" label="Giá mỗi khách (VND)" type="number" min={0} step={1} value={Number.isNaN(price) ? '' : price} onChange={(event) => setPrice(event.target.valueAsNumber)} required /><Input name="duration" label="Thời lượng (phút)" type="number" min={1} step={1} defaultValue={workshop?.duration} required /><Input name="maxGuestsPerSlot" label="Số khách tối đa" type="number" min={1} step={1} defaultValue={workshop?.maxGuestsPerSlot || 10} required /></div>
          <p className="text-sm text-[#7A6255]">Đặt giá bằng 0 cho workshop miễn phí. Giá từng khung giờ được quản lý trong phần lịch.</p>
          {price > 0 && <div className="border border-dashed rounded-xl p-4 space-y-4"><label className="flex gap-2 items-center"><input type="checkbox" checked={hasPromotion} onChange={(event) => setHasPromotion(event.target.checked)} /> Thêm mã giảm giá cho workshop</label>{hasPromotion && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Input name="couponCode" label="Mã giảm giá" defaultValue={workshop?.promotion?.code} minLength={3} maxLength={32} pattern={'[A-Za-z0-9_\\-]{3,32}'} placeholder="Ví dụ: CRAFT10" required /><Input name="percentOff" label="Giảm (%)" type="number" min={1} max={99} step={1} defaultValue={workshop?.promotion?.percentOff || 10} required /></div>}</div>}
          <Textarea name="images" label="Ảnh slideshow (mỗi dòng một URL hoặc đường dẫn ảnh)" rows={5} defaultValue={workshop?.images.join('\n')} placeholder="https://.../anh-1.jpg&#10;/images/anh-2.jpg" required />
        </fieldset>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        <div className="flex gap-3 pt-4"><Button type="submit" size="lg" isLoading={saving}>Lưu Workshop</Button><Button type="button" variant="outline" size="lg" disabled={saving} onClick={() => navigate('/host/workshops')}>Hủy</Button></div>
      </form>
    </div>
  );
};

export default WorkshopFormPage;
