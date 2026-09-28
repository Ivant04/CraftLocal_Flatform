import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

export const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const workshopIdFromQuery = searchParams.get('workshopId');
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      if (res.success) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      if (workshopIdFromQuery) {
        try {
          const res = await api.get(`/workshops/${workshopIdFromQuery}`);
          if (res.success) {
            setSelectedWorkshop(res.data);
          }
        } catch (err) {
          console.error(err);
        }
      }
      await fetchBookings();
      setLoading(false);
    };

    init();
  }, [workshopIdFromQuery]);

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedWorkshop) return;
    setError('');
    setMessage('');

    try {
      const res = await api.post('/bookings', {
        workshopId: selectedWorkshop._id,
        bookingDate,
        quantity: Number(quantity)
      });

      if (res.success) {
        setMessage('Đặt workshop thành công!');
        fetchBookings();
      }
    } catch (err) {
      setError(err.message || 'Đặt workshop không thành công.');
    }
  };

  const handlePay = async (bookingId) => {
    try {
      const res = await api.post('/payments/booking', {
        bookingId,
        returnUrl: `${window.location.origin}/booking?payment=success`,
        cancelUrl: `${window.location.origin}/booking?payment=cancelled`
      });

      if (res.success && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err) {
      alert(err.message || 'Không thể tạo cổng thanh toán.');
    }
  };

  return (
    <div className="section-container">
      <div className="page-header">
        <h1>Quản lý & Đặt chỗ Workshop</h1>
        <p>Theo dõi lịch trải nghiệm và trạng thái thanh toán của bạn.</p>
      </div>

      {/* Booking Form if a workshop is selected */}
      {selectedWorkshop && (
        <div className="card booking-form-card">
          <h3>Xác nhận Đặt chỗ: {selectedWorkshop.title}</h3>
          <p className="card-desc">📍 {selectedWorkshop.location} | Giá: {selectedWorkshop.price?.toLocaleString('vi-VN')} đ/người</p>
          
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleCreateBooking} className="form-grid">
            <div className="form-group">
              <label>Ngày tham gia</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Số lượng khách</label>
              <input
                type="number"
                min="1"
                max={selectedWorkshop.availableSlots || 10}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Tổng tiền tạm tính</label>
              <div className="total-display">
                {((selectedWorkshop.price || 0) * (Number(quantity) || 1)).toLocaleString('vi-VN')} đ
              </div>
            </div>
            <div className="form-actions-inline">
              <button type="submit" className="btn btn-primary">Xác nhận đặt chỗ</button>
            </div>
          </form>
        </div>
      )}

      {/* Bookings List */}
      <div className="bookings-list-section">
        <h3>Lịch sử đặt chỗ của bạn</h3>
        {loading ? (
          <p>Đang tải danh sách đặt chỗ...</p>
        ) : bookings.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Workshop</th>
                  <th>Ngày hẹn</th>
                  <th>Số lượng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <strong>{b.workshop?.title || 'Workshop'}</strong>
                    </td>
                    <td>{new Date(b.bookingDate).toLocaleDateString('vi-VN')}</td>
                    <td>{b.quantity}</td>
                    <td>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span className={`status-badge status-${b.status?.toLowerCase()}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge payment-${b.paymentStatus?.toLowerCase()}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {b.paymentStatus === 'UNPAID' && b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handlePay(b._id)}
                          className="btn btn-secondary btn-small"
                        >
                          Thanh toán (PayOS)
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>Bạn chưa có lượt đặt workshop nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
