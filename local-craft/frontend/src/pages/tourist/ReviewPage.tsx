import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { bookings } from "../../utils/mockData";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";

const ReviewPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const booking = bookings.find((b) => b._id === bookingId);
  if (!booking)
    return <div className="text-center py-20">Không tìm thấy lịch đặt</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    navigate("/my-bookings");
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-10">
      <h1 className="font-headline-lg text-headline-md text-deep-earth mb-2">
        Viết đánh giá
      </h1>
      <p className="text-on-surface-variant mb-8">{booking.workshopTitle}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium block mb-2">Đánh giá</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="p-1"
              >
                <Star
                  size={28}
                  className={`${n <= rating ? "text-amber-500 fill-amber-500" : "text-outline"} transition-colors`}
                />
              </button>
            ))}
          </div>
        </div>
        <Textarea
          label="Bình luận"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn..."
          rows={4}
        />
        <Button type="submit" fullWidth isLoading={submitting}>
          Gửi đánh giá
        </Button>
      </form>
    </div>
  );
};

export default ReviewPage;
