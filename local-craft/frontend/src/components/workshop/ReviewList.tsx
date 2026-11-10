import React from 'react';
import { Star } from 'lucide-react';
import type { Review } from '../../types/review.type';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => (
  <div className="space-y-4">
    {reviews.map((r) => (
      <div key={r._id} className="p-5 bg-white rounded-xl border border-soft-clay">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-soft-clay flex items-center justify-center font-semibold text-primary">
            {r.touristName[0]}
          </div>
          <div>
            <p className="font-medium text-on-surface">{r.touristName}</p>
            <div className="flex items-center gap-1">
              {[...Array(r.rating)].map((_, i) => (
                <Star key={i} size={12} className="text-amber-500 fill-amber-500" />
              ))}
            </div>
          </div>
        </div>
        <p className="text-on-surface-variant text-sm">{r.comment}</p>
      </div>
    ))}
  </div>
);

export default ReviewList;
