import React, { useEffect, useState } from "react";
import timeslotApi from "../../api/timeslotApi";
import tourGuideApi from "../../api/tourGuideApi";
import { normalizeTimeslot } from "../../utils/normalizers";
import type { Timeslot } from "../../types/timeslot.type";
import type { User } from "../../types/user.type";
import { formatTime } from "../../utils/formatDate";
import Button from "../../components/common/Button";
import Loading from "../../components/common/Loading";

const AssignGuidePage: React.FC = () => {
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);
  const [tourGuides, setTourGuides] = useState<User[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState("");
  const [selectedGuide, setSelectedGuide] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([timeslotApi.getByHost(), tourGuideApi.getByHost()])
      .then(([tsRes, tgRes]) => {
        if (!active) return;
        const tsList = tsRes.data?.data;
        const tgList = tgRes.data?.data;
        setTimeslots(Array.isArray(tsList) ? tsList.map(normalizeTimeslot) : []);
        setTourGuides(Array.isArray(tgList) ? tgList : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || "Không tải được dữ liệu phân công.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleAssign = async () => {
    if (!selectedTimeslot || !selectedGuide || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await tourGuideApi.assignToTimeslot({
        timeslotId: selectedTimeslot,
        tourGuideId: selectedGuide,
      });
      const updated = normalizeTimeslot(res.data?.data);
      setTimeslots((prev) => prev.map((ts) => (ts._id === updated._id ? updated : ts)));
      setSelectedTimeslot("");
      setSelectedGuide("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Gán hướng dẫn viên thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-16 flex justify-center"><Loading /></div>;

  const unassigned = timeslots.filter((ts) => !ts.tourGuideId && ts.status !== "CANCELLED" && ts.status !== "COMPLETED");
  const assigned = timeslots.filter((ts) => Boolean(ts.tourGuideId));

  return (
    <div className="space-y-8">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">
        Gán Hướng dẫn viên
      </h1>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
      )}
      <div className="bg-white rounded-xl border border-soft-clay p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Gán HĐV cho khung giờ</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Khung giờ
            </label>
            <select
              value={selectedTimeslot}
              onChange={(e) => setSelectedTimeslot(e.target.value)}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg"
            >
              <option value="">Chọn khung giờ</option>
              {unassigned.map((ts) => (
                <option key={ts._id} value={ts._id}>
                  {ts.workshopTitle} - {ts.date} {formatTime(ts.startTime)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">
              Hướng dẫn viên
            </label>
            <select
              value={selectedGuide}
              onChange={(e) => setSelectedGuide(e.target.value)}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg"
            >
              <option value="">Chọn hướng dẫn viên</option>
              {tourGuides.map((g) => (
                <option key={g._id} value={g._id}>
                  {g.fullName}
                </option>
              ))}
            </select>
          </div>
          <Button disabled={!selectedTimeslot || !selectedGuide} isLoading={submitting} onClick={handleAssign}>
            Gán
          </Button>
        </div>
      </div>
      <div>
        <h2 className="font-semibold text-lg text-deep-earth mb-4">
          Đã phân công
        </h2>
        <div className="bg-white rounded-xl border border-soft-clay overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-soft-clay bg-soft-clay/30">
                <th className="p-4 text-left font-medium">Workshop</th>
                <th className="p-4 text-left font-medium">Ngày</th>
                <th className="p-4 text-left font-medium">Giờ</th>
                <th className="p-4 text-left font-medium">HĐV</th>
              </tr>
            </thead>
            <tbody>
              {assigned.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-on-surface-variant">Chưa có khung giờ nào được gán HDV.</td></tr>
              ) : (
                assigned.map((ts) => (
                  <tr key={ts._id} className="border-b border-soft-clay/50">
                    <td className="p-4">{ts.workshopTitle}</td>
                    <td className="p-4">{ts.date}</td>
                    <td className="p-4">
                      {formatTime(ts.startTime)} - {formatTime(ts.endTime)}
                    </td>
                    <td className="p-4 font-medium text-primary">
                      {ts.tourGuideName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignGuidePage;
