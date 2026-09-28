import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

export const AdminDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const [users, setUsers] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workshops, setWorkshops] = useState([]);
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', type: 'BOTH' });
  const [msg, setMsg] = useState('');

  const loadTabData = async () => {
    setLoading(true);
    setMsg('');
    try {
      if (tab === 'overview' || tab === 'users') {
        const u = await api.get('/users');
        if (u.success) setUsers(u.data);
      }
      if (tab === 'overview' || tab === 'artisans') {
        const a = await api.get('/artisans');
        if (a.success) setArtisans(a.data);
      }
      if (tab === 'overview' || tab === 'categories') {
        const c = await api.get('/categories');
        if (c.success) setCategories(c.data);
      }
      if (tab === 'workshops') {
        const w = await api.get('/workshops');
        if (w.success) setWorkshops(w.data);
      }
      if (tab === 'products') {
        const p = await api.get('/products');
        if (p.success) setProducts(p.data);
      }
      if (tab === 'bookings') {
        const b = await api.get('/bookings');
        if (b.success) setBookings(b.data);
      }
      if (tab === 'orders') {
        const o = await api.get('/orders');
        if (o.success) setOrders(o.data);
      }
    } catch (err) {
      console.error('Error fetching admin tab data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTabData();
  }, [tab]);

  const handleVerifyArtisan = async (artisanId, status) => {
    try {
      const res = await api.patch(`/artisans/${artisanId}/status`, { status });
      if (res.success) {
        setMsg(`Cập nhật trạng thái nghệ nhân thành: ${status}`);
        loadTabData();
      }
    } catch (err) {
      alert(err.message || 'Lỗi cập nhật');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', newCategory);
      if (res.success) {
        setMsg('Tạo danh mục mới thành công!');
        setNewCategory({ name: '', slug: '', description: '', type: 'BOTH' });
        loadTabData();
      }
    } catch (err) {
      alert(err.message || 'Lỗi tạo danh mục');
    }
  };

  return (
    <div className="dashboard-view admin-dashboard">
      <div className="dashboard-title-row">
        <div>
          <h2>Quản trị viên Hệ thống (Admin Portal)</h2>
          <p>Quản lý toàn diện người dùng, nghệ nhân, workshop, sản phẩm và danh mục.</p>
        </div>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Overview stats */}
      <div className="stat-cards-grid">
        <div className="card stat-card">
          <h4>Tổng Người dùng</h4>
          <div className="stat-number">{users.length}</div>
        </div>
        <div className="card stat-card">
          <h4>Nghệ nhân liên kết</h4>
          <div className="stat-number">{artisans.length}</div>
        </div>
        <div className="card stat-card">
          <h4>Danh mục hoạt động</h4>
          <div className="stat-number">{categories.length}</div>
        </div>
      </div>

      <div className="admin-content-area" style={{ marginTop: '2rem' }}>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            {/* Users Tab */}
            {tab === 'users' && (
              <div className="card">
                <h3>Danh sách Người dùng</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Email</th>
                      <th>Số điện thoại</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{u.phone || 'Chưa cập nhật'}</td>
                        <td><span className="badge-role">{u.role}</span></td>
                        <td><span className={`status-badge status-${u.status?.toLowerCase()}`}>{u.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Artisans Tab (Approve / Reject) */}
            {tab === 'artisans' && (
              <div className="card">
                <h3>Duyệt & Quản lý Nghệ nhân</h3>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tên Xưởng</th>
                      <th>Người đại diện</th>
                      <th>Chuyên môn</th>
                      <th>Trạng thái duyệt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisans.map((a) => (
                      <tr key={a._id}>
                        <td>{a.studioName}</td>
                        <td>{a.user?.name} ({a.user?.email})</td>
                        <td>{a.craftSpecialty}</td>
                        <td>
                          <span className={`status-badge status-${a.verificationStatus?.toLowerCase()}`}>
                            {a.verificationStatus}
                          </span>
                        </td>
                        <td>
                          {a.verificationStatus === 'PENDING' && (
                            <div className="action-buttons-inline">
                              <button
                                onClick={() => handleVerifyArtisan(a._id, 'APPROVED')}
                                className="btn btn-primary btn-small"
                              >
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleVerifyArtisan(a._id, 'REJECTED')}
                                className="btn btn-outline btn-small"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Categories Tab */}
            {tab === 'categories' && (
              <div className="card">
                <h3>Quản lý Danh mục</h3>
                <form onSubmit={handleCreateCategory} className="form-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Tên danh mục</label>
                    <input
                      type="text"
                      required
                      placeholder="Gốm sứ Bát Tràng"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          name: e.target.value,
                          slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>Slug URL</label>
                    <input
                      type="text"
                      required
                      placeholder="gom-su-bat-trang"
                      value={newCategory.slug}
                      onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Loại áp dụng</label>
                    <select
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value })}
                    >
                      <option value="BOTH">Cả Workshop & Sản phẩm</option>
                      <option value="WORKSHOP">Chỉ Workshop</option>
                      <option value="PRODUCT">Chỉ Sản phẩm</option>
                    </select>
                  </div>
                  <div className="form-actions-inline">
                    <button type="submit" className="btn btn-primary">Thêm danh mục</button>
                  </div>
                </form>

                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Tên</th>
                      <th>Slug</th>
                      <th>Loại</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{c.slug}</td>
                        <td>{c.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Default overview */}
            {tab === 'overview' && (
              <div className="card">
                <h3>Bảng điều khiển hệ thống</h3>
                <p>Chọn các mục từ menu bên trái để quản lý Người dùng, Nghệ nhân, Danh mục, Đơn hàng và Workshop.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
