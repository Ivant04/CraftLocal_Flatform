import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, QrCode, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  { icon: <CalendarCheck size={22} />, text: 'Quản lý lịch trình và số chỗ dễ dàng' },
  { icon: <QrCode size={22} />, text: 'Check-in khách bằng mã QR đơn giản' },
  { icon: <BarChart3 size={22} />, text: 'Tích hợp thanh toán và dashboard doanh thu' },
];

const HostSection: React.FC = () => (
  <section className="py-16 md:py-24 bg-gradient-to-br from-[#3D2B1F] via-[#4A3428] to-[#3D2B1F] relative overflow-hidden">
    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-block px-4 py-1.5 bg-[#964824] text-white text-xs font-semibold tracking-wider uppercase rounded-full mb-6">Dành cho nghệ nhân</span>
          <h2 className="font-headline-lg text-3xl md:text-4xl text-white mt-2 mb-6 leading-snug">
            Chia sẻ nghề thủ công<br className="hidden md:inline" /> của bạn với thế giới.
          </h2>
          <p className="text-white/70 leading-relaxed mb-8 text-lg">
            Tham gia CraftLocal để tổ chức workshop, bán sản phẩm thủ công và quản lý đặt lịch dễ dàng. Chúng tôi lo phần công nghệ để bạn tập trung vào nghệ thuật của mình.
          </p>
          <div className="space-y-4 mb-10">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-[#FFB597] shrink-0">
                  {f.icon}
                </div>
                <span className="text-white/90 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-[#964824] text-white rounded-2xl font-semibold hover:bg-[#7A3518] transition-all shadow-[0_10px_24px_rgba(150,72,36,0.35)] active:scale-[0.98]">
            Trở thành Chủ xưởng <ArrowRight size={18} />
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#964824] flex items-center justify-center"><span className="text-lg">🏺</span></div>
            <div>
              <p className="font-semibold text-white">Bảng điều khiển Chủ xưởng</p>
              <p className="text-xs text-white/50">CraftLocal</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white/10 rounded-2xl p-4"><p className="text-2xl font-bold text-white">24</p><p className="text-xs text-white/60">Lượt đặt hôm nay</p></div>
            <div className="bg-white/10 rounded-2xl p-4"><p className="text-2xl font-bold text-emerald-400">12.5M</p><p className="text-xs text-white/60">Doanh thu</p></div>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-3">
            <QrCode size={24} className="text-[#FFB597]" />
            <div><p className="text-sm font-medium text-white">Quét vé khách hàng</p><p className="text-xs text-white/50">Check-in QR nhanh chóng</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HostSection;
