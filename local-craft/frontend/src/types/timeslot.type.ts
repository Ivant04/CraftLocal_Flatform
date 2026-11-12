export type TimeslotStatus = 'AVAILABLE' | 'FULL' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Timeslot {
  _id: string;
  workshopId: string;
  workshopTitle?: string;
  workshopLocation?: string;
  date: string;
  startTime: string;
  endTime: string;
  startTimeLabel?: string;
  endTimeLabel?: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  price?: number;
  status: TimeslotStatus;
  tourGuideId?: string;
  tourGuideName?: string;
  note?: string;
  createdAt: string;
}
