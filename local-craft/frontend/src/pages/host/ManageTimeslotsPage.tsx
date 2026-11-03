import React from 'react';
import { timeslots } from '../../utils/mockData';
import { formatTime } from '../../utils/formatDate';
import { TIMESLOT_STATUS_LABELS } from '../../utils/constants';

const ManageTimeslotsPage: React.FC = () => (
  <div className="space-y-6">
    <h1 className="font-headline-lg text-headline-md text-deep-earth">Quản lý khung giờ</h1>
    <div className="bg-white rounded-xl border border-soft-clay overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b border-soft-clay bg-soft-clay/30">
          <th className="p-4 text-left font-medium">Workshop</th>
          <th className="p-4 text-left font-medium">Ngày</th>
          <th className="p-4 text-left font-medium">Giờ</th>
          <th className="p-4 text-left font-medium">Số chỗ</th>
          <th className="p-4 text-left font-medium">Hướng dẫn viên</th>
          <th className="p-4 text-left font-medium">Trạng thái</th>
        </tr></thead>
        <tbody>
          {timeslots.map((ts) => (
            <tr key={ts._id} className="border-b border-soft-clay/50">
              <td className="p-4 font-medium">{ts.workshopTitle}</td>
              <td className="p-4">{ts.date}</td>
              <td className="p-4">{formatTime(ts.startTime)} - {formatTime(ts.endTime)}</td>
              <td className="p-4">{ts.bookedSlots}/{ts.totalSlots}</td>
              <td className="p-4">{ts.tourGuideName || <span className="text-amber-600 text-xs">Chưa gán</span>}</td>
              <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${ts.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : ts.status === 'FULL' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{TIMESLOT_STATUS_LABELS[ts.status] || ts.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default ManageTimeslotsPage;
