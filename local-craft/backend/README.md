# Local Craft - Backend API

Backend RESTful API cho nền tảng **Local Craft** (kết nối du khách với nghệ nhân và workshop thủ công địa phương).

## 🛠 Tech Stack
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **Payment Architecture:** PayOS Integration Ready
- **Architecture:** Controller - Service - Model - Route (Clean & Decoupled)

## 📁 Cấu trúc thư mục Backend
```text
backend/
├── src/
│   ├── config/
│   │   └── database.js               # Kết nối MongoDB với Mongoose
│   ├── controllers/                  # Nhận request, gọi service, trả response
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── artisan.controller.js
│   │   ├── workshop.controller.js
│   │   ├── product.controller.js
│   │   ├── booking.controller.js
│   │   ├── order.controller.js
│   │   ├── review.controller.js
│   │   ├── payment.controller.js
│   │   └── category.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js         # JWT verify & Role authorization (CUSTOMER, ARTISAN, ADMIN)
│   │   ├── error.middleware.js        # Global error handler (không làm sập server)
│   │   └── notFound.middleware.js     # 404 Route handler
│   ├── models/                       # Mongoose Schemas & Database logic
│   │   ├── User.js
│   │   ├── Artisan.js
│   │   ├── Workshop.js
│   │   ├── Product.js
│   │   ├── Booking.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Payment.js
│   │   └── Category.js
│   ├── routes/                       # Định nghĩa các endpoint RESTful
│   │   ├── index.js                  # Centralized router & /api/health
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── artisan.routes.js
│   │   ├── workshop.routes.js
│   │   ├── product.routes.js
│   │   ├── booking.routes.js
│   │   ├── order.routes.js
│   │   ├── review.routes.js
│   │   ├── payment.routes.js
│   │   └── category.routes.js
│   ├── services/                     # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── artisan.service.js
│   │   ├── workshop.service.js
│   │   ├── product.service.js
│   │   ├── booking.service.js
│   │   ├── order.service.js
│   │   ├── review.service.js
│   │   ├── category.service.js
│   │   └── payment/                  # Payment module tách riêng cho PayOS
│   │       ├── payment.service.js
│   │       └── payos.service.js
│   ├── utils/                        # Tiện ích bổ trợ
│   │   ├── apiResponse.js            # Format response chuẩn { success, message, data }
│   │   ├── apiError.js               # Custom operational error class
│   │   ├── asyncHandler.js           # Async handler wrapper
│   │   └── jwt.js                    # JWT sign & verify
│   ├── app.js                        # Cấu hình Express app, CORS, Middlewares
│   └── server.js                     # Entry point khởi động HTTP server
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## ⚙️ Cài đặt & Khởi chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```
Nội dung file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/local_craft
JWT_SECRET=supersecretjwtkey_localcraft_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# PayOS Configuration
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

### 3. Chạy Server
- **Chế độ phát triển (auto reload với nodemon):**
  ```bash
  npm run dev
  ```
- **Chế độ production:**
  ```bash
  npm start
  ```

Server sẽ chạy tại: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

## 📡 API Endpoints Tổng quan
- `POST /api/auth/register` : Đăng ký tài khoản (CUSTOMER / ARTISAN)
- `POST /api/auth/login` : Đăng nhập & nhận JWT token
- `POST /api/auth/logout` : Đăng xuất
- `GET /api/auth/me` : Lấy thông tin user hiện tại (cần Bearer Token)
- `GET /api/workshops` : Danh sách workshop
- `GET /api/products` : Danh sách sản phẩm
- `GET /api/artisans` : Danh sách nghệ nhân
- `GET /api/categories` : Danh mục
- `POST /api/bookings` : Đặt workshop
- `POST /api/orders` : Đặt mua sản phẩm
- `POST /api/reviews` : Đánh giá workshop/product/artisan
- `POST /api/payments/order` : Tạo thanh toán PayOS cho Order
- `POST /api/payments/booking` : Tạo thanh toán PayOS cho Booking
- `POST /api/payments/webhook` : Nhận webhook từ PayOS
