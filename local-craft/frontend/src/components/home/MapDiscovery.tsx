import React from 'react';

const regions = [
  { name: 'Hà Nội', workshops: 45, artisans: 28, position: 'top-[15%] left-[42%]' },
  { name: 'Huế', workshops: 32, artisans: 20, position: 'top-[40%] left-[48%]' },
  { name: 'Đà Nẵng', workshops: 25, artisans: 15, position: 'top-[45%] left-[52%]' },
  { name: 'Hội An', workshops: 38, artisans: 24, position: 'top-[48%] left-[54%]' },
  { name: 'TP. HCM', workshops: 52, artisans: 35, position: 'top-[72%] left-[45%]' },
];

const MapDiscovery: React.FC = () => (
  <section className="py-16 md:py-20 bg-deep-earth text-white">
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
      <div className="text-center mb-12">
        <h2 className="font-headline-lg text-headline-md mb-3">Khám phá vùng miền</h2>
        <p className="text-white/70">Miền Trung Việt Nam · Nơi lưu giữ tinh hoa thủ công</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {regions.map((r) => (
          <div key={r.name} className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-center hover:bg-white/20 transition-colors cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">{r.name}</h3>
            <p className="text-sm text-white/70">{r.workshops} workshop</p>
            <p className="text-sm text-white/70">{r.artisans} nghệ nhân</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MapDiscovery;
