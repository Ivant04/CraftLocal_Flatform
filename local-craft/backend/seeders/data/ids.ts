import mongoose from "mongoose";
const O = (hex: string) => new mongoose.Types.ObjectId(hex);

// Users
export const ADMIN_ID = O("650000000000000000000001");
export const HOST1_ID = O("650000000000000000000101");
export const HOST2_ID = O("650000000000000000000102");
export const HOST3_ID = O("650000000000000000000103");
export const HOST4_ID = O("650000000000000000000104");
export const HOST5_ID = O("650000000000000000000105");
export const HOST6_ID = O("650000000000000000000106");
export const GUIDE1_ID = O("650000000000000000000201");
export const GUIDE2_ID = O("650000000000000000000202");
export const GUIDE3_ID = O("650000000000000000000203");
export const GUIDE4_ID = O("650000000000000000000204");
export const GUIDE5_ID = O("650000000000000000000205");
export const GUIDE6_ID = O("650000000000000000000206");
export const TOURIST1_ID = O("650000000000000000000301");
export const TOURIST2_ID = O("650000000000000000000302");
export const TOURIST3_ID = O("650000000000000000000303");
export const TOURIST4_ID = O("650000000000000000000304");
export const TOURIST5_ID = O("650000000000000000000305");
export const TOURIST6_ID = O("650000000000000000000306");
export const TOURIST7_ID = O("650000000000000000000307");
export const TOURIST8_ID = O("650000000000000000000308");
export const TOURIST9_ID = O("650000000000000000000309");
export const TOURIST10_ID = O("650000000000000000000310");

// Categories
export const CAT1_ID = O("660000000000000000000001");
export const CAT2_ID = O("660000000000000000000002");
export const CAT3_ID = O("660000000000000000000003");
export const CAT4_ID = O("660000000000000000000004");
export const CAT5_ID = O("660000000000000000000005");
export const CAT6_ID = O("660000000000000000000006");
export const CAT7_ID = O("660000000000000000000007");
export const CAT8_ID = O("660000000000000000000008");

// Workshops WS1..WS20
export const WS = Array.from({ length: 20 }, (_, i) =>
  O(`67000000000000000000${String(i + 1).padStart(4, "0")}`),
);

// Products P1..P30
export const PR = Array.from({ length: 30 }, (_, i) =>
  O(`68000000000000000000${String(i + 1).padStart(4, "0")}`),
);

// Timeslots TS1..TS60
export const TS = Array.from({ length: 60 }, (_, i) =>
  O(`69000000000000000000${String(i + 1).padStart(4, "0")}`),
);

// Bookings BK1..BK30
export const BK = Array.from({ length: 30 }, (_, i) =>
  O(`70000000000000000000${String(i + 1).padStart(4, "0")}`),
);

// Tickets TK1..TK25
export const TK = Array.from({ length: 25 }, (_, i) =>
  O(`71000000000000000000${String(i + 1).padStart(4, "0")}`),
);

// Orders OR1..OR20
export const OR = Array.from({ length: 20 }, (_, i) =>
  O(`72000000000000000000${String(i + 1).padStart(4, "0")}`),
);

// Payments PA1..PA40
export const PA = Array.from({ length: 40 }, (_, i) =>
  O(`73000000000000000000${String(i + 1).padStart(4, "0")}`),
);
