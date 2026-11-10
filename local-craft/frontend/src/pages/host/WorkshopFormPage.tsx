import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import workshopApi from '../../api/workshopApi';
import axiosClient from '../../api/axiosClient';
import type { WorkshopDetail } from '../../types/workshopDetail.type';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';

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
      }).catch(() => { if (active) setLoadError('Không tải được thông tin workshop.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt]);

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
