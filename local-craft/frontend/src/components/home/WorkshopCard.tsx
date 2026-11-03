import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin } from 'lucide-react';
import type { Workshop } from '../../types/workshop.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';

interface WorkshopCardProps {
  workshop: Workshop;
}

const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop }) => (
  <Link to={`/workshops/${workshop._id}`} className="group bg-white rounded-2xl overflow-hidden border border-[#EAD8CC] hover:shadow-[0_16px_48px_rgba(61,43,31,0.12)] hover:-translate-y-1 transition-all duration-300">
    <div className="relative h-56 overflow-hidden">
      <img src={workshop.images[0] || '/src/assets/images/pottery-workshop.jpg'} alt={workshop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-3 left-3">
        <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-[#964824] shadow-sm">{workshop.category}</span>
      </div>
      {(workshop.rating ?? 0) >= 4.5 && (
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-sm">⭐ Nổi bật</span>
        </div>
      )}
    </div>
    <div className="p-5">
      <h3 className="font-semibold text-[#3D2B1F] mb-2.5 line-clamp-2 group-hover:text-[#964824] transition-colors leading-snug">{workshop.title}</h3>
      <div className="flex items-center gap-4 text-sm text-[#7A6255] mb-4">
        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#964824]" /> {workshop.location}</span>
        <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#964824]" /> {workshop.duration} phút</span>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-[#EAD8CC]/60">
        <span className="text-[#964824] font-bold text-lg">{formatCurrencyShort(workshop.price)}</span>
        <div className="flex items-center gap-1.5 text-sm">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="font-semibold text-[#3D2B1F]">{workshop.rating}</span>
          <span className="text-[#7A6255]">({workshop.totalReviews})</span>
        </div>
      </div>
      {workshop.hostName && <p className="text-xs text-[#7A6255] mt-3">Tổ chức bởi <span className="font-medium text-[#964824]">{workshop.hostName}</span></p>}
    </div>
  </Link>
);

export default WorkshopCard;
