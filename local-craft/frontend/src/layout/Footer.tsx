import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="bg-deep-earth text-white/80">
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏺</span>
            <span className="font-headline-lg text-xl font-bold text-white">CraftLocal</span>
          </Link>
          <p className="text-white/60 text-sm leading-relaxed">
            Chúng tôi nỗ lực gìn giữ di sản thông qua các trải nghiệm văn hóa chọn lọc và hỗ trợ cộng đồng nghệ nhân địa phương trên khắp Việt Nam.
          </p>
        </div>

        {/* Khám phá */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Khám phá</h4>
          <div className="space-y-3">
            <Link to="/workshops" className="block text-sm hover:text-white transition-colors">Trải nghiệm</Link>
            <Link to="/products" className="block text-sm hover:text-white transition-colors">Sản phẩm thủ công</Link>
            <Link to="/about" className="block text-sm hover:text-white transition-colors">Giới thiệu</Link>
          </div>
        </div>

        {/* Dành cho nghệ nhân */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Dành cho nghệ nhân</h4>
          <div className="space-y-3">
            <Link to="/register" className="block text-sm hover:text-white transition-colors">Trở thành Chủ xưởng</Link>
            <Link to="/login" className="block text-sm hover:text-white transition-colors">Bảng điều khiển Chủ xưởng</Link>
          </div>
        </div>

        {/* Liên hệ */}
        <div>
          <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">Liên hệ</h4>
          <div className="space-y-3 text-sm">
            <p>hello@craftlocal.vn</p>
            <p>+84 28 1234 5678</p>
            <p>TP. Hồ Chí Minh, Việt Nam</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-white/40">© 2025 CraftLocal. Bảo lưu mọi quyền.</p>
        <div className="flex items-center gap-6 text-xs text-white/40">
          <span className="hover:text-white/60 cursor-pointer transition-colors">Chính sách bảo mật</span>
          <span className="hover:text-white/60 cursor-pointer transition-colors">Điều khoản dịch vụ</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
