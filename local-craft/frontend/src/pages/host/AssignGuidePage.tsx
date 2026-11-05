import React, { useState } from "react";
import { timeslots, tourGuides } from "../../utils/mockData";
import { formatTime } from "../../utils/formatDate";
import Button from "../../components/common/Button";

const AssignGuidePage: React.FC = () => {
  const [selectedTimeslot, setSelectedTimeslot] = useState("");
  const [selectedGuide, setSelectedGuide] = useState("");
  const unassigned = timeslots.filter((ts) => !ts.tourGuideId);
  const assigned = timeslots.filter((ts) => ts.tourGuideId);

  return (
    <div className="space-y-8">
      <h1 className="font-headline-lg text-headline-md text-deep-earth">
        Gán Hướng dẫn viên
      </h1>
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
          <Button disabled={!selectedTimeslot || !selectedGuide}>Gán</Button>
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
              {assigned.map((ts) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AssignGuidePage;
