import React from 'react';
import { Link } from 'react-router-dom';

export const ForbiddenPage = () => {
  return (
    <div className="error-page">
      <div className="error-card">
        <h1 className="error-code">403</h1>
        <h2>Truy cập bị từ chối (Forbidden)</h2>
        <p>Tài khoản của bạn không có quyền truy cập vào khu vực này.</p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">Về Trang chủ</Link>
          <Link to="/dashboard" className="btn btn-outline">Về Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
