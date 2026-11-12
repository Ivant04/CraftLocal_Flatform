import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { DEFAULT_CRAFT_IMAGE, resolveImageUrl } from '../../utils/normalizers';

export default function WorkshopGallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (images.length < 2 || paused || hovered || focused || reducedMotion) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % images.length), 5000);
    return () => window.clearInterval(timer);
  }, [images.length, paused, hovered, focused, reducedMotion]);

  const current = index % (images.length || 1);
  return (
    <section className="ws-gallery" aria-label={`Hình ảnh ${title}`} aria-roledescription="trình chiếu"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (images.length < 2) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          setIndex((current + (event.key === 'ArrowLeft' ? images.length - 1 : 1)) % images.length);
        }
      }}>
      {images.length ? images.map((src, i) => (
        <img key={`${src}-${i}`} src={resolveImageUrl(src)} alt={`${title} — ảnh ${i + 1}`} aria-hidden={i !== current}
          className={`ws-slide ${i === current ? 'is-active' : ''}`} loading={i === 0 ? 'eager' : 'lazy'}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_CRAFT_IMAGE; }} />
      )) : <div className="ws-no-images">Chưa có hình ảnh workshop</div>}
      {images.length > 1 && <>
        <button type="button" className="ws-gallery-arrow ws-prev" aria-label="Ảnh trước" onClick={() => setIndex((current + images.length - 1) % images.length)}><ChevronLeft /></button>
        <button type="button" className="ws-gallery-arrow ws-next" aria-label="Ảnh tiếp theo" onClick={() => setIndex((current + 1) % images.length)}><ChevronRight /></button>
        <div className="ws-gallery-controls">
          <span>{current + 1} / {images.length}</span>
          <div className="ws-dots">{images.map((_, i) => <button key={i} type="button" aria-label={`Xem ảnh ${i + 1}`} aria-pressed={i === current} onClick={() => setIndex(i)} />)}</div>
          {!reducedMotion && <button type="button" aria-label={paused ? 'Chạy slideshow' : 'Tạm dừng slideshow'} onClick={() => setPaused(!paused)}>{paused ? <Play size={16} /> : <Pause size={16} />}</button>}
        </div>
      </>}
    </section>
  );
}
