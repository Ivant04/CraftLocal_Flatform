import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';
import artisanStoryImg from '../../assets/images/artisan-story.jpg';

const StorySection: React.FC = () => (
  <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 overflow-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      {/* Visual Frame */}
      <div className="relative">
        <div className="relative rounded-3xl overflow-hidden shadow-[0_24px_60px_rgba(61,43,31,0.14)] border-4 border-white">
          <img
            src={artisanStoryImg}
            alt="Câu chuyện nghệ nhân"
            className="w-full h-[380px] sm:h-[460px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dqkclqqlw/image/upload/v1783659948/craftlocal/hero/artisan-story.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating Quote Card */}
          <div className="absolute bottom-6 left-6 right-6 p-4 md:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg">
            <p className="text-xs md:text-sm italic font-serif text-[#3D2B1F] leading-relaxed">
              "Bàn tay làm nên gốm, nhưng trái tim lưu giữ hồn quê. Mỗi du khách đến đây là một người bạn nối dài ngọn lửa nghề."
            </p>
            <p className="text-[11px] font-bold text-[#964824] uppercase tracking-wider mt-2">
              — Nghệ nhân Nguyễn Văn Bảy (Làng gốm Bát Tràng)
            </p>
          </div>
        </div>

        {/* Decorative badge */}
        <div className="absolute -top-4 -right-4 hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#964824] text-white shadow-lg animate-float">
          <Sparkles size={16} className="text-[#E9C176]" />
          <span className="text-xs font-bold">100% Nghề thủ công thật</span>
        </div>
      </div>

      {/* Narrative Text */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#964824]/10 text-[#964824] rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <HeartHandshake size={14} />
          <span>Sứ mệnh kết nối & gìn giữ</span>
        </span>
        
        <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D2B1F] tracking-tight leading-[1.15] mt-1 mb-4">
          Không chỉ là chuyến đi,<br />
          <span className="text-[#964824]">mà là sự gắn kết linh hồn.</span>
        </h2>
        <div className="craft-hatch-accent mb-6" aria-hidden="true" />
        
        <p className="text-[#5A4A41] text-sm md:text-base leading-relaxed mb-4">
          CraftLocal ra đời với mong muốn hồi sinh sự quan tâm của thế hệ trẻ và du khách quốc tế đối với các làng nghề truyền thống Việt Nam. Chúng tôi tin rằng giá trị lớn nhất của một món đồ thủ công không nằm ở vẻ ngoài lộng lẫy, mà là thời gian, giọt mồ hôi và tâm huyết của người thợ đặt vào từng thớ gỗ, nhát búa.
        </p>
        
        <p className="text-[#5A4A41] text-sm md:text-base leading-relaxed mb-8">
          Mỗi lượt đặt workshop không chỉ mang lại cho bạn những phút giây thư thái và một kỷ vật độc bản, mà còn trực tiếp tạo nguồn thu bền vững, giúp các cụ già và thanh niên địa phương tiếp tục an tâm bám nghề.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-4 mb-8 pt-4 border-t border-[#EAD8CC]/80">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#384B3F]/10 text-[#2D5A43] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-[#3D2B1F]">Hỗ trợ trực tiếp</p>
              <p className="text-xs text-[#7A6255]">85% doanh thu đến tay nghệ nhân</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#964824]/10 text-[#964824] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-[#3D2B1F]">Tuyển chọn kỹ</p>
              <p className="text-xs text-[#7A6255]">Lớp học nhóm nhỏ, kèm 1:1</p>
            </div>
          </div>
        </div>

        <Link
          to="/about"
          className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#964824] hover:bg-[#7A3518] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all group"
        >
          <span>Tìm hiểu thêm về câu chuyện</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </section>
);

export default StorySection;
