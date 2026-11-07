import * as ID from "./ids";
const TOURISTS = [
  ID.TOURIST1_ID,
  ID.TOURIST2_ID,
  ID.TOURIST3_ID,
  ID.TOURIST4_ID,
  ID.TOURIST5_ID,
  ID.TOURIST6_ID,
  ID.TOURIST7_ID,
  ID.TOURIST8_ID,
  ID.TOURIST9_ID,
  ID.TOURIST10_ID,
];
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
const d = (n: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - n);
  return dt;
};

// ====== PAYMENTS (booking payments + order payments) ======
export const paymentsData = Array.from({ length: 40 }, (_, i) => ({
  _id: ID.PA[i],
  paymentCode: `PAY2026060${String(i + 1).padStart(4, "0")}`,
  userId: TOURISTS[i % 10],
  bookingId: i < 30 ? ID.BK[i] : undefined,
  orderId: i >= 20 && i < 40 ? ID.OR[i - 20] : undefined,
  amount:
    [
      350000, 450000, 250000, 450000, 280000, 200000, 320000, 380000, 500000,
      400000,
    ][i % 10] *
    (1 + (i % 3)),
  method: (["VNPAY", "MOMO", "CASH"] as const)[i % 3],
  paymentStatus:
    i < 25 ? "SUCCESS" : i < 30 ? "PENDING" : i < 35 ? "SUCCESS" : "PENDING",
  transactionCode:
    i < 25 || (i >= 30 && i < 35)
      ? `TXN${String(i + 1).padStart(8, "0")}`
      : undefined,
  paymentUrl: `/mock-payment/PAY2026060${String(i + 1).padStart(4, "0")}`,
  paidAt: i < 25 || (i >= 30 && i < 35) ? d(30 - i) : undefined,
}));

// ====== BOOKINGS ======
const bkStatuses: string[] = [];
for (let i = 0; i < 30; i++) {
  if (i < 8) bkStatuses.push("COMPLETED");
  else if (i < 15) bkStatuses.push("CHECKED_IN");
  else if (i < 22) bkStatuses.push("PAID");
  else if (i < 27) bkStatuses.push("PENDING");
  else bkStatuses.push("CANCELLED");
}

export const bookingsData = Array.from({ length: 30 }, (_, i) => {
  const wsIdx = i % 20,
    hostIdx = [0, 1, 2, 3, 4, 5, 2, 0, 1, 4, 3, 5, 0, 2, 4, 1, 3, 5, 0, 1][
      wsIdx
    ];
  const qty = 1 + (i % 3);
  const price = [
    350000, 450000, 250000, 450000, 280000, 200000, 320000, 380000, 500000,
    400000, 300000, 220000, 420000, 350000, 250000, 550000, 500000, 180000,
    300000, 280000,
  ][wsIdx];
  return {
    _id: ID.BK[i],
    bookingCode: `BK2026060${String(i + 1).padStart(4, "0")}`,
    touristId: TOURISTS[i % 10],
    workshopId: ID.WS[wsIdx],
    timeslotId: ID.TS[wsIdx * 3],
    hostId: HOSTS[hostIdx],
    quantity: qty,
    unitPrice: price,
    totalPrice: price * qty,
    bookingStatus: bkStatuses[i],
    paymentId: i < 25 ? ID.PA[i] : undefined,
    ticketId: i < 25 ? ID.TK[i] : undefined,
    customerInfo: {
      fullName: [
        "Nguyễn Minh Anh",
        "Trần Hoàng Nam",
        "Lê Thu Hà",
        "Phạm Đức Thịnh",
        "Hoàng Thị Trang",
        "Võ Quốc Huy",
        "Đặng Ngọc Linh",
        "Bùi Văn Khải",
        "Mai Phương Thảo",
        "Lý Thanh Tùng",
      ][i % 10],
      email: `tourist${(i % 10) + 1}@gmail.com`,
      phone: `090100000${(i % 10) + 1}`,
    },
    checkedInAt: i < 15 ? d(20 - i) : undefined,
    checkedInBy: i < 15 ? GUIDES[hostIdx] : undefined,
    refundStatus: i >= 27 ? "NONE" : "NONE",
    cancelReason: i >= 27 ? "Thay đổi kế hoạch" : undefined,
    cancelledAt: i >= 27 ? d(5) : undefined,
  };
});

// ====== TICKETS ======
export const ticketsData = Array.from({ length: 25 }, (_, i) => ({
  _id: ID.TK[i],
  bookingId: ID.BK[i],
  touristId: TOURISTS[i % 10],
  workshopId: ID.WS[i % 20],
  timeslotId: ID.TS[(i % 20) * 3],
  qrToken: `QR-BK2026060${String(i + 1).padStart(4, "0")}-${String(Math.random()).slice(2, 8)}`,
  qrCodeImage: `/images/qr/qr-bk2026060${String(i + 1).padStart(4, "0")}.png`,
  status: i < 8 ? "USED" : i < 15 ? "USED" : "UNUSED",
  usedAt: i < 15 ? d(20 - i) : undefined,
  checkedBy: i < 15 ? GUIDES[i % 6] : undefined,
}));

// ====== ORDERS ======
const shippingAddrs = [
  {
    fullName: "Nguyễn Minh Anh",
    phone: "0905123456",
    addressLine: "120 Nguyễn Văn Linh",
    ward: "Phường Nam Dương",
    district: "Quận Hải Châu",
    city: "Đà Nẵng",
    province: "Đà Nẵng",
    country: "Việt Nam",
    fullAddress: "120 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng",
    note: "Giao giờ hành chính",
  },
  {
    fullName: "Trần Hoàng Nam",
    phone: "0912345678",
    addressLine: "58 Lê Đình Lý",
    ward: "Phường Vĩnh Trung",
    district: "Quận Thanh Khê",
    city: "Đà Nẵng",
    province: "Đà Nẵng",
    country: "Việt Nam",
    fullAddress: "58 Lê Đình Lý, Vĩnh Trung, Thanh Khê, Đà Nẵng",
    note: "Gọi trước khi giao",
  },
  {
    fullName: "Lê Thu Hà",
    phone: "0987654321",
    addressLine: "22 Trần Hưng Đạo",
    ward: "Phường An Hải Tây",
    district: "Quận Sơn Trà",
    city: "Đà Nẵng",
    province: "Đà Nẵng",
    country: "Việt Nam",
    fullAddress: "22 Trần Hưng Đạo, An Hải Tây, Sơn Trà, Đà Nẵng",
    note: "Giao buổi chiều",
  },
  {
    fullName: "Phạm Đức Thịnh",
    phone: "0901000004",
    addressLine: "15 Lê Văn Hiến",
    ward: "Phường Khuê Mỹ",
    district: "Quận Ngũ Hành Sơn",
    city: "Đà Nẵng",
    province: "Đà Nẵng",
    country: "Việt Nam",
    fullAddress: "15 Lê Văn Hiến, Khuê Mỹ, Ngũ Hành Sơn, Đà Nẵng",
    note: "",
  },
  {
    fullName: "Hoàng Thị Trang",
    phone: "0901000005",
    addressLine: "88 Phan Châu Trinh",
    ward: "Phường Minh An",
    district: "Thành phố Hội An",
    city: "Hội An",
    province: "Quảng Nam",
    country: "Việt Nam",
    fullAddress: "88 Phan Châu Trinh, Minh An, Hội An, Quảng Nam",
    note: "Giao tại khách sạn",
  },
];
const ordStatuses = [
  "COMPLETED",
  "COMPLETED",
  "SHIPPING",
  "SHIPPING",
  "CONFIRMED",
  "CONFIRMED",
  "CONFIRMED",
  "PACKING",
  "PACKING",
  "PENDING",
  "PENDING",
  "PENDING",
  "PENDING",
  "PENDING",
  "CANCELLED",
  "CANCELLED",
  "COMPLETED",
  "SHIPPING",
  "CONFIRMED",
  "PENDING",
];

export const ordersData = Array.from({ length: 20 }, (_, i) => {
  const prodIdx = i % 30;
  const price = [
    1200000, 1850000, 320000, 280000, 450000, 2500000, 680000, 550000, 120000,
    380000, 150000, 420000, 750000, 850000, 250000, 180000, 95000, 120000,
    65000, 3200000, 85000, 55000, 350000, 450000, 135000, 280000, 75000, 280000,
    195000, 120000,
  ][prodIdx];
  const qty = 1 + (i % 2);
  const sub = price * qty;
  return {
    _id: ID.OR[i],
    orderCode: `ORD2026060${String(i + 1).padStart(4, "0")}`,
    touristId: TOURISTS[i % 10],
    hostId:
      HOSTS[
        prodIdx < 10
          ? [0, 1, 2, 5, 2, 0, 0, 0, 0, 5][prodIdx]
          : [5, 5, 1, 0, 4, 4, 2, 2, 5, 1][prodIdx - 10]
      ],
    items: [
      {
        productId: ID.PR[prodIdx],
        name: `Sản phẩm ${prodIdx + 1}`,
        image: `/images/product-thumb-${prodIdx + 1}.jpg`,
        price,
        quantity: qty,
        subtotal: sub,
      },
    ],
    shippingAddress: shippingAddrs[i % 5],
    productTotal: sub,
    shippingFee: 30000,
    discountAmount: 0,
    totalAmount: sub + 30000,
    orderStatus: ordStatuses[i],
    paymentId: i < 15 ? ID.PA[20 + i] : undefined,
    confirmedAt: i < 9 ? d(15 - i) : undefined,
    shippedAt: i < 4 ? d(10 - i) : undefined,
    completedAt: i < 2 ? d(5 - i) : undefined,
    cancelledAt: i >= 14 && i < 16 ? d(3) : undefined,
  };
});

// ====== REVIEWS ======
const comments = [
  "Trải nghiệm tuyệt vời! Nghệ nhân rất tận tình hướng dẫn, mình đã tự tay làm được sản phẩm rất đẹp.",
  "Rất thú vị và bổ ích. Cả gia đình đều rất thích, sẽ quay lại lần sau.",
  "Workshop rất chuyên nghiệp, hướng dẫn viên nhiệt tình. Đáng đồng tiền bát gạo!",
  "Mình rất hài lòng với trải nghiệm này. Không gian đẹp, nghệ nhân giỏi.",
  "Tuyệt vời! Đây là hoạt động đáng nhớ nhất trong chuyến du lịch của mình.",
  "Rất hay và ý nghĩa. Được tìm hiểu văn hóa truyền thống một cách sinh động.",
  "Workshop tổ chức khá tốt, nhưng thời gian hơi ngắn. Cần thêm thời gian để hoàn thiện sản phẩm.",
  "Nghệ nhân dạy rất dễ hiểu, phù hợp với cả người mới bắt đầu. Highly recommend!",
  "Trải nghiệm 5 sao! Sản phẩm mang về rất đẹp, bạn bè ai cũng khen.",
  "Đáng tiền! Mình học được nhiều kỹ năng mới và hiểu thêm về nghề thủ công truyền thống.",
  "Rất vui và thú vị, hướng dẫn viên nói tiếng Anh tốt nên bạn nước ngoài trong nhóm cũng hiểu.",
  "Không gian xưởng rất đẹp, phù hợp chụp ảnh. Sản phẩm làm ra rất ưng ý.",
  "Mình đã book cho cả nhóm 8 người, ai cũng hài lòng. Giá cả hợp lý.",
  "Trải nghiệm tốt nhưng chỗ để xe hơi bất tiện. Nên cải thiện thêm.",
  "Cô giáo rất kiên nhẫn, dạy từng bước một. Mình không có năng khiếu nhưng vẫn làm được!",
  "Workshop rất hay, nhưng hơi đông. Nên giới hạn ít người hơn để được hướng dẫn kỹ hơn.",
  "Quá tuyệt! Đây chính là trải nghiệm mà mọi du khách nên thử khi đến Hội An.",
  "Nghệ nhân 3 đời, kỹ thuật siêu đỉnh. Được nghe kể về lịch sử nghề rất hay.",
  "Rất đáng trải nghiệm. Giá hơi cao nhưng chất lượng xứng đáng.",
  "Mình sẽ quay lại! Lần sau muốn thử workshop nâng cao hơn.",
];

export const reviewsData = Array.from({ length: 20 }, (_, i) => ({
  touristId: TOURISTS[i % 10],
  hostId: HOSTS[i % 6],
  workshopId: ID.WS[i % 20],
  bookingId: ID.BK[i], // chỉ booking COMPLETED hoặc CHECKED_IN (index 0-14)
  rating: [5, 5, 5, 4, 5, 4, 3, 5, 5, 5, 4, 5, 4, 3, 5, 4, 5, 5, 4, 5][i],
  comment: comments[i],
  images:
    i % 3 === 0
      ? [`/images/review-${i + 1}-01.jpg`, `/images/review-${i + 1}-02.jpg`]
      : [],
  status: "VISIBLE",
  hostReply:
    i % 4 === 0
      ? {
          message:
            "Cảm ơn bạn đã trải nghiệm! Chúng tôi rất vui khi bạn hài lòng. Hẹn gặp lại!",
          repliedAt: d(5),
        }
      : undefined,
}));

// ====== WISHLISTS ======
export const wishlistsData = Array.from({ length: 20 }, (_, i) => ({
  touristId: TOURISTS[i % 10],
  itemType: i % 2 === 0 ? "WORKSHOP" : "PRODUCT",
  workshopId: i % 2 === 0 ? ID.WS[i % 20] : undefined,
  productId: i % 2 !== 0 ? ID.PR[i % 30] : undefined,
}));

// ====== CARTS ======
export const cartsData = [
  {
    touristId: ID.TOURIST1_ID,
    items: [
      {
        productId: ID.PR[0],
        hostId: ID.HOST1_ID,
        name: "Bộ ấm trà gốm Thanh Hà",
        image: "/images/product-bo-am-tra-gom-thanh-ha-thumb.jpg",
        price: 1200000,
        quantity: 1,
        subtotal: 1200000,
      },
      {
        productId: ID.PR[2],
        hostId: ID.HOST3_ID,
        name: "Đèn lồng lụa Hội An",
        image: "/images/product-den-long-lua-hoi-an-thumb.jpg",
        price: 320000,
        quantity: 2,
        subtotal: 640000,
      },
    ],
    totalItems: 3,
    totalAmount: 1840000,
  },
  {
    touristId: ID.TOURIST2_ID,
    items: [
      {
        productId: ID.PR[8],
        hostId: ID.HOST1_ID,
        name: "Ly cà phê gốm",
        image: "/images/product-ly-ca-phe-gom-thumb.jpg",
        price: 120000,
        quantity: 4,
        subtotal: 480000,
      },
    ],
    totalItems: 4,
    totalAmount: 480000,
  },
  {
    touristId: ID.TOURIST3_ID,
    items: [
      {
        productId: ID.PR[15],
        hostId: ID.HOST5_ID,
        name: "Cà phê rang mộc",
        image: "/images/product-ca-phe-rang-moc-thumb.jpg",
        price: 180000,
        quantity: 2,
        subtotal: 360000,
      },
      {
        productId: ID.PR[14],
        hostId: ID.HOST5_ID,
        name: "Bộ gia vị thảo mộc",
        image: "/images/product-bo-gia-vi-thao-moc-thumb.jpg",
        price: 250000,
        quantity: 1,
        subtotal: 250000,
      },
    ],
    totalItems: 3,
    totalAmount: 610000,
  },
  {
    touristId: ID.TOURIST4_ID,
    items: [
      {
        productId: ID.PR[9],
        hostId: ID.HOST6_ID,
        name: "Túi mây tre",
        image: "/images/product-tui-may-tre-thumb.jpg",
        price: 380000,
        quantity: 1,
        subtotal: 380000,
      },
    ],
    totalItems: 1,
    totalAmount: 380000,
  },
  {
    touristId: ID.TOURIST5_ID,
    items: [
      {
        productId: ID.PR[4],
        hostId: ID.HOST3_ID,
        name: "Khăn thổ cẩm thủ công",
        image: "/images/product-khan-tho-cam-thu-cong-thumb.jpg",
        price: 450000,
        quantity: 1,
        subtotal: 450000,
      },
      {
        productId: ID.PR[16],
        hostId: ID.HOST3_ID,
        name: "Nón lá trang trí",
        image: "/images/product-non-la-trang-tri-thumb.jpg",
        price: 95000,
        quantity: 3,
        subtotal: 285000,
      },
    ],
    totalItems: 4,
    totalAmount: 735000,
  },
];

// ====== NOTIFICATIONS ======
export const notificationsData = Array.from({ length: 30 }, (_, i) => {
  const types = ["BOOKING", "ORDER", "PAYMENT", "SYSTEM", "REVIEW", "TIMESLOT"];
  const titles = [
    "Đặt chỗ thành công",
    "Đơn hàng mới",
    "Thanh toán thành công",
    "Thông báo hệ thống",
    "Đánh giá mới",
    "Lịch hướng dẫn",
  ];
  const msgs = [
    `Bạn đã đặt chỗ thành công cho workshop. Mã: BK2026060${String(i + 1).padStart(4, "0")}`,
    `Đơn hàng ORD2026060${String(i + 1).padStart(4, "0")} đã được xác nhận.`,
    `Thanh toán ${(350000 * (1 + (i % 3))).toLocaleString()}đ thành công.`,
    "Hệ thống CraftLocal đã được cập nhật phiên bản mới với nhiều tính năng hấp dẫn.",
    "Bạn nhận được đánh giá 5 sao từ khách hàng. Tuyệt vời!",
    `Bạn được phân công hướng dẫn workshop ngày ${new Date().getDate() + 1}/${new Date().getMonth() + 1}.`,
  ];
  return {
    userId:
      i < 10
        ? TOURISTS[i]
        : i < 16
          ? HOSTS[i - 10]
          : i < 22
            ? GUIDES[i - 16]
            : TOURISTS[i % 10],
    title: titles[i % 6],
    message: msgs[i % 6],
    type: types[i % 6],
    isRead: i < 15,
  };
});

// ====== AUDIT LOGS ======
export const auditLogsData = [
  {
    actorId: ID.ADMIN_ID,
    actorRole: "ADMIN",
    action: "APPROVE_HOST",
    targetType: "User",
    targetId: ID.HOST1_ID,
    description: "Admin đã phê duyệt Host Nguyễn Văn Tuấn",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.ADMIN_ID,
    actorRole: "ADMIN",
    action: "APPROVE_HOST",
    targetType: "User",
    targetId: ID.HOST2_ID,
    description: "Admin đã phê duyệt Host Trần Quốc Bình",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.ADMIN_ID,
    actorRole: "ADMIN",
    action: "APPROVE_HOST",
    targetType: "User",
    targetId: ID.HOST3_ID,
    description: "Admin đã phê duyệt Host Lê Thị Hồng Lan",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST1_ID,
    actorRole: "HOST",
    action: "CREATE_WORKSHOP",
    targetType: "Workshop",
    targetId: ID.WS[0],
    description: "Host đã tạo workshop: Trải nghiệm làm gốm Thanh Hà",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST2_ID,
    actorRole: "HOST",
    action: "CREATE_WORKSHOP",
    targetType: "Workshop",
    targetId: ID.WS[1],
    description: "Host đã tạo workshop: Workshop điêu khắc đá Non Nước",
    ipAddress: "192.168.1.11",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST3_ID,
    actorRole: "HOST",
    action: "CREATE_WORKSHOP",
    targetType: "Workshop",
    targetId: ID.WS[2],
    description: "Host đã tạo workshop: Trải nghiệm làm đèn lồng Hội An",
    ipAddress: "192.168.1.12",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST1_ID,
    actorRole: "HOST",
    action: "CREATE_TOUR_GUIDE",
    targetType: "User",
    targetId: ID.GUIDE1_ID,
    description: "Host đã tạo Tour Guide: Võ Thanh Sơn",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST2_ID,
    actorRole: "HOST",
    action: "CREATE_TOUR_GUIDE",
    targetType: "User",
    targetId: ID.GUIDE2_ID,
    description: "Host đã tạo Tour Guide: Đặng Thị Lan",
    ipAddress: "192.168.1.11",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.TOURIST1_ID,
    actorRole: "TOURIST",
    action: "CREATE_BOOKING",
    targetType: "Booking",
    targetId: ID.BK[0],
    description: "Tourist đã đặt chỗ workshop: Trải nghiệm làm gốm Thanh Hà",
    ipAddress: "192.168.1.20",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.TOURIST2_ID,
    actorRole: "TOURIST",
    action: "CREATE_BOOKING",
    targetType: "Booking",
    targetId: ID.BK[1],
    description: "Tourist đã đặt chỗ workshop: Workshop điêu khắc đá Non Nước",
    ipAddress: "192.168.1.21",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.GUIDE1_ID,
    actorRole: "TOUR_GUIDE",
    action: "CHECK_IN",
    targetType: "Ticket",
    targetId: ID.TK[0],
    description: "Tour Guide đã check-in vé QR-BK20260600001",
    ipAddress: "192.168.1.30",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.GUIDE2_ID,
    actorRole: "TOUR_GUIDE",
    action: "CHECK_IN",
    targetType: "Ticket",
    targetId: ID.TK[1],
    description: "Tour Guide đã check-in vé QR-BK20260600002",
    ipAddress: "192.168.1.31",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST1_ID,
    actorRole: "HOST",
    action: "UPDATE_ORDER",
    targetType: "Order",
    targetId: ID.OR[0],
    description: "Host đã cập nhật đơn hàng ORD20260600001 sang COMPLETED",
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST3_ID,
    actorRole: "HOST",
    action: "CREATE_PRODUCT",
    targetType: "Product",
    targetId: ID.PR[2],
    description: "Host đã tạo sản phẩm: Đèn lồng lụa Hội An",
    ipAddress: "192.168.1.12",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.ADMIN_ID,
    actorRole: "ADMIN",
    action: "BLOCK_USER",
    targetType: "User",
    description: "Admin đã khóa tài khoản spam",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST4_ID,
    actorRole: "HOST",
    action: "CREATE_WORKSHOP",
    targetType: "Workshop",
    targetId: ID.WS[3],
    description: "Host đã tạo workshop: Lớp nấu ăn làng rau Trà Quế",
    ipAddress: "192.168.1.13",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.TOURIST3_ID,
    actorRole: "TOURIST",
    action: "CREATE_BOOKING",
    targetType: "Booking",
    targetId: ID.BK[2],
    description: "Tourist đã đặt chỗ workshop: Trải nghiệm làm đèn lồng Hội An",
    ipAddress: "192.168.1.22",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.HOST5_ID,
    actorRole: "HOST",
    action: "CREATE_PRODUCT",
    targetType: "Product",
    targetId: ID.PR[14],
    description: "Host đã tạo sản phẩm: Bộ gia vị thảo mộc",
    ipAddress: "192.168.1.14",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.GUIDE3_ID,
    actorRole: "TOUR_GUIDE",
    action: "START_TIMESLOT",
    targetType: "Timeslot",
    targetId: ID.TS[6],
    description: "Tour Guide đã bắt đầu khung giờ workshop đèn lồng",
    ipAddress: "192.168.1.32",
    userAgent: "Mozilla/5.0",
  },
  {
    actorId: ID.ADMIN_ID,
    actorRole: "ADMIN",
    action: "SYSTEM_UPDATE",
    targetType: "System",
    description: "Hệ thống đã được cập nhật lên v2.0",
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0",
  },
];
