import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tourGuideSchema,
  type TourGuideFormData,
} from "../../schemas/tourGuideSchema";
import { tourGuides } from "../../utils/mockData";
import { Plus } from "lucide-react";
import { USER_STATUS_LABELS } from "../../utils/constants";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";

const ManageTourGuidesPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TourGuideFormData>({ resolver: zodResolver(tourGuideSchema) });

  const onSubmit = async (_data: TourGuideFormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setShowModal(false);
    reset();
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
            {tourGuides.map((g) => (
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
            ))}
          </tbody>
        </table>
      </div>
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
