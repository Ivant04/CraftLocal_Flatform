import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Users, Star, Sparkles, ShieldCheck, Compass, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import storyArtisanImg from '../../assets/images/story-artisan.jpg';

const values = [
  { 
    icon: <Heart size={28} />, 
    title: 'Gìn giữ di sản', 
    desc: 'Hỗ trợ các nghệ nhân bảo tồn kỹ thuật thủ công cổ truyền lâu đời, từ gốm Chu Đậu, lụa Vạn Phúc đến sơn mài Hạ Thái.' 
  },
  { 
    icon: <Globe size={28} />, 
    title: 'Du lịch bền vững', 
    desc: 'Thúc đẩy mô hình du lịch trải nghiệm có trách nhiệm, giảm tác động tiêu cực và lan tỏa tình yêu văn hóa dân tộc.' 
  },
  { 
    icon: <Users size={28} />, 
    title: 'Trao quyền cộng đồng', 
    desc: 'Tạo dòng doanh thu trực tiếp và công bằng cho nghệ nhân bản địa mà không qua tầng lớp trung gian thương mại.' 
  },
  { 
    icon: <Star size={28} />, 
    title: 'Trải nghiệm chọn lọc', 
    desc: 'Mỗi xưởng thực hành đều được thẩm định nghiêm ngặt về độ an toàn, chất lượng vật liệu và tính sư phạm của nghệ nhân.' 
  },
];

const milestones = [
  { number: '150+', label: 'Nghệ nhân bản địa hợp tác' },
  { number: '24+', label: 'Làng nghề di sản khắp Việt Nam' },
  { number: '12,000+', label: 'Du khách đã trải nghiệm' },
  { number: '98%', label: 'Tỉ lệ hài lòng và giới thiệu' },
];

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-craft-contour pb-20">
      {/* Editorial Hero */}
      <section className="relative bg-deep-earth text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-craft-contour-dark pointer-events-none" aria-hidden="true" />
        
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 relative z-10 text-center">
          <Badge variant="subtle" size="md" className="mb-6 bg-white/10 text-accent-gold border-white/20">
            <Sparkles size={14} className="mr-1.5 inline" /> Sứ mệnh của chúng tôi
          </Badge>
          
          <h1 className="font-headline text-3xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight">
            Kết nối nhịp đập đương đại với tinh hoa thủ công Việt Nam
          </h1>
          
          <p className="text-white/80 text-base md:text-xl max-w-3xl mx-auto leading-relaxed font-light">
            CraftLocal ra đời từ khát khao gìn giữ những giá trị văn hóa ngàn năm, mang du khách đến tận bàn xoay,
            khung cửi và lò nung để tự tay cảm nhận hồn cốt đất mẹ cùng những nghệ nhân kiên trì giữ lửa.
          </p>
        </div>
      </section>

      {/* Metrics Banner */}
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl border border-outline-subtle p-6 md:p-8 shadow-lg grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {milestones.map((item, idx) => (
            <div key={idx} className="p-2">
              <span className="font-headline text-3xl md:text-4xl font-extrabold text-primary block mb-1">
                {item.number}
              </span>
              <span className="text-xs md:text-sm text-on-surface-variant font-medium">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story & Philosophy */}
      <section className="py-20 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">Câu chuyện thương hiệu</span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-deep-earth leading-snug">
              Mỗi sản phẩm thủ công là một pho sử sống
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Trong thời đại công nghiệp hóa nhanh chóng, những làng nghề truyền thống đang dần vắng bóng bàn tay trẻ. 
              Các nghệ nhân lão làng nắm giữ những bí quyết cha truyền con nối qua hàng thế kỷ, nhưng thiếu kênh 
              kết nối để lan tỏa đến cộng đồng du khách trẻ và quốc tế.
            </p>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              CraftLocal không chỉ là một cổng đặt vé, mà là nhịp cầu văn hóa bền chặt. Chúng tôi số hóa trải nghiệm 
              làng nghề, biến mỗi chuyến ghé thăm thành một giờ học di sản sống động, nơi bạn được bồi đắp lòng trắc ẩn, 
              sự tĩnh tại và tự hào về bàn tay khéo léo của người Việt.
            </p>
            <div className="pt-2">
              <Link to="/workshops">
                <Button variant="primary" size="lg">
                  Khám phá các làng nghề <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl aspect-4/3 border-4 border-white">
              <img 
                src={storyArtisanImg} 
                alt="Nghệ nhân Việt Nam" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dqkclqqlw/image/upload/v1783659948/craftlocal/hero/artisan-story.jpg';
                }}
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-deep-earth text-white p-5 rounded-2xl max-w-xs shadow-xl hidden sm:block">
              <p className="text-xs italic text-accent-gold mb-1">"Bàn tay làm đất, tâm hồn hướng sáng"</p>
              <p className="text-xs font-semibold">— Nghệ nhân gốm Bát Tràng</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white border-y border-outline-subtle">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-primary">Triết lý hành động</span>
            <h2 className="font-headline text-3xl font-bold text-deep-earth mt-2 mb-4">
              4 Giá trị cốt lõi dẫn đường
            </h2>
            <p className="text-on-surface-variant text-sm">
              Chúng tôi cam kết xây dựng một hệ sinh thái tôn trọng nguồn cội văn hóa và tạo giá trị lâu dài cho con người.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div 
                key={v.title} 
                className="p-7 rounded-2xl bg-surface-warm border border-outline-subtle hover:border-primary/40 hover:-translate-y-1 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 text-primary">
                  {v.icon}
                </div>
                <h3 className="font-bold text-lg text-deep-earth mb-2 font-headline">{v.title}</h3>
                <p className="text-on-surface-variant text-xs md:text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dual CTA */}
      <section className="py-20 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="bg-primary/10 rounded-3xl p-8 md:p-14 border border-primary/20 text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto relative z-10">
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-deep-earth mb-4">
              Cùng chúng tôi lan tỏa di sản Việt
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base mb-8 leading-relaxed">
              Dù bạn là một du khách yêu thích nét đẹp truyền thống hay một nghệ nhân tâm huyết muốn giới thiệu xưởng của mình, CraftLocal luôn rộng cửa chào đón bạn.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/workshops">
                <Button variant="primary" size="lg">Đặt lịch Workshop ngay</Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg">Đăng ký trở thành Nghệ nhân / Chủ xưởng</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
