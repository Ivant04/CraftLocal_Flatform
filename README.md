# Local Craft - Nền tảng Kết nối Nghệ nhân, Workshop & Sản phẩm Thủ công Địa phương

> **Base Project Hoàn Chỉnh** cho môn học Web Design & Programming (WDP301) / Dự án Khởi nghiệp Thủ công Việt Nam.

---

## 1. Project Overview (Tổng quan Dự án)
**Local Craft** là nền tảng số kết nối khách du lịch và người yêu văn hóa truyền thống với các nghệ nhân làng nghề, xưởng thủ công bản địa tại Việt Nam.

Dự án cho phép:
- **Khách du lịch (Customer):** Tìm kiếm, đăng ký trải nghiệm workshop (làm gốm, làm đèn lồng, tranh sơn mài, đan mây tre...), mua sắm sản phẩm thủ công tinh xảo, thanh toán trực tuyến và đánh giá dịch vụ.
- **Nghệ nhân (Artisan):** Mở xưởng số, quảng bá làng nghề, tổ chức workshop, bán tác phẩm thủ công trực tiếp đến tay du khách không qua trung gian.
- **Quản trị viên (Admin):** Kiểm duyệt nghệ nhân, quản lý nội dung workshop, sản phẩm, đơn hàng và danh mục hệ thống.

---

## 2. Technology Stack (Công nghệ Sử dụng)

| Thành phần | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express.js | RESTful API, Controller-Service-Model-Route architecture |
| **Frontend** | React 18 + Vite | React Router DOM v6, Axios Interceptors, Context API |
| **Database** | MongoDB + Mongoose ODM | 9 Core Schemas có quan hệ chặt chẽ |
| **Authentication** | JWT + bcryptjs | Token-based Authentication & Role-based Authorization |
| **Payment** | PayOS Architecture Ready | Service module hóa (`services/payment`), không hardcode |
| **CORS** | Configured | Cho phép frontend `http://localhost:5173` gọi `http://localhost:5000` |

---

## 3. Folder Structure (Cấu trúc Thư mục)

```text
local-craft/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js               # Kết nối Mongoose
│   │   ├── controllers/                  # Tiếp nhận request & trả response
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── artisan.controller.js
│   │   │   ├── workshop.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── booking.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── review.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── category.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js         # JWT verify & Role authorization
│   │   │   ├── error.middleware.js        # Global error handler
│   │   │   └── notFound.middleware.js     # 404 handler
│   │   ├── models/                       # 9 Mongoose Models
│   │   │   ├── User.js
│   │   │   ├── Artisan.js
│   │   │   ├── Workshop.js
│   │   │   ├── Product.js
│   │   │   ├── Booking.js
│   │   │   ├── Order.js
│   │   │   ├── Review.js
│   │   │   ├── Payment.js
│   │   │   └── Category.js
│   │   ├── routes/                       # Endpoints
│   │   │   ├── index.js                  # Centralized router & /api/health
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── artisan.routes.js
│   │   │   ├── workshop.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── review.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── category.routes.js
│   │   ├── services/                     # Business Logic
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── artisan.service.js
│   │   │   ├── workshop.service.js
│   │   │   ├── product.service.js
│   │   │   ├── booking.service.js
│   │   │   ├── order.service.js
│   │   │   ├── review.service.js
│   │   │   ├── category.service.js
│   │   │   └── payment/                  # Module tích hợp thanh toán
│   │   │       ├── payment.service.js
│   │   │       └── payos.service.js
│   │   ├── utils/
│   │   │   ├── apiResponse.js            # Standardized { success, message, data }
│   │   │   ├── apiError.js               # Custom ApiError class
│   │   │   ├── asyncHandler.js           # Async wrapper
│   │   │   └── jwt.js                    # JWT helper sign/verify
│   │   ├── app.js                        # App setup & CORS
│   │   └── server.js                     # HTTP Server entry point
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/                       # Static assets
│   │   ├── components/                   # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx        # Login required guard
│   │   │   └── RoleRoute.jsx             # Role-based guard (403 if unauthorized)
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx            # Public layout
│   │   │   └── DashboardLayout.jsx       # Role-specific dashboard layout
│   │   ├── pages/
│   │   │   ├── HomePage.jsx              # Trang chủ
│   │   │   ├── LoginPage.jsx             # Đăng nhập
│   │   │   ├── RegisterPage.jsx          # Đăng ký (Customer / Artisan)
│   │   │   ├── WorkshopsPage.jsx         # Danh sách workshops
│   │   │   ├── WorkshopDetailPage.jsx    # Chi tiết workshop
│   │   │   ├── ProductsPage.jsx          # Danh sách sản phẩm
│   │   │   ├── ProductDetailPage.jsx     # Chi tiết sản phẩm
│   │   │   ├── ArtisanDetailPage.jsx     # Hồ sơ nghệ nhân
│   │   │   ├── BookingPage.jsx           # Đặt lịch workshop
│   │   │   ├── OrdersPage.jsx            # Đơn hàng sản phẩm
│   │   │   ├── ProfilePage.jsx           # Hồ sơ cá nhân
│   │   │   ├── DashboardPage.jsx         # Dashboard Customer & Artisan
│   │   │   ├── AdminDashboardPage.jsx    # Dashboard Admin
│   │   │   ├── ForbiddenPage.jsx         # 403 Forbidden
│   │   │   └── NotFoundPage.jsx          # 404 Not Found
│   │   ├── routes/
│   │   │   └── index.jsx                 # Routing table
│   │   ├── services/
│   │   │   ├── api.js                    # Axios instance + Token interceptor
│   │   │   ├── auth.service.js
│   │   │   ├── workshop.service.js
│   │   │   └── product.service.js
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx           # Auth Context Provider
│   │   ├── hooks/
│   │   │   └── useAuth.js                # Auth custom hook
│   │   ├── utils/
│   │   │   └── constants.js              # Enums & LocalStorage keys
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                     # Design system CSS
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── README.md
│
└── README.md
```

---

## 4. Installation (Cài đặt)

### Yêu cầu tiên quyết:
- **Node.js:** phiên bản 18+ (khuyên dùng Node 20 hoặc 24)
- **MongoDB:** MongoDB Community Server (hoặc MongoDB Atlas Cloud)

### Bước 1: Cài đặt Backend
```bash
cd backend
npm install
```

### Bước 2: Cài đặt Frontend
```bash
cd ../frontend
npm install
```

---

## 5. Environment Variables (Biến Môi Trường)

### Backend (`backend/.env`):
```env
PORT=5000

# MongoDB URI (Local hoặc Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/local_craft

# JWT
JWT_SECRET=supersecretjwtkey_localcraft_2026
JWT_EXPIRES_IN=7d

# Frontend URL
CLIENT_URL=http://localhost:5173

# PayOS credentials (sẵn sàng tích hợp khi triển khai cổng thanh toán)
PAYOS_CLIENT_ID=
PAYOS_API_KEY=
PAYOS_CHECKSUM_KEY=
```

### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 6. Run Backend

Từ thư mục `backend/`:
```bash
cd backend
npm run dev
```
Backend API sẽ hoạt động tại: **`http://localhost:5000`**  
Kiểm tra Health Check: **`http://localhost:5000/api/health`**

---

## 7. Run Frontend

Từ thư mục `frontend/`:
```bash
cd frontend
npm run dev
```
Frontend Web sẽ mở tại: **`http://localhost:5173`**

---

## 8. MongoDB Setup (Cấu hình Cơ sở Dữ liệu)

### Phương án A: MongoDB Local (Mặc định)
1. Cài đặt MongoDB Community Server và MongoDB Compass.
2. Đảm bảo MongoDB Service đang chạy (Port mặc định: `27017`).
3. Chuỗi kết nối trong `backend/.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/local_craft
   ```
4. Khi chạy backend lần đầu, Mongoose sẽ tự động kết nối và tạo database `local_craft`.

### Phương án B: MongoDB Atlas (Cloud)
1. Tạo cluster miễn phí trên [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Lấy connection string và thay thế vào `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/local_craft?retryWrites=true&w=majority
   ```

---

## 9. API Structure (Cấu trúc RESTful API)

Tất cả phản hồi từ API tuân thủ định dạng chuẩn thống nhất:

### Thành công:
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Thất bại:
```json
{
  "success": false,
  "message": "Error message"
}
```

### Danh sách Endpoint chính:

| Nhóm API | Method | Endpoint | Quyền (Role) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Public | Kiểm tra trạng thái hệ thống |
| **Auth** | `POST` | `/api/auth/register` | Public | Đăng ký tài khoản (`CUSTOMER` / `ARTISAN`) |
| | `POST` | `/api/auth/login` | Public | Đăng nhập nhận JWT token |
| | `POST` | `/api/auth/logout` | Public | Đăng xuất |
| | `GET` | `/api/auth/me` | Logged in | Lấy thông tin tài khoản hiện tại |
| **Workshops** | `GET` | `/api/workshops` | Public | Danh sách workshop (lọc, tìm kiếm) |
| | `GET` | `/api/workshops/:id` | Public | Chi tiết workshop |
| | `POST` | `/api/workshops` | ARTISAN, ADMIN | Tạo workshop mới |
| | `PUT` | `/api/workshops/:id` | ARTISAN, ADMIN | Cập nhật workshop |
| | `DELETE`| `/api/workshops/:id` | ARTISAN, ADMIN | Xóa workshop |
| **Products** | `GET` | `/api/products` | Public | Danh sách sản phẩm |
| | `GET` | `/api/products/:id` | Public | Chi tiết sản phẩm |
| | `POST` | `/api/products` | ARTISAN, ADMIN | Đăng sản phẩm mới |
| | `PUT` | `/api/products/:id` | ARTISAN, ADMIN | Cập nhật sản phẩm |
| | `DELETE`| `/api/products/:id` | ARTISAN, ADMIN | Xóa sản phẩm |
| **Artisans** | `GET` | `/api/artisans` | Public | Danh sách nghệ nhân |
| | `GET` | `/api/artisans/:id` | Public | Chi tiết hồ sơ nghệ nhân |
| | `PUT` | `/api/artisans/profile` | ARTISAN | Cập nhật thông tin xưởng thủ công |
| | `PATCH`| `/api/artisans/:id/status`| ADMIN | Duyệt / Từ chối nghệ nhân (`APPROVED` / `REJECTED`) |
| **Bookings** | `POST` | `/api/bookings` | CUSTOMER | Đặt chỗ workshop |
| | `GET` | `/api/bookings/my` | Logged in | Danh sách booking của tôi |
| | `GET` | `/api/bookings/artisan`| ARTISAN | Danh sách khách đặt workshop của xưởng |
| | `GET` | `/api/bookings` | ADMIN | Quản lý toàn bộ booking |
| **Orders** | `POST` | `/api/orders` | CUSTOMER | Đặt mua sản phẩm thủ công |
| | `GET` | `/api/orders/my` | Logged in | Danh sách đơn hàng cá nhân |
| | `GET` | `/api/orders` | ADMIN | Toàn bộ đơn hàng |
| **Payments** | `POST` | `/api/payments/booking`| CUSTOMER | Khởi tạo link thanh toán PayOS cho Booking |
| | `POST` | `/api/payments/order` | CUSTOMER | Khởi tạo link thanh toán PayOS cho Đơn hàng |
| | `POST` | `/api/payments/webhook`| PayOS | Webhook xử lý cập nhật trạng thái thanh toán |
| **Categories**| `GET` | `/api/categories` | Public | Lấy danh mục |
| | `POST` | `/api/categories` | ADMIN | Tạo mới danh mục |

---

## 10. Authentication & Authorization

### Cách hoạt động:
1. Client gửi `POST /api/auth/login` với `{ email, password }`.
2. Backend kiểm tra tài khoản, mã hóa và so sánh mật khẩu qua `bcryptjs`.
3. Nếu hợp lệ, Backend tạo JWT token chứa `{ id: user._id, role: user.role }` có hạn sử dụng 7 ngày.
4. Client lưu token vào `localStorage` (`local_craft_token`).
5. Axios Interceptor tự động đính kèm Header:
   ```text
   Authorization: Bearer <token>
   ```
6. Backend Middleware:
   - `authenticate`: Giải mã token, kiểm tra trạng thái tài khoản (`BLOCKED`, `INACTIVE` bị từ chối).
   - `authorize(...roles)`: Kiểm tra quyền tương ứng (ví dụ chỉ `ADMIN` mới được duyệt nghệ nhân).

---

## 11. User Roles & Redirection

Hệ thống có 3 vai trò:
1. **CUSTOMER (Khách du lịch / Người mua):**
   - Đăng ký, đăng nhập.
   - Xem workshop, xem sản phẩm, xem hồ sơ nghệ nhân.
   - Đặt workshop, đặt mua sản phẩm, thanh toán.
   - Xem lịch đặt, đơn hàng, cập nhật thông tin cá nhân.
   - Được chuyển hướng tới `/dashboard` (Customer view).

2. **ARTISAN (Nghệ nhân / Chủ xưởng):**
   - Đăng ký tài khoản vai trò Nghệ nhân (hệ thống tự khởi tạo profile xưởng).
   - Quản lý hồ sơ xưởng nghề, chuyên môn, kinh nghiệm.
   - Tạo và quản lý workshop trải nghiệm.
   - Đăng bán và quản lý sản phẩm thủ công.
   - Quản lý khách đặt chỗ và đơn hàng.
   - Được chuyển hướng tới `/dashboard` (Artisan view với công cụ quản trị).

3. **ADMIN (Quản trị viên):**
   - Quản lý danh sách người dùng và phân quyền.
   - Duyệt hoặc từ chối đơn đăng ký của Nghệ nhân (`APPROVED` / `REJECTED`).
   - Quản lý danh mục làng nghề, workshop, sản phẩm, đơn hàng toàn hệ thống.
   - Được chuyển hướng tới `/admin` (Admin Dashboard).
   - Nếu user không phải ADMIN cố gắng truy cập `/admin`, hệ thống chặn và chuyển sang trang **`/403 Forbidden`**.

---

## 12. Hướng dẫn Test Postman

### 1. Test Đăng ký (Register)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/register`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Nghệ nhân Bát Tràng",
    "email": "artisan@localcraft.vn",
    "password": "password123",
    "phone": "0987654321",
    "role": "ARTISAN"
  }
  ```
- **Response nhận được:** Mã `201 Created` kèm token và thông tin user.

### 2. Test Đăng nhập (Login)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "email": "artisan@localcraft.vn",
    "password": "password123"
  }
  ```
- **Response nhận được:** Mã `200 OK` kèm JWT token:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

### 3. Test Lấy thông tin cá nhân (Get Me)
- **Method:** `GET`
- **URL:** `http://localhost:5000/api/auth/me`
- **Headers:**
  - `Authorization`: `Bearer <DÁN_TOKEN_TỪ_BƯỚC_2_VÀO_ĐÂY>`
- **Response nhận được:** Thông tin đầy đủ của user và profile nghệ nhân.
