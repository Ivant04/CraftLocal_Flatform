import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';

export const OrdersPage = () => {
  const location = useLocation();
  const directBuy = location.state?.directBuy;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: '',
    phone: '',
    street: '',
    city: 'Hà Nội',
    province: 'Việt Nam'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders/my');
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    init();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!directBuy?.product) return;
    setError('');
    setMessage('');

    try {
      const res = await api.post('/orders', {
        items: [
          {
            product: directBuy.product._id,
            quantity: directBuy.quantity
          }
        ],
        shippingAddress
      });

      if (res.success) {
        setMessage('Đặt hàng thành công!');
        fetchOrders();
      }
    } catch (err) {
      setError(err.message || 'Không thể tạo đơn hàng.');
    }
  };

  const handlePayOrder = async (orderId) => {
    try {
      const res = await api.post('/payments/order', {
        orderId,
        returnUrl: `${window.location.origin}/orders?payment=success`,
        cancelUrl: `${window.location.origin}/orders?payment=cancelled`
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
        <h1>Quản lý Đơn hàng Sản phẩm</h1>
        <p>Theo dõi quá trình vận chuyển và thanh toán các sản phẩm thủ công.</p>
      </div>

      {/* Direct Buy Checkout Form */}
      {directBuy && (
        <div className="card booking-form-card">
          <h3>Xác nhận Đơn hàng: {directBuy.product?.name}</h3>
          <p>
            Số lượng: <strong>{directBuy.quantity}</strong> | Đơn giá:{' '}
            <strong>{directBuy.product?.price?.toLocaleString('vi-VN')} đ</strong>
          </p>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handlePlaceOrder} className="form-grid">
            <div className="form-group">
              <label>Tên người nhận</label>
              <input
                type="text"
                required
                value={shippingAddress.recipientName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại giao hàng</label>
              <input
                type="tel"
                required
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ nhận hàng (Số nhà, đường, phường/xã)</label>
              <input
                type="text"
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Thành phố / Tỉnh</label>
              <input
                type="text"
                required
                value={shippingAddress.city}
                onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              />
            </div>
            <div className="form-actions-inline">
              <button type="submit" className="btn btn-primary">Xác nhận đặt mua</button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      <div className="bookings-list-section">
        <h3>Lịch sử đơn hàng của bạn</h3>
        {loading ? (
          <p>Đang tải đơn hàng...</p>
        ) : orders.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái đơn</th>
                  <th>Thanh toán</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id}>
                    <td>#{o._id.slice(-6).toUpperCase()}</td>
                    <td>
                      {o.items?.map((item, idx) => (
                        <div key={idx}>
                          {item.product?.name || 'Sản phẩm'} x {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td>{o.totalAmount?.toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span className={`status-badge status-${o.orderStatus?.toLowerCase()}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge payment-${o.paymentStatus?.toLowerCase()}`}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {o.paymentStatus === 'UNPAID' && o.orderStatus !== 'CANCELLED' && (
                        <button
                          onClick={() => handlePayOrder(o._id)}
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
            <p>Bạn chưa có đơn đặt mua sản phẩm nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
