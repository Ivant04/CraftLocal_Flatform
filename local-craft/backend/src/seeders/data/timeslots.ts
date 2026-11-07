import * as ID from "./ids";
const HOSTS = [
  ID.HOST1_ID,
  ID.HOST2_ID,
  ID.HOST3_ID,
  ID.HOST4_ID,
  ID.HOST5_ID,
  ID.HOST6_ID,
];
const GUIDES = [
  ID.GUIDE1_ID,
  ID.GUIDE2_ID,
  ID.GUIDE3_ID,
  ID.GUIDE4_ID,
  ID.GUIDE5_ID,
  ID.GUIDE6_ID,
];
const now = new Date();
const day = (d: number, h: number) => {
  const dt = new Date(now);
  dt.setDate(dt.getDate() + d);
  dt.setHours(h, 0, 0, 0);
  return dt;
};
const endT = (start: Date, dur: number) =>
  new Date(start.getTime() + dur * 60000);

const ts = (
  i: number,
  wsIdx: number,
  hostIdx: number,
  guideIdx: number,
  dayOff: number,
  hour: number,
  total: number,
  price: number,
  dur: number,
  st: string,
  booked: number,
) => ({
  _id: ID.TS[i],
  workshopId: ID.WS[wsIdx],
  hostId: HOSTS[hostIdx],
  tourGuideId: GUIDES[guideIdx],
  startTime: day(dayOff, hour),
  endTime: endT(day(dayOff, hour), dur),
  totalSlots: total,
  bookedSlots: booked,
  availableSlots: total - booked,
  price,
  status: st,
  note: "",
});

export const timeslotsData = [
  // WS0 (host0/guide0) - 3 slots
  ts(0, 0, 0, 0, 1, 8, 12, 350000, 180, "AVAILABLE", 3),
  ts(1, 0, 0, 0, 1, 14, 12, 350000, 180, "AVAILABLE", 0),
  ts(2, 0, 0, 0, 2, 8, 12, 350000, 180, "AVAILABLE", 5),
  // WS1 (host1/guide1) - 3 slots
  ts(3, 1, 1, 1, 1, 9, 8, 450000, 240, "AVAILABLE", 2),
  ts(4, 1, 1, 1, 2, 9, 8, 450000, 240, "AVAILABLE", 0),
  ts(5, 1, 1, 1, 3, 9, 8, 450000, 240, "FULL", 8),
  // WS2 (host2/guide2) - 3 slots
  ts(6, 2, 2, 2, 1, 8, 15, 250000, 120, "AVAILABLE", 6),
  ts(7, 2, 2, 2, 2, 14, 15, 250000, 120, "AVAILABLE", 0),
  ts(8, 2, 2, 2, 3, 8, 15, 250000, 120, "AVAILABLE", 3),
  // WS3 (host3/guide3) - 3 slots
  ts(9, 3, 3, 3, 1, 7, 8, 450000, 240, "AVAILABLE", 4),
  ts(10, 3, 3, 3, 2, 7, 8, 450000, 240, "AVAILABLE", 1),
  ts(11, 3, 3, 3, 4, 7, 8, 450000, 240, "AVAILABLE", 0),
  // WS4 (host4/guide4) - 3 slots
  ts(12, 4, 4, 4, 1, 9, 10, 280000, 150, "AVAILABLE", 2),
  ts(13, 4, 4, 4, 2, 14, 10, 280000, 150, "AVAILABLE", 0),
  ts(14, 4, 4, 4, 3, 9, 10, 280000, 150, "AVAILABLE", 1),
  // WS5 (host5/guide5) - 3 slots
  ts(15, 5, 5, 5, 1, 8, 10, 200000, 150, "AVAILABLE", 3),
  ts(16, 5, 5, 5, 2, 8, 10, 200000, 150, "AVAILABLE", 0),
  ts(17, 5, 5, 5, 3, 14, 10, 200000, 150, "AVAILABLE", 2),
  // WS6-WS9 - 3 each
  ts(18, 6, 2, 2, 1, 9, 10, 320000, 180, "AVAILABLE", 1),
  ts(19, 6, 2, 2, 3, 9, 10, 320000, 180, "AVAILABLE", 0),
  ts(20, 6, 2, 2, 5, 9, 10, 320000, 180, "AVAILABLE", 0),
  ts(21, 7, 0, 0, 2, 8, 8, 380000, 180, "AVAILABLE", 2),
  ts(22, 7, 0, 0, 4, 8, 8, 380000, 180, "AVAILABLE", 0),
  ts(23, 7, 0, 0, 6, 14, 8, 380000, 180, "AVAILABLE", 0),
  ts(24, 8, 1, 1, 1, 10, 10, 500000, 210, "AVAILABLE", 4),
  ts(25, 8, 1, 1, 3, 10, 10, 500000, 210, "AVAILABLE", 0),
  ts(26, 8, 1, 1, 5, 16, 10, 500000, 210, "AVAILABLE", 1),
  ts(27, 9, 4, 4, 2, 8, 12, 400000, 210, "AVAILABLE", 3),
  ts(28, 9, 4, 4, 4, 8, 12, 400000, 210, "AVAILABLE", 0),
  ts(29, 9, 4, 4, 6, 8, 12, 400000, 210, "AVAILABLE", 0),
  // WS10-WS14 - 3 each
  ts(30, 10, 3, 3, 1, 9, 12, 300000, 150, "AVAILABLE", 2),
  ts(31, 10, 3, 3, 3, 14, 12, 300000, 150, "AVAILABLE", 0),
  ts(32, 10, 3, 3, 5, 9, 12, 300000, 150, "AVAILABLE", 0),
  ts(33, 11, 5, 5, 2, 8, 8, 220000, 180, "AVAILABLE", 1),
  ts(34, 11, 5, 5, 4, 8, 8, 220000, 180, "AVAILABLE", 0),
  ts(35, 11, 5, 5, 6, 14, 8, 220000, 180, "AVAILABLE", 0),
  ts(36, 12, 0, 0, 1, 14, 8, 420000, 210, "AVAILABLE", 3),
  ts(37, 12, 0, 0, 3, 14, 8, 420000, 210, "AVAILABLE", 0),
  ts(38, 12, 0, 0, 5, 8, 8, 420000, 210, "AVAILABLE", 0),
  ts(39, 13, 2, 2, 2, 9, 12, 350000, 150, "AVAILABLE", 5),
  ts(40, 13, 2, 2, 4, 9, 12, 350000, 150, "AVAILABLE", 0),
  ts(41, 13, 2, 2, 6, 14, 12, 350000, 150, "AVAILABLE", 0),
  ts(42, 14, 4, 4, 1, 14, 10, 250000, 120, "AVAILABLE", 2),
  ts(43, 14, 4, 4, 3, 14, 10, 250000, 120, "AVAILABLE", 0),
  ts(44, 14, 4, 4, 5, 9, 10, 250000, 120, "AVAILABLE", 0),
  // WS15-WS19 - 3 each
  ts(45, 15, 1, 1, 2, 8, 6, 550000, 300, "AVAILABLE", 1),
  ts(46, 15, 1, 1, 4, 8, 6, 550000, 300, "AVAILABLE", 0),
  ts(47, 15, 1, 1, 6, 8, 6, 550000, 300, "AVAILABLE", 0),
  ts(48, 16, 3, 3, 1, 7, 6, 500000, 300, "AVAILABLE", 2),
  ts(49, 16, 3, 3, 3, 7, 6, 500000, 300, "AVAILABLE", 0),
  ts(50, 16, 3, 3, 5, 7, 6, 500000, 300, "AVAILABLE", 0),
  ts(51, 17, 5, 5, 1, 8, 15, 180000, 120, "AVAILABLE", 4),
  ts(52, 17, 5, 5, 3, 14, 15, 180000, 120, "AVAILABLE", 0),
  ts(53, 17, 5, 5, 5, 8, 15, 180000, 120, "AVAILABLE", 0),
  ts(54, 18, 0, 0, 2, 9, 10, 300000, 150, "AVAILABLE", 2),
  ts(55, 18, 0, 0, 4, 9, 10, 300000, 150, "AVAILABLE", 0),
  ts(56, 18, 0, 0, 6, 14, 10, 300000, 150, "AVAILABLE", 0),
  ts(57, 19, 1, 1, 1, 9, 12, 280000, 180, "AVAILABLE", 3),
  ts(58, 19, 1, 1, 3, 14, 12, 280000, 180, "AVAILABLE", 0),
  ts(59, 19, 1, 1, 5, 9, 12, 280000, 180, "AVAILABLE", 0),
];
