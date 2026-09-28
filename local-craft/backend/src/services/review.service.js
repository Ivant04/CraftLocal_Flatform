const Review = require('../models/Review');
const Artisan = require('../models/Artisan');
const ApiError = require('../utils/apiError');

class ReviewService {
  async createReview(userId, { targetType, targetId, rating, comment, images }) {
    if (!['WORKSHOP', 'PRODUCT', 'ARTISAN'].includes(targetType)) {
      throw new ApiError(400, 'Invalid targetType. Must be WORKSHOP, PRODUCT, or ARTISAN');
    }

    const review = await Review.create({
      customer: userId,
      targetType,
      targetId,
      rating,
      comment,
      images: images || [],
      status: 'APPROVED'
    });

    // If review target is an ARTISAN, recalculate artisan rating
    if (targetType === 'ARTISAN') {
      const allReviews = await Review.find({ targetType: 'ARTISAN', targetId, status: 'APPROVED' });
      const avg = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / (allReviews.length || 1);
      await Artisan.findByIdAndUpdate(targetId, {
        rating: Math.round(avg * 10) / 10,
        totalReviews: allReviews.length
      });
    }

    return review;
  }

  async getReviewsForTarget(targetType, targetId) {
    return await Review.find({ targetType, targetId, status: 'APPROVED' })
      .populate('customer', 'name avatar')
      .sort({ createdAt: -1 });
  }

  async getUserReviews(userId) {
    return await Review.find({ customer: userId })
      .sort({ createdAt: -1 });
  }

  async getAllReviews(query = {}) {
    const filter = {};
    if (query.targetType) filter.targetType = query.targetType;
    if (query.status) filter.status = query.status;

    return await Review.find(filter)
      .populate('customer', 'name email avatar')
      .sort({ createdAt: -1 });
  }

  async updateReviewStatus(id, status) {
    const review = await Review.findByIdAndUpdate(id, { status }, { new: true });
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    return review;
  }
}

module.exports = new ReviewService();
