const reviewService = require('../services/review.service');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

class ReviewController {
  createReview = asyncHandler(async (req, res) => {
    const review = await reviewService.createReview(req.user._id, req.body);
    return ApiResponse.success(res, 201, 'Review submitted successfully', review);
  });

  getReviews = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.query;
    if (targetType && targetId) {
      const reviews = await reviewService.getReviewsForTarget(targetType, targetId);
      return ApiResponse.success(res, 200, 'Target reviews retrieved successfully', reviews);
    }
    const reviews = await reviewService.getAllReviews(req.query);
    return ApiResponse.success(res, 200, 'Reviews retrieved successfully', reviews);
  });

  getMyReviews = asyncHandler(async (req, res) => {
    const reviews = await reviewService.getUserReviews(req.user._id);
    return ApiResponse.success(res, 200, 'My reviews retrieved successfully', reviews);
  });

  updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const review = await reviewService.updateReviewStatus(req.params.id, status);
    return ApiResponse.success(res, 200, 'Review status updated successfully', review);
  });
}

module.exports = new ReviewController();
