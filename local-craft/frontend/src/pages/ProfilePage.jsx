import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const [artisanData, setArtisanData] = useState({
    studioName: '',
    bio: '',
    craftSpecialty: '',
    workshopAddress: '',
    experienceYears: 0,
    verificationStatus: 'PENDING'
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.success) {
          if (res.data.user) {
            setProfileData({
              name: res.data.user.name || '',
              phone: res.data.user.phone || ''
            });
          }
          if (res.data.artisanProfile) {
            setArtisanData({
              studioName: res.data.artisanProfile.studioName || '',
              bio: res.data.artisanProfile.bio || '',
              craftSpecialty: res.data.artisanProfile.craftSpecialty || '',
              workshopAddress: res.data.artisanProfile.workshopAddress || '',
              experienceYears: res.data.artisanProfile.experienceYears || 0,
              verificationStatus: res.data.artisanProfile.verificationStatus || 'PENDING'
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch me profile:', err);
      }
    };

    fetchFullProfile();
  }, []);

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await api.put('/users/profile', profileData);
      if (res.success) {
        setMessage('Cập nhật thông tin tài khoản thành công!');
      }
    } catch (err) {
      setError(err.message || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateArtisan = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await api.put('/artisans/profile', artisanData);
      if (res.success) {
        setMessage('Cập nhật hồ sơ xưởng thủ công thành công!');
      }
    } catch (err) {
      setError(err.message || 'Cập nhật hồ sơ nghệ nhân thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container">
      <div className="page-header">
        <h1>Hồ sơ cá nhân</h1>
        <p>Quản lý thông tin tài khoản và định danh trên hệ thống Local Craft.</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="profile-grid">
        {/* Account Details Card */}
        <div className="card profile-card">
          <h3>Thông tin cơ bản</h3>
          <div className="profile-meta-row">
            <span>Vai trò:</span>
            <strong className="badge-role">{user?.role}</strong>
          </div>
          <div className="profile-meta-row">
            <span>Trạng thái:</span>
            <strong className="status-badge status-active">{user?.status}</strong>
          </div>
          <div className="profile-meta-row">
            <span>Email:</span>
            <strong>{user?.email}</strong>
          </div>

          <form onSubmit={handleUpdateUser} className="auth-form" style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Họ và Tên</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              Lưu thay đổi
            </button>
          </form>
        </div>

        {/* Artisan Profile Card if Role is ARTISAN */}
        {user?.role === 'ARTISAN' && (
          <div className="card profile-card">
            <h3>Hồ sơ Nghệ nhân & Xưởng thủ công</h3>
            <div className="profile-meta-row">
              <span>Trạng thái duyệt:</span>
              <strong className={`status-badge status-${artisanData.verificationStatus.toLowerCase()}`}>
                {artisanData.verificationStatus}
              </strong>
            </div>

            <form onSubmit={handleUpdateArtisan} className="auth-form" style={{ marginTop: '1.5rem' }}>
              <div className="form-group">
                <label>Tên xưởng / Studio</label>
                <input
                  type="text"
                  value={artisanData.studioName}
                  onChange={(e) => setArtisanData({ ...artisanData, studioName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Chuyên môn thủ công (ví dụ: Gốm sứ, Đèn lồng, Đan mây)</label>
                <input
                  type="text"
                  value={artisanData.craftSpecialty}
                  onChange={(e) => setArtisanData({ ...artisanData, craftSpecialty: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số năm kinh nghiệm</label>
                <input
                  type="number"
                  min="0"
                  value={artisanData.experienceYears}
                  onChange={(e) => setArtisanData({ ...artisanData, experienceYears: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Địa chỉ xưởng / Không gian workshop</label>
                <input
                  type="text"
                  value={artisanData.workshopAddress}
                  onChange={(e) => setArtisanData({ ...artisanData, workshopAddress: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Tiểu sử / Giới thiệu làng nghề</label>
                <textarea
                  rows="3"
                  value={artisanData.bio}
                  onChange={(e) => setArtisanData({ ...artisanData, bio: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Cập nhật thông tin xưởng
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
