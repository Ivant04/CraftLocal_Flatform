import React from 'react';
import type { Timeslot } from '../../types/timeslot.type';
import { formatTime } from '../../utils/formatDate';

interface TimeslotPickerProps {
  timeslots: Timeslot[];
  selected: string;
  onSelect: (id: string) => void;
}

const TimeslotPicker: React.FC<TimeslotPickerProps> = ({ timeslots, selected, onSelect }) => (
  <div className="space-y-2">
    {timeslots.map((ts) => (
      <button
        key={ts._id}
        onClick={() => ts.status !== 'FULL' && onSelect(ts._id)}
        disabled={ts.status === 'FULL'}
        className={`w-full p-3 rounded-xl border text-left transition-all text-sm ${
          selected === ts._id
            ? 'border-primary bg-primary/5 text-primary'
            : ts.status === 'FULL'
            ? 'border-outline-variant bg-gray-50 text-gray-400 cursor-not-allowed'
            : 'border-outline-variant hover:border-primary/30'
        }`}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{ts.date}</p>
            <p className="text-xs opacity-70">{formatTime(ts.startTime)} - {formatTime(ts.endTime)}</p>
          </div>
          <span className={`text-xs font-semibold ${ts.status === 'FULL' ? 'text-red-500' : 'text-green-600'}`}>
            {ts.status === 'FULL' ? 'Full' : `${ts.availableSlots} left`}
          </span>
        </div>
      </button>
    ))}
  </div>
);

export default TimeslotPicker;
