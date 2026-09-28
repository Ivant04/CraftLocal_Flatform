import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export const ArtisanDetailPage = () => {
  const { id } = useParams();
  const [artisan, setArtisan] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        const res = await api.get(`/artisans/${id}`);
        if (res.success) {
          setArtisan(res.data);
        }

        // Fetch workshops & products of this artisan
        const [wsRes, prodRes] = await Promise.allSettled([
          api.get(`/workshops?artisan=${id}`),
          api.get(`/products?artisan=${id}`)
        ]);

        if (wsRes.status === 'fulfilled' && wsRes.value?.success) {
          setWorkshops(wsRes.value.data);
        }
        if (prodRes.status === 'fulfilled' && prodRes.value?.success) {
          setProducts(prodRes.value.data);
        }
      } catch (err) {
        console.error('Error fetching artisan details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtisanData();
  }, [id]);

  if (loading) return <div className="section-container"><p>Đang tải thông tin nghệ nhân...</p></div>;
  if (!artisan) return <div className="section-container"><p className="alert alert-error">Không tìm thấy thông tin nghệ nhân.</p></div>;

  return (
    <div className="section-container">
      <div className="artisan-profile-header">
        <div className="artisan-avatar-large">👨‍🎨</div>
        <div className="artisan-info-main">
          <h1>{artisan.studioName}</h1>
          <p className="artisan-lead">Nghệ nhân: <strong>{artisan.user?.name}</strong></p>
          <div className="artisan-tags">
            <span className="badge">Chuyên môn: {artisan.craftSpecialty}</span>
            <span className="badge">Kinh nghiệm: {artisan.experienceYears} năm</span>
            <span className="badge">Đánh giá: ⭐ {artisan.rating} / 5 ({artisan.totalReviews} lượt)</span>
          </div>
          <p className="artisan-bio">{artisan.bio || 'Chưa cập nhật tiểu sử nghệ nhân.'}</p>
          <p>📍 <strong>Địa chỉ xưởng:</strong> {artisan.workshopAddress || 'Chưa cập nhật địa chỉ'}</p>
        </div>
      </div>

      {/* Artisan Workshops */}
      <div className="artisan-content-section">
        <h3>Workshops do {artisan.studioName} tổ chức</h3>
        {workshops.length > 0 ? (
          <div className="card-grid">
            {workshops.map((ws) => (
              <div key={ws._id} className="card item-card">
                <div className="card-body">
                  <h4>{ws.title}</h4>
                  <p>{ws.location}</p>
                  <p className="price-tag">{ws.price?.toLocaleString('vi-VN')} đ</p>
                  <Link to={`/workshops/${ws._id}`} className="btn btn-primary btn-block">Xem workshop</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">Chưa có workshop nào được công bố.</p>
        )}
      </div>

      {/* Artisan Products */}
      <div className="artisan-content-section">
        <h3>Sản phẩm thủ công của {artisan.studioName}</h3>
        {products.length > 0 ? (
          <div className="card-grid">
            {products.map((p) => (
              <div key={p._id} className="card item-card">
                <div className="card-body">
                  <h4>{p.name}</h4>
                  <p className="price-tag">{p.price?.toLocaleString('vi-VN')} đ</p>
                  <Link to={`/products/${p._id}`} className="btn btn-primary btn-block">Xem sản phẩm</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">Chưa có sản phẩm nào được đăng bán.</p>
        )}
      </div>
    </div>
  );
};

export default ArtisanDetailPage;
