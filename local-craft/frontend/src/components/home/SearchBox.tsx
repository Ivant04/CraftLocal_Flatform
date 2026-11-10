import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowRight } from 'lucide-react';

const SearchBox: React.FC = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('1');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location && location !== 'Tất cả địa điểm') params.set('location', location);
    navigate(`/workshops?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto bg-white/95 backdrop-blur-md rounded-2xl lg:rounded-full p-2.5 lg:p-3.5 shadow-[0_24px_70px_rgba(44,32,23,0.22)] border border-white/60 mt-8 lg:mt-10">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-0">
        
        {/* Destination Select */}
        <div className="flex-1 h-14 px-5 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-[#EAD8CC]/80 hover:bg-[#FAF7F2] rounded-xl lg:rounded-none transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#964824]/10 text-[#964824] flex items-center justify-center shrink-0">
            <MapPin size={18} />
          </div>
          <div className="flex-1 text-left">
            <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-[#7A6255] block">
              Địa điểm
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="text-xs lg:text-sm font-bold text-[#3D2B1F] bg-transparent outline-none w-full cursor-pointer"
            >
              <option value="">Bạn muốn đi đâu?</option>
              <option value="Hội An">Hội An, Quảng Nam</option>
              <option value="Hà Nội">Hà Nội (Bát Tràng, Vạn Phúc)</option>
              <option value="Huế">Huế (Làng nón, Gốm Phước Tích)</option>
              <option value="Đà Nẵng">Đà Nẵng (Đá mỹ nghệ Non Nước)</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
            </select>
          </div>
        </div>

        {/* Date Input */}
        <div className="flex-1 h-14 px-5 flex items-center gap-3 border-b lg:border-b-0 lg:border-r border-[#EAD8CC]/80 hover:bg-[#FAF7F2] rounded-xl lg:rounded-none transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#964824]/10 text-[#964824] flex items-center justify-center shrink-0">
            <Calendar size={18} />
          </div>
          <div className="flex-1 text-left">
            <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-[#7A6255] block">
              Ngày trải nghiệm
            </label>
            <input 
              type="date" 
              className="text-xs lg:text-sm font-bold text-[#3D2B1F] bg-transparent outline-none w-full cursor-pointer" 
            />
          </div>
        </div>

        {/* Guests Select */}
        <div className="flex-1 h-14 px-5 flex items-center gap-3 hover:bg-[#FAF7F2] rounded-xl lg:rounded-none transition-colors mb-2 lg:mb-0">
          <div className="w-8 h-8 rounded-lg bg-[#964824]/10 text-[#964824] flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
          <div className="flex-1 text-left">
            <label className="text-[10px] lg:text-[11px] font-bold uppercase tracking-wider text-[#7A6255] block">
              Số khách
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="text-xs lg:text-sm font-bold text-[#3D2B1F] bg-transparent outline-none w-full cursor-pointer"
            >
              <option value="1">1 khách</option>
              <option value="2">2 khách (Cặp đôi)</option>
              <option value="4">Nhóm 3 - 5 khách</option>
              <option value="10">Đoàn lớn (6+ khách)</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="h-12 lg:h-14 px-7 lg:px-9 flex items-center justify-center gap-2 bg-[#964824] hover:bg-[#7A3518] text-white rounded-xl lg:rounded-full font-bold text-sm lg:text-base transition-all duration-200 shadow-[0_6px_20px_rgba(150,72,36,0.35)] hover:shadow-[0_8px_25px_rgba(150,72,36,0.45)] w-full lg:w-auto shrink-0 cursor-pointer active:scale-98"
        >
          <Search size={18} />
          <span>Tìm kiếm</span>
          <ArrowRight size={16} className="hidden lg:block ml-0.5 opacity-80" />
        </button>
        
      </form>
    </div>
  );
};

export default SearchBox;
