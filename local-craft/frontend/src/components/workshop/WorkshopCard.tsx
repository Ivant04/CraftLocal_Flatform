import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, Sparkles } from 'lucide-react';
import type { Workshop } from '../../types/workshop.type';
import { formatCurrencyShort } from '../../utils/formatCurrency';

interface WorkshopCardProps {
  workshop: Workshop;
  className?: string;
}

export const WorkshopCard: React.FC<WorkshopCardProps> = ({ workshop, className = '' }) => {
  const isHighRated = (workshop.rating ?? 0) >= 4.8;

  // Format clean artisan name without awkward duplicate prefixes
  const artisanName = workshop.hostName 
    ? workshop.hostName.trim()
    : 'Nghệ nhân bản địa';

  return (
    <Link
      to={`/workshops/${workshop._id}`}
      className={`group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#EAD8CC] hover:border-[#964824]/40 hover:shadow-[0_16px_40px_rgba(61,43,31,0.12)] hover:-translate-y-1.5 transition-all duration-300 ${className}`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#FAF7F2]">
        <img
          src={workshop.images?.[0] || '/src/assets/images/pottery-workshop.jpg'}
          alt={workshop.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 opacity-40 group-hover:opacity-70 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <span className="px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-xs font-bold text-[#964824] shadow-sm">
            {workshop.category}
          </span>
          {isHighRated && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#E9C176] text-[#3D2B1F] text-[11px] font-bold rounded-full shadow-sm">
              <Sparkles size={12} className="text-[#964824]" /> Nổi bật
            </span>
          )}
        </div>

        {/* Bottom overlay info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="flex items-center gap-1 backdrop-blur-sm bg-black/40 px-2 py-0.5 rounded-md">
            <MapPin size={12} className="text-[#FFB597]" /> {workshop.location}
          </span>
          <span className="flex items-center gap-1 backdrop-blur-sm bg-black/40 px-2 py-0.5 rounded-md">
            <Clock size={12} className="text-[#FFB597]" /> {workshop.duration} phút
          </span>
        </div>
      </div>

      {/* Content Container with fixed heights for absolute visual uniformity */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Artisan Name - Always 1 single line with truncate and fixed height */}
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-[#7A6255] mb-2 min-w-0 h-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#964824] shrink-0" />
            <span className="text-[#3D2B1F] truncate" title={artisanName}>
              {artisanName}
            </span>
          </div>

          {/* Workshop Title - Fixed 2-line height so cards align perfectly across the grid */}
          <h3 
            className="font-semibold text-base text-[#3D2B1F] line-clamp-2 leading-snug group-hover:text-[#964824] transition-colors mb-3 h-11 flex items-start"
            title={workshop.title}
          >
            {workshop.title}
          </h3>
        </div>

        {/* Pricing & Rating Footer - Always aligned at the exact same horizontal baseline */}
        <div className="pt-3 border-t border-[#EAD8CC]/60 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#7A6255] block -mb-0.5">Giá từ</span>
            <span className="text-[#964824] font-extrabold text-lg tracking-tight">
              {formatCurrencyShort(workshop.price)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EAD8CC]/40">
            <Star size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-bold text-xs text-[#3D2B1F]">{workshop.rating || 5.0}</span>
            <span className="text-[11px] text-[#7A6255]">({workshop.totalReviews || 0})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default WorkshopCard;
