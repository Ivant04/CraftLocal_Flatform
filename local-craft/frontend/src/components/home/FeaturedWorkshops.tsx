import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { workshops } from '../../utils/mockData';
import WorkshopCard from './WorkshopCard';

const FeaturedWorkshops: React.FC = () => (
  <section className="py-16 md:py-20 bg-[#F5F0EA]">
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-[#964824] font-semibold text-sm tracking-wider uppercase">Được yêu thích</span>
          <h2 className="font-headline-lg text-headline-md text-[#3D2B1F] mt-2 mb-2">Trải nghiệm nổi bật</h2>
          <p className="text-[#7A6255] max-w-lg">
            Hòa mình vào các nghề thủ công truyền thống dưới sự hướng dẫn của những nghệ nhân lành nghề tại chính xưởng của họ.
          </p>
        </div>
        <Link to="/workshops" className="hidden md:flex items-center gap-2 text-[#964824] font-semibold hover:gap-3 transition-all">
          Xem tất cả <ArrowRight size={18} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {workshops.slice(0, 3).map((ws) => (
          <WorkshopCard key={ws._id} workshop={ws} />
        ))}
      </div>
      <Link to="/workshops" className="md:hidden flex items-center justify-center gap-2 mt-8 text-[#964824] font-semibold">
        Xem tất cả trải nghiệm <ArrowRight size={18} />
      </Link>
    </div>
  </section>
);

export default FeaturedWorkshops;
