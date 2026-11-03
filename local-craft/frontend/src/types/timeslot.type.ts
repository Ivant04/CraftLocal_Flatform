export type TimeslotStatus = 'AVAILABLE' | 'FULL' | 'CANCELLED';

export interface Timeslot {
  _id: string;
  workshopId: string;
  workshopTitle?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  status: TimeslotStatus;
  tourGuideId?: string;
  tourGuideName?: string;
  createdAt: string;
}
