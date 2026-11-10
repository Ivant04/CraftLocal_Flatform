import axiosClient from './axiosClient';
import type { ReviewPayload } from '../types/review.type';

const reviewApi = {
  create: (data: ReviewPayload) => axiosClient.post('/reviews', data),
  getByWorkshop: (workshopId: string) => axiosClient.get(`/reviews/workshop/${workshopId}`),
  getMyReviews: () => axiosClient.get('/reviews/mine'),
};

export default reviewApi;
