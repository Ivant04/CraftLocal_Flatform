import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { workshopService } from '../services/workshop.service';

export const WorkshopsPage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWorkshops = async (keyword = '') => {
    setLoading(true);
    try {
      const res = await workshopService.getAll({ search: keyword });
      if (res.success) {
        setWorkshops(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkshops(search);
  };

  return (
    <div className="section-container">
      <div className="page-header">
        <h1>Khám phá Workshops Thủ công</h1>
        <p>Tham gia các lớp trải nghiệm làm gốm, đèn lồng, tranh dân gian cùng các nghệ nhân bản địa.</p>
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Tìm kiếm workshop theo tên, địa điểm, mô tả..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Tìm kiếm</button>
        </form>
      </div>

      {loading ? (
        <p className="loading-text">Đang tải danh sách workshop...</p>
      ) : workshops.length > 0 ? (
        <div className="card-grid">
          {workshops.map((ws) => (
            <div key={ws._id} className="card item-card">
              <div className="card-image-placeholder">
                {ws.images?.[0] ? <img src={ws.images[0]} alt={ws.title} /> : <span>🎪</span>}
              </div>
              <div className="card-body">
                <span className="card-badge">{ws.category?.name || 'Workshop'}</span>
                <h3>{ws.title}</h3>
                <p className="card-artisan">
                  Nghệ nhân: {ws.artisan?.user?.name || ws.artisan?.studioName || 'Bản địa'}
                </p>
                <p className="card-desc">{ws.description?.slice(0, 90)}...</p>
                <div className="card-meta">
                  <span>⏱️ {ws.duration} phút</span>
                  <span>👥 Còn {ws.availableSlots} chỗ</span>
                </div>
                <div className="card-footer">
                  <span className="price-tag">{ws.price?.toLocaleString('vi-VN')} đ</span>
                  <Link to={`/workshops/${ws._id}`} className="btn btn-primary">
                    Chi tiết & Đặt chỗ
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>Hiện chưa có workshop nào phù hợp với tìm kiếm.</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopsPage;
