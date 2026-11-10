import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: number;
  showText?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  totalReviews,
  size = 14,
  showText = true,
  className = '',
}) => {
  const roundedRating = Number(rating || 0).toFixed(1);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-stone-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-bold text-[#3D2B1F]">
          {roundedRating}
          {totalReviews !== undefined && (
            <span className="font-normal text-[#7A6255] ml-1">({totalReviews})</span>
          )}
        </span>
      )}
    </div>
  );
};

export default RatingStars;

