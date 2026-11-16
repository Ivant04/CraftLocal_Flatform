import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Compass, ArrowUpRight } from 'lucide-react';

const regions = [
  { name: 'Hà Nội', highlight: 'Gốm Bát Tràng, Lụa Vạn Phúc', workshops: 45, artisans: 28 },
  { name: 'Huế', highlight: 'Nón bài thơ, Gốm Phước Tích', workshops: 32, artisans: 20 },
  { name: 'Đà Nẵng', highlight: 'Đá Non Nước, Chiếu Cẩm Nê', workshops: 25, artisans: 15 },
  { name: 'Hội An', highlight: 'Đèn lồng phố cổ, Gốm Thanh Hà', workshops: 38, artisans: 24 },
  { name: 'TP. HCM', highlight: 'Thêu tay nghệ thuật, Đồ da thủ công', workshops: 52, artisans: 35 },
];

const MapDiscovery: React.FC = () => (
  <section className="py-20 md:py-24 bg-[#2C2017] text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#964824]/20 via-transparent to-transparent pointer-events-none" />

    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 relative z-10">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-[#E9C176] mb-3">
          <Compass size={14} />
          <span>Bản đồ hành trình di sản</span>
        </span>
        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
          Khám phá theo vùng miền
        </h2>
        <p className="text-white/70 text-sm md:text-base leading-relaxed">
          Mỗi tấc đất Việt Nam đều mang trong mình những câu chuyện làng nghề độc nhất vô nhị. Chọn điểm đến tiếp theo của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {regions.map((r) => (
          <Link
            key={r.name}
            to={`/workshops?location=${encodeURIComponent(r.name)}`}
            className="group p-5 md:p-6 rounded-2xl bg-white/6 hover:bg-white/12 border border-white/10 hover:border-[#E9C176]/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#964824]/40 text-[#E9C176] flex items-center justify-center">
                  <MapPin size={18} />
                </div>
                <ArrowUpRight size={16} className="text-white/40 group-hover:text-[#E9C176] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <h3 className="font-headline text-xl font-bold text-white group-hover:text-[#E9C176] transition-colors mb-1">
                {r.name}
              </h3>
              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-4">
                {r.highlight}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white/80">
              <span>{r.workshops} workshop</span>
              <span className="text-[#E9C176]">{r.artisans} nghệ nhân</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default MapDiscovery;
