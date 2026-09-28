import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="error-page">
      <div className="error-card">
        <h1 className="error-code">404</h1>
        <h2>Không tìm thấy trang</h2>
        <p>Đường dẫn bạn yêu cầu không tồn tại hoặc đã được thay đổi.</p>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">Về Trang chủ</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
