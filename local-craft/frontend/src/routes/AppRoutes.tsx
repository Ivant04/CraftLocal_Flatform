import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';
import AdminLayout from '../components/layout/AdminLayout';
import HostLayout from '../components/layout/HostLayout';
import TourGuideLayout from '../components/layout/TourGuideLayout';

// Common
import RoleRoute from '../components/common/RoleRoute';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import WorkshopListPage from '../pages/public/WorkshopListPage';
import WorkshopDetailPage from '../pages/public/WorkshopDetailPage';
import ProductListPage from '../pages/public/ProductListPage';
import ProductDetailPage from '../pages/public/ProductDetailPage';
import AboutPage from '../pages/public/AboutPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Tourist Pages
import CartPage from '../pages/tourist/CartPage';
import CheckoutPage from '../pages/tourist/CheckoutPage';
import PaymentResultPage from '../pages/tourist/PaymentResultPage';
import MyBookingsPage from '../pages/tourist/MyBookingsPage';
import TicketPage from '../pages/tourist/TicketPage';
import MyOrdersPage from '../pages/tourist/MyOrdersPage';
import ReviewPage from '../pages/tourist/ReviewPage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import ManageUsersPage from '../pages/admin/ManageUsersPage';
import ApproveHostsPage from '../pages/admin/ApproveHostsPage';
import AdminRevenuePage from '../pages/admin/AdminRevenuePage';

// Host Pages
import HostDashboardPage from '../pages/host/HostDashboardPage';
import ManageWorkshopsPage from '../pages/host/ManageWorkshopsPage';
import WorkshopFormPage from '../pages/host/WorkshopFormPage';
import ManageTimeslotsPage from '../pages/host/ManageTimeslotsPage';
import ManageProductsPage from '../pages/host/ManageProductsPage';
import ProductFormPage from '../pages/host/ProductFormPage';
import ManageOrdersPage from '../pages/host/ManageOrdersPage';
import ManageTourGuidesPage from '../pages/host/ManageTourGuidesPage';
import AssignGuidePage from '../pages/host/AssignGuidePage';

// Tour Guide Pages
import TourGuideDashboardPage from '../pages/tourGuide/TourGuideDashboardPage';
import AssignedSchedulePage from '../pages/tourGuide/AssignedSchedulePage';
import CustomerListPage from '../pages/tourGuide/CustomerListPage';
import QRCheckInPage from '../pages/tourGuide/QRCheckInPage';
import TripProgressPage from '../pages/tourGuide/TripProgressPage';

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public Routes */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/workshops" element={<WorkshopListPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* Tourist Routes (inside MainLayout) */}
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
      <Route path="/payment-result" element={<PaymentResultPage />} />
      <Route path="/my-bookings" element={<ProtectedRoute><MyBookingsPage /></ProtectedRoute>} />
      <Route path="/my-bookings/:id/ticket" element={<ProtectedRoute><TicketPage /></ProtectedRoute>} />
      <Route path="/my-orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
      <Route path="/review/:bookingId" element={<ProtectedRoute><ReviewPage /></ProtectedRoute>} />
    </Route>

    {/* Auth Routes */}
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    {/* Admin Routes */}
    <Route element={<RoleRoute allowedRoles={['ADMIN']}><AdminLayout /></RoleRoute>}>
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/users" element={<ManageUsersPage />} />
      <Route path="/admin/approve-hosts" element={<ApproveHostsPage />} />
      <Route path="/admin/revenue" element={<AdminRevenuePage />} />
    </Route>

    {/* Host Routes */}
    <Route element={<RoleRoute allowedRoles={['HOST']}><HostLayout /></RoleRoute>}>
      <Route path="/host/dashboard" element={<HostDashboardPage />} />
      <Route path="/host/workshops" element={<ManageWorkshopsPage />} />
      <Route path="/host/workshops/create" element={<WorkshopFormPage />} />
      <Route path="/host/workshops/:id/edit" element={<WorkshopFormPage />} />
      <Route path="/host/timeslots" element={<ManageTimeslotsPage />} />
      <Route path="/host/products" element={<ManageProductsPage />} />
      <Route path="/host/products/create" element={<ProductFormPage />} />
      <Route path="/host/products/:id/edit" element={<ProductFormPage />} />
      <Route path="/host/orders" element={<ManageOrdersPage />} />
      <Route path="/host/tour-guides" element={<ManageTourGuidesPage />} />
      <Route path="/host/assign-guide" element={<AssignGuidePage />} />
    </Route>

    {/* Tour Guide Routes */}
    <Route element={<RoleRoute allowedRoles={['TOUR_GUIDE']}><TourGuideLayout /></RoleRoute>}>
      <Route path="/tour-guide/dashboard" element={<TourGuideDashboardPage />} />
      <Route path="/tour-guide/schedules" element={<AssignedSchedulePage />} />
      <Route path="/tour-guide/timeslots/:id/customers" element={<CustomerListPage />} />
      <Route path="/tour-guide/check-in" element={<QRCheckInPage />} />
      <Route path="/tour-guide/trip-progress/:id" element={<TripProgressPage />} />
    </Route>
  </Routes>
);

export default AppRoutes;
