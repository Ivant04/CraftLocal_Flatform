import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workshopService } from '../services/workshop.service';
import { useAuth } from '../hooks/useAuth';

export const WorkshopDetailPage = () => {
  const { id } = useParams();
  const [workshop, setWorkshop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWorkshop = async () => {
      try {
        const res = await workshopService.getById(id);
        if (res.success) {
          setWorkshop(res.data);
        }
      } catch (err) {
        setError('Không tìm thấy thông tin workshop hoặc đã xảy ra lỗi.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshop();
  }, [id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/booking?workshopId=${id}` } } });
      return;
    }
    navigate(`/booking?workshopId=${id}`);
  };

  if (loading) return <div className="section-container"><p>Đang tải chi tiết workshop...</p></div>;
  if (error || !workshop) return <div className="section-container"><p className="alert alert-error">{error || 'Không tìm thấy workshop'}</p></div>;

  return (
    <div className="section-container">
      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-image-box">
            {workshop.images?.[0] ? (
              <img src={workshop.images[0]} alt={workshop.title} />
            ) : (
              <div className="detail-placeholder">🎪 {workshop.title}</div>
            )}
          </div>
          <h1>{workshop.title}</h1>
          <p className="detail-category">Danh mục: <strong>{workshop.category?.name || 'Thủ công mỹ nghệ'}</strong></p>
          <div className="detail-description">
            <h3>Giới thiệu buổi workshop</h3>
            <p>{workshop.description}</p>
          </div>
        </div>

        <div className="detail-sidebar">
          <div className="booking-card">
            <div className="price-display">
              <span className="amount">{workshop.price?.toLocaleString('vi-VN')} đ</span>
              <span className="unit">/ người</span>
            </div>

            <ul className="workshop-specs">
              <li>📍 <strong>Địa điểm:</strong> {workshop.location}</li>
              <li>⏱️ <strong>Thời lượng:</strong> {workshop.duration} phút</li>
              <li>👥 <strong>Sức chứa:</strong> {workshop.capacity} người</li>
              <li>🎟️ <strong>Còn trống:</strong> {workshop.availableSlots} chỗ</li>
            </ul>

            <div className="artisan-info-card">
              <h4>Nghệ nhân phụ trách</h4>
              <p><strong>{workshop.artisan?.studioName || 'Xưởng thủ công'}</strong></p>
              <p>Nghệ nhân: {workshop.artisan?.user?.name || 'Nghệ nhân bản địa'}</p>
              {workshop.artisan?._id && (
                <Link to={`/artisans/${workshop.artisan._id}`} className="link-artisan">
                  Xem hồ sơ nghệ nhân →
                </Link>
              )}
            </div>

            <button
              onClick={handleBooking}
              className="btn btn-primary btn-block btn-large"
              disabled={workshop.availableSlots <= 0}
            >
              {workshop.availableSlots > 0 ? 'Đặt chỗ Workshop ngay' : 'Đã hết chỗ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopDetailPage;
