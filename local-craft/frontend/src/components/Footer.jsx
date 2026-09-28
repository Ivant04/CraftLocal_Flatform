import React from 'react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h3>Local Craft</h3>
          <p>Nền tảng kết nối du khách với các nghệ nhân, workshop và sản phẩm thủ công địa phương Việt Nam.</p>
        </div>
        <div className="footer-col">
          <h4>Khám phá</h4>
          <ul>
            <li>Gốm sứ truyền thống</li>
            <li>Làm lồng đèn Hội An</li>
            <li>Tranh sơn mài & Đông Hồ</li>
            <li>Mây tre đan & Điêu khắc gỗ</li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Dành cho Đối tác</h4>
          <ul>
            <li>Đăng ký trở thành Nghệ nhân</li>
            <li>Mở workshop trải nghiệm</li>
            <li>Bán sản phẩm thủ công</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Local Craft. All rights reserved. Base Architecture & Platform.</p>
      </div>
    </footer>
  );
};

export default Footer;
