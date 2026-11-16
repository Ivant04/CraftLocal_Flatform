import axiosClient from './axiosClient';
import type {
  WorkshopOwnerApplication,
  ApplyWorkshopOwnerPayload,
  ApplicationListResponse,
} from '../types/application.type';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const applicationApi = {
  // Người dùng lấy hồ sơ của chính mình
  getMyApplication: () =>
    axiosClient.get<
      ApiEnvelope<{
        status: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
        isHost?: boolean;
        application: WorkshopOwnerApplication | null;
      }>
    >('/applications/my-application'),

  // Người dùng nộp hoặc cập nhật hồ sơ
  applyWorkshopOwner: (payload: ApplyWorkshopOwnerPayload) =>
    axiosClient.post<ApiEnvelope<WorkshopOwnerApplication>>('/applications/apply', payload),

  // Admin lấy danh sách hồ sơ
  getAdminApplications: (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) =>
    axiosClient.get<ApiEnvelope<ApplicationListResponse>>('/admin/applications', { params }),

  // Admin xem chi tiết 1 hồ sơ
  getAdminApplicationById: (id: string) =>
    axiosClient.get<ApiEnvelope<WorkshopOwnerApplication>>(`/admin/applications/${id}`),

  // Admin duyệt hồ sơ
  approveApplication: (id: string) =>
    axiosClient.put<ApiEnvelope<WorkshopOwnerApplication>>(`/admin/applications/${id}/approve`),

  // Admin từ chối hồ sơ kèm lý do
  rejectApplication: (id: string, reason: string) =>
    axiosClient.put<ApiEnvelope<WorkshopOwnerApplication>>(`/admin/applications/${id}/reject`, {
      reason,
    }),

  // Upload ảnh giấy tờ hoặc ảnh xưởng
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await axiosClient.post<ApiEnvelope<{ url: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return (res.data as any)?.data?.url || (res.data as any)?.url;
  },
};

export default applicationApi;
