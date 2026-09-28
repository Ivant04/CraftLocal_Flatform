import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workshopService } from '../services/workshop.service';
import { productService } from '../services/product.service';

export const HomePage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wsRes, prodRes] = await Promise.allSettled([
          workshopService.getAll({ limit: 4 }),
          productService.getAll({ limit: 4 })
        ]);

        if (wsRes.status === 'fulfilled' && wsRes.value?.success) {
          setWorkshops(wsRes.value.data);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
          setProducts(prodRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Trải nghiệm Thủ công & Gặp gỡ Nghệ nhân Bản địa</h1>
          <p>
            Local Craft là nền tảng kết nối du khách với những tinh hoa làng nghề, nghệ nhân tài hoa
            và các buổi workshop làm đồ thủ công truyền thống tại Việt Nam.
          </p>
          <div className="hero-actions">
            <Link to="/workshops" className="btn btn-primary btn-large">
              Khám phá Workshops
            </Link>
            <Link to="/products" className="btn btn-outline btn-large">
              Mua Sản phẩm Thủ công
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Workshops */}
      <section className="section-container">
        <div className="section-header">
          <h2>Workshops Nổi bật</h2>
          <Link to="/workshops" className="link-more">Xem tất cả →</Link>
        </div>

        {loading ? (
          <p className="loading-text">Đang tải workshops...</p>
        ) : workshops.length > 0 ? (
          <div className="card-grid">
            {workshops.map((ws) => (
              <div key={ws._id} className="card item-card">
                <div className="card-image-placeholder">
                  {ws.images?.[0] ? (
                    <img src={ws.images[0]} alt={ws.title} />
                  ) : (
                    <span>🎪 {ws.title}</span>
                  )}
                </div>
                <div className="card-body">
                  <span className="card-badge">{ws.category?.name || 'Thủ công'}</span>
                  <h3>{ws.title}</h3>
                  <p className="card-desc">{ws.description?.slice(0, 100)}...</p>
                  <div className="card-meta">
                    <span>📍 {ws.location}</span>
                    <span className="price-tag">{ws.price?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <Link to={`/workshops/${ws._id}`} className="btn btn-primary btn-block">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Chưa có workshop nào được tạo. Hãy đăng nhập tài khoản <strong>ARTISAN</strong> để tạo workshop đầu tiên!</p>
            <Link to="/register" className="btn btn-secondary">Đăng ký làm Nghệ nhân</Link>
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="section-container">
        <div className="section-header">
          <h2>Sản phẩm Thủ công Tinh xảo</h2>
          <Link to="/products" className="link-more">Xem tất cả →</Link>
        </div>

        {loading ? (
          <p className="loading-text">Đang tải sản phẩm...</p>
        ) : products.length > 0 ? (
          <div className="card-grid">
            {products.map((p) => (
              <div key={p._id} className="card item-card">
                <div className="card-image-placeholder">
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} />
                  ) : (
                    <span>🏺 {p.name}</span>
                  )}
                </div>
                <div className="card-body">
                  <span className="card-badge">{p.category?.name || 'Sản phẩm'}</span>
                  <h3>{p.name}</h3>
                  <p className="card-desc">{p.description?.slice(0, 100)}...</p>
                  <div className="card-meta">
                    <span>Kho: {p.stock}</span>
                    <span className="price-tag">{p.price?.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <Link to={`/products/${p._id}`} className="btn btn-primary btn-block">
                    Xem sản phẩm
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Chưa có sản phẩm thủ công nào được đăng bán.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
