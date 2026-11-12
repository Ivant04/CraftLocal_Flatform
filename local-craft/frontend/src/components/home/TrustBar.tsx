import React from 'react';
import { Palette, Users, QrCode, ShieldCheck, Star } from 'lucide-react';

const TRUST_ITEMS = [
  { label: '500+', sublabel: 'Workshop văn hóa', icon: 'palette' },
  { label: '200+', sublabel: 'Nghệ nhân địa phương', icon: 'people' },
  { label: 'QR', sublabel: 'Check-in nhanh chóng', icon: 'qr_code_scanner' },
  { label: 'PayOS', sublabel: 'Thanh toán an toàn', icon: 'payments' },
  { label: '4.9★', sublabel: 'Đánh giá trung bình', icon: 'star' },
];

const iconMap: Record<string, React.ReactNode> = {
  palette: <Palette size={20} />,
  people: <Users size={20} />,
  qr_code_scanner: <QrCode size={20} />,
  payments: <ShieldCheck size={20} />,
  star: <Star size={20} className="fill-amber-400 text-amber-500" />,
};

const TrustBar: React.FC = () => (
  <section className="border-y border-[#EAD8CC]/80 bg-white shadow-xs">
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 md:gap-6 items-center">
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#FAF7F2] transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-[#964824]/8 text-[#964824] flex items-center justify-center shrink-0 border border-[#964824]/15">
              {iconMap[item.icon] || <span className="material-symbols-outlined text-xl">{item.icon}</span>}
            </div>
            <div>
              <p className="font-extrabold text-[#3D2B1F] text-lg lg:text-xl leading-none">
                {item.label}
              </p>
              <p className="text-xs font-semibold text-[#7A6255] mt-1 line-clamp-1">
                {item.sublabel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
