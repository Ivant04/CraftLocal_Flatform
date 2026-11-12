import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tourGuideSchema,
  type TourGuideFormData,
} from "../../schemas/tourGuideSchema";
import tourGuideApi from "../../api/tourGuideApi";
import type { User } from "../../types/user.type";
import { Plus } from "lucide-react";
import { USER_STATUS_LABELS } from "../../utils/constants";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loading from "../../components/common/Loading";

const ManageTourGuidesPage: React.FC = () => {
  const [tourGuides, setTourGuides] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TourGuideFormData>({ resolver: zodResolver(tourGuideSchema) });

  useEffect(() => {
    let active = true;
    setLoading(true);
    tourGuideApi
      .getByHost()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setTourGuides(Array.isArray(list) ? list : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Không tải được danh sách hướng dẫn viên.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (data: TourGuideFormData) => {
    setError("");
    try {
      const res = await tourGuideApi.create(data);
      const created = res.data?.data;
      if (created) setTourGuides((prev) => [created, ...prev]);
      setShowModal(false);
      reset();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Không thể tạo hướng dẫn viên.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-md text-deep-earth">
          Quản lý Hướng dẫn viên
        </h1>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus size={16} className="mr-1" /> Thêm HĐV
        </Button>
      </div>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      {loading ? (
        <div className="py-16 flex justify-center"><Loading /></div>
      ) : (
        <div className="bg-white rounded-xl border border-soft-clay overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-clay bg-soft-clay/30">
                <th className="p-4 text-left font-medium">Tên</th>
                <th className="p-4 text-left font-medium">Email</th>
                <th className="p-4 text-left font-medium">SĐT</th>
                <th className="p-4 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {tourGuides.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">Chưa có hướng dẫn viên nào.</td></tr>
              ) : (
                tourGuides.map((g) => (
                  <tr key={g._id} className="border-b border-soft-clay/50">
                    <td className="p-4 font-medium">{g.fullName}</td>
                    <td className="p-4">{g.email}</td>
                    <td className="p-4">{g.phone}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        {USER_STATUS_LABELS[g.status] || g.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tạo Hướng dẫn viên"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Họ và tên"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="SĐT"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Mật khẩu"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Tạo Hướng dẫn viên
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default ManageTourGuidesPage;
