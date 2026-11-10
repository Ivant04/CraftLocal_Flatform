import React from 'react';
import { Navigation } from 'lucide-react';
import { workshopLocation } from '../../utils/workshopLocation';

export default function WorkshopMap({ title, address, coordinates }: { title: string; address: string; coordinates?: { lat: number; lng: number } }) {
  const { embedUrl, directionsUrl } = workshopLocation(address, coordinates);
  return (
    <section className="ws-panel" aria-labelledby="ws-location-title">
      <div className="ws-section-heading"><h2 id="ws-location-title">Địa điểm workshop</h2>
        {directionsUrl && <a className="ws-directions" href={directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={16} /> Chỉ đường</a>}
      </div>
      <p>{address || 'Chưa cập nhật địa chỉ'}</p>
      {embedUrl ? <iframe className="ws-map" title={`Bản đồ đến ${title}`} src={embedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /> : <p>Chưa có vị trí bản đồ.</p>}
      {directionsUrl && <p className="ws-muted">Nếu bản đồ không tải được, chọn “Chỉ đường” để mở Google Maps.</p>}
    </section>
  );
}
