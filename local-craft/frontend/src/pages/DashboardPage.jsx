import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [stats, setStats] = useState({
    bookingsCount: 0,
    ordersCount: 0,
    workshopsCount: 0,
    productsCount: 0
  });

  const [artisanWorkshops, setArtisanWorkshops] = useState([]);
  const [artisanProducts, setArtisanProducts] = useState([]);
  const [artisanBookings, setArtisanBookings] = useState([]);
  const [artisanOrders, setArtisanOrders] = useState([]);

  // Form states for creating a new Workshop
  const [showWorkshopModal, setShowWorkshopModal] = useState(false);
  const [newWorkshop, setNewWorkshop] = useState({
    title: '',
    description: '',
    location: '',
    duration: 120,
    price: 250000,
    capacity: 10,
    availableSlots: 10
  });

  // Form states for creating a new Product
  const [showProductModal, setShowProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 150000,
    stock: 20
  });

  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    try {
      if (user?.role === 'ARTISAN') {
        const [wsRes, prodRes, bkRes] = await Promise.allSettled([
          api.get('/workshops'),
          api.get('/products'),
          api.get('/bookings/artisan')
        ]);

        if (wsRes.status === 'fulfilled' && wsRes.value?.success) {
          setArtisanWorkshops(wsRes.value.data);
          setStats((prev) => ({ ...prev, workshopsCount: wsRes.value.data.length }));
        }
        if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
          setArtisanProducts(prodRes.value.data);
          setStats((prev) => ({ ...prev, productsCount: prodRes.value.data.length }));
        }
        if (bkRes.status === 'fulfilled' && bkRes.value?.success) {
          setArtisanBookings(bkRes.value.data);
          setStats((prev) => ({ ...prev, bookingsCount: bkRes.value.data.length }));
        }
      } else {
        // Customer
        const [bkRes, ordRes] = await Promise.allSettled([
          api.get('/bookings/my'),
          api.get('/orders/my')
        ]);
        if (bkRes.status === 'fulfilled' && bkRes.value?.success) {
          setStats((prev) => ({ ...prev, bookingsCount: bkRes.value.data.length }));
        }
        if (ordRes.status === 'fulfilled' && ordRes.value?.success) {
          setStats((prev) => ({ ...prev, ordersCount: ordRes.value.data.length }));
        }
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateWorkshop = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/workshops', newWorkshop);
      if (res.success) {
        setStatusMsg('Tạo workshop thành công!');
        setShowWorkshopModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Lỗi tạo workshop');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', newProduct);
      if (res.success) {
        setStatusMsg('Tạo sản phẩm thành công!');
        setShowProductModal(false);
        loadData();
      }
    } catch (err) {
      alert(err.message || 'Lỗi tạo sản phẩm');
    }
  };

  // Render for ARTISAN
  if (user?.role === 'ARTISAN') {
    return (
      <div className="dashboard-view">
        <div className="dashboard-title-row">
          <div>
            <h2>Khu vực Quản trị Nghệ nhân & Xưởng</h2>
            <p>Chào mừng {user?.name}, quản lý workshop và sản phẩm làng nghề của bạn.</p>
          </div>
          <div className="action-buttons-group">
            <button onClick={() => setShowWorkshopModal(true)} className="btn btn-primary">
              + Thêm Workshop
            </button>
            <button onClick={() => setShowProductModal(true)} className="btn btn-secondary">
              + Đăng Sản phẩm
            </button>
          </div>
        </div>

        {statusMsg && <div className="alert alert-success">{statusMsg}</div>}

        {/* Modal: Create Workshop */}
        {showWorkshopModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Tạo Workshop Thủ công mới</h3>
              <form onSubmit={handleCreateWorkshop} className="form-grid">
                <div className="form-group">
                  <label>Tiêu đề workshop</label>
                  <input
                    type="text"
                    required
                    value={newWorkshop.title}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, title: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Địa điểm tổ chức</label>
                  <input
                    type="text"
                    required
                    value={newWorkshop.location}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giá vé (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newWorkshop.price}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, price: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Thời lượng (phút)</label>
                  <input
                    type="number"
                    min="15"
                    required
                    value={newWorkshop.duration}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, duration: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Số lượng chỗ nhận tối đa</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newWorkshop.capacity}
                    onChange={(e) =>
                      setNewWorkshop({
                        ...newWorkshop,
                        capacity: Number(e.target.value),
                        availableSlots: Number(e.target.value)
                      })
                    }
                  />
                </div>
                <div className="form-group full-width">
                  <label>Mô tả chi tiết nội dung workshop</label>
                  <textarea
                    rows="3"
                    required
                    value={newWorkshop.description}
                    onChange={(e) => setNewWorkshop({ ...newWorkshop, description: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowWorkshopModal(false)} className="btn btn-outline">
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Tạo Workshop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Product */}
        {showProductModal && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3>Đăng Sản phẩm Thủ công mới</h3>
              <form onSubmit={handleCreateProduct} className="form-grid">
                <div className="form-group">
                  <label>Tên sản phẩm</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Giá bán (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Số lượng trong kho</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Mô tả sản phẩm</label>
                  <textarea
                    rows="3"
                    required
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-outline">
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Đăng Bán Sản Phẩm
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="stat-cards-grid">
          <div className="card stat-card">
            <h4>Workshops đã mở</h4>
            <div className="stat-number">{stats.workshopsCount}</div>
            <Link to="/dashboard?tab=workshops">Quản lý workshops →</Link>
          </div>
          <div className="card stat-card">
            <h4>Sản phẩm đang bán</h4>
            <div className="stat-number">{stats.productsCount}</div>
            <Link to="/dashboard?tab=products">Quản lý sản phẩm →</Link>
          </div>
          <div className="card stat-card">
            <h4>Lượt khách đặt chỗ</h4>
            <div className="stat-number">{stats.bookingsCount}</div>
            <Link to="/dashboard?tab=bookings">Xem danh sách đặt chỗ →</Link>
          </div>
        </div>

        {/* Tab content view */}
        <div className="dashboard-tab-view" style={{ marginTop: '2rem' }}>
          {currentTab === 'workshops' && (
            <div className="card">
              <h3>Workshops của tôi</h3>
              {artisanWorkshops.length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tên Workshop</th>
                      <th>Địa điểm</th>
                      <th>Giá</th>
                      <th>Thời lượng</th>
                      <th>Chỗ trống</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisanWorkshops.map((ws) => (
                      <tr key={ws._id}>
                        <td><strong>{ws.title}</strong></td>
                        <td>{ws.location}</td>
                        <td>{ws.price?.toLocaleString('vi-VN')} đ</td>
                        <td>{ws.duration}p</td>
                        <td>{ws.availableSlots}/{ws.capacity}</td>
                        <td><span className="status-badge status-active">{ws.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Bạn chưa tạo workshop nào.</p>
              )}
            </div>
          )}

          {currentTab === 'products' && (
            <div className="card">
              <h3>Sản phẩm thủ công của tôi</h3>
              {artisanProducts.length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tên Sản phẩm</th>
                      <th>Giá</th>
                      <th>Kho</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisanProducts.map((p) => (
                      <tr key={p._id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.price?.toLocaleString('vi-VN')} đ</td>
                        <td>{p.stock}</td>
                        <td><span className="status-badge status-active">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Bạn chưa đăng bán sản phẩm nào.</p>
              )}
            </div>
          )}

          {currentTab === 'bookings' && (
            <div className="card">
              <h3>Khách hàng đã đặt workshop</h3>
              {artisanBookings.length > 0 ? (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Khách hàng</th>
                      <th>Workshop</th>
                      <th>Số khách</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisanBookings.map((b) => (
                      <tr key={b._id}>
                        <td>{b.customer?.name} ({b.customer?.phone})</td>
                        <td>{b.workshop?.title}</td>
                        <td>{b.quantity}</td>
                        <td>{b.totalAmount?.toLocaleString('vi-VN')} đ</td>
                        <td><span className="status-badge status-active">{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Chưa có lượt khách nào đặt workshop.</p>
              )}
            </div>
          )}

          {currentTab === 'overview' && (
            <div className="card">
              <h3>Hoạt động gần đây</h3>
              <p>Hệ thống sẵn sàng kết nối và tiếp nhận đặt chỗ từ khách du lịch. Hãy cập nhật đầy đủ thông tin xưởng và workshop của bạn.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render for CUSTOMER
  return (
    <div className="dashboard-view">
      <div className="dashboard-title-row">
        <div>
          <h2>Chào mừng quay trở lại, {user?.name}!</h2>
          <p>Tài khoản Khách hàng / Du khách: Theo dõi các trải nghiệm làng nghề và sản phẩm bạn quan tâm.</p>
        </div>
      </div>

      <div className="stat-cards-grid">
        <div className="card stat-card">
          <h4>Workshops đã đặt</h4>
          <div className="stat-number">{stats.bookingsCount}</div>
          <Link to="/booking">Xem chi tiết lịch đặt →</Link>
        </div>
        <div className="card stat-card">
          <h4>Đơn hàng thủ công</h4>
          <div className="stat-number">{stats.ordersCount}</div>
          <Link to="/orders">Xem lịch sử đơn hàng →</Link>
        </div>
        <div className="card stat-card">
          <h4>Hồ sơ của bạn</h4>
          <div className="stat-number">👤</div>
          <Link to="/profile">Cập nhật hồ sơ →</Link>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Khám phá tiếp tục</h3>
        <p>Tìm thêm các workshop hấp dẫn hoặc đặt mua tác phẩm thủ công trực tiếp từ nghệ nhân bản địa.</p>
        <div className="action-buttons-group" style={{ marginTop: '1rem' }}>
          <Link to="/workshops" className="btn btn-primary">Tìm Workshops</Link>
          <Link to="/products" className="btn btn-outline">Tìm Sản phẩm</Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
