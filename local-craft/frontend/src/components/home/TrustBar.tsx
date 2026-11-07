import React from 'react';
import { trustItems } from '../../utils/mockData';

const TrustBar: React.FC = () => (
  <section className="border-y border-[#EAD8CC] bg-white">
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-5">
      <div className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-4">
        {trustItems.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-xl bg-[#964824]/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#964824] text-xl">{item.icon}</span>
            </div>
            <div>
              <p className="font-bold text-[#3D2B1F] text-lg leading-tight">{item.label}</p>
              <p className="text-xs text-[#7A6255]">{item.sublabel}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
