# Local Craft - Frontend Application

Giao diện người dùng nền tảng **Local Craft** (kết nối du khách với nghệ nhân, workshop và sản phẩm thủ công địa phương).

## 🛠 Tech Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router DOM (v6)
- **HTTP Client:** Axios (với Request & Response Interceptors)
- **State Management:** React Context API (`AuthContext`)
- **Styling:** CSS3 variables & responsive design system

## 📁 Cấu trúc thư mục Frontend
```text
frontend/
├── src/
│   ├── assets/               # Hình ảnh, biểu tượng tĩnh
│   ├── components/           # Component dùng chung
│   │   ├── Navbar.jsx        # Thanh điều hướng hiển thị theo trạng thái đăng nhập
│   │   ├── Footer.jsx        # Chân trang thông tin làng nghề
│   │   ├── ProtectedRoute.jsx# Bảo vệ route yêu cầu đăng nhập
│   │   └── RoleRoute.jsx     # Phân quyền theo vai trò (CUSTOMER, ARTISAN, ADMIN)
│   ├── layouts/              # Khung giao diện
│   │   ├── MainLayout.jsx    # Layout công khai (Navbar + Content + Footer)
│   │   └── DashboardLayout.jsx # Layout dashboard phân quyền theo Role
│   ├── pages/                # Các trang màn hình
│   │   ├── HomePage.jsx      # Trang chủ (Workshops nổi bật, Sản phẩm làng nghề)
│   │   ├── LoginPage.jsx     # Trang đăng nhập
│   │   ├── RegisterPage.jsx  # Trang đăng ký (CUSTOMER hoặc ARTISAN)
│   │   ├── WorkshopsPage.jsx # Danh sách workshop và tìm kiếm
│   │   ├── WorkshopDetailPage.jsx # Chi tiết workshop & nút đặt chỗ
│   │   ├── ProductsPage.jsx  # Danh sách sản phẩm thủ công
│   │   ├── ProductDetailPage.jsx  # Chi tiết sản phẩm & đặt mua
│   │   ├── ArtisanDetailPage.jsx  # Hồ sơ nghệ nhân & xưởng nghề
│   │   ├── BookingPage.jsx   # Đặt lịch workshop & thanh toán PayOS
│   │   ├── OrdersPage.jsx    # Đặt hàng sản phẩm & thanh toán PayOS
│   │   ├── ProfilePage.jsx   # Quản lý tài khoản & hồ sơ nghệ nhân
│   │   ├── DashboardPage.jsx # Dashboard khách hàng & nghệ nhân
│   │   ├── AdminDashboardPage.jsx # Dashboard quản trị viên (Admin)
│   │   ├── ForbiddenPage.jsx # Trang 403 Forbidden
│   │   └── NotFoundPage.jsx  # Trang 404 Not Found
│   ├── routes/
│   │   └── index.jsx         # Khai báo hệ thống routes
│   ├── services/             # Giao tiếp API Backend
│   │   ├── api.js            # Cấu hình Axios instance + Interceptor gắn Token
│   │   ├── auth.service.js   # API auth
│   │   ├── workshop.service.js# API workshop
│   │   └── product.service.js# API product
│   ├── contexts/
│   │   └── AuthContext.jsx   # Quản lý authentication state toàn cục
│   ├── hooks/
│   │   └── useAuth.js        # Hook truy xuất context nhanh
│   ├── utils/
│   │   └── constants.js      # Hằng số Roles, Statuses, Storage Keys
│   ├── App.jsx               # Root App Provider wrapper
│   ├── main.jsx              # Entry point ReactDOM
│   └── index.css             # CSS thiết kế giao diện
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
VITE_API_URL=http://localhost:5000/api
```

### 3. Khởi chạy Development Server
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 4. Build Production
```bash
npm run build
npm run preview
```

## 🔒 Điều hướng và Phân quyền (Role Redirection)
- **Khách chưa đăng nhập:**
  - Truy cập route được bảo vệ (`/dashboard`, `/booking`, `/orders`, `/profile`, `/admin`) sẽ được chuyển hướng tự động sang `/login`.
- **Sau khi đăng nhập:**
  - `CUSTOMER` → chuyển sang trang Dashboard khách hàng (`/dashboard`)
  - `ARTISAN` → chuyển sang trang Quản trị xưởng (`/dashboard` với công cụ thêm workshop, đăng bán sản phẩm)
  - `ADMIN` → chuyển sang trang Quản trị hệ thống (`/admin` duyệt nghệ nhân, quản lý tài khoản, danh mục)
- **Truy cập sai quyền:**
  - Nếu tài khoản không phải `ADMIN` truy cập `/admin`, hệ thống chặn lại và điều hướng về trang `/403` (Forbidden).
