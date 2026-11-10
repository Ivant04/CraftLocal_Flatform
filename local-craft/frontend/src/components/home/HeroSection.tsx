import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import SearchBox from './SearchBox';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

const slides = [
  {
    image: '/src/assets/images/hero-workshop.jpg',
    tag: 'Di sản & Làng nghề',
    title: 'Trải nghiệm văn hóa',
    subtitle: 'cùng nghệ nhân địa phương',
    desc: 'Đặt lịch trải nghiệm thực tế, trực tiếp chạm tay vào đất sét, sợi tơ và mang về những tác phẩm thủ công mang đậm linh hồn Việt.',
  },
  {
    image: '/src/assets/images/pottery-workshop.jpg',
    tag: 'Gốm sứ Bát Tràng',
    title: 'Nghệ thuật vuốt gốm',
    subtitle: 'truyền thống ngàn năm',
    desc: 'Tự tay xoay bàn chuốt, nặn hình và sáng tạo men gốm dưới sự chỉ bảo tận tình của các nghệ nhân gạo cội.',
  },
  {
    image: '/src/assets/images/lantern-workshop.jpg',
    tag: 'Phố cổ Hội An',
    title: 'Sắc màu lồng đèn',
    subtitle: 'di sản văn hóa sống',
    desc: 'Học cách uốn nan tre, dán lụa Hà Đông và mang một góc lung linh của phố Hội về ngôi nhà của bạn.',
  },
  {
    image: '/src/assets/images/textile-workshop.jpg',
    tag: 'Dệt thổ cẩm Tây Bắc',
    title: 'Nghệ thuật sợi tơ',
    subtitle: 'hoa văn của đại ngàn',
    desc: 'Khám phá kỹ thuật nhuộm chàm tự nhiên và dệt vải lanh cùng đồng bào dân tộc vùng cao.',
  },
  {
    image: '/src/assets/images/artisan-story.jpg',
    tag: 'Kết nối con người',
    title: 'Câu chuyện nghệ nhân',
    subtitle: 'giữ lửa nghề truyền thống',
    desc: 'Lắng nghe hành trình gìn giữ di sản và hòa mình vào nhịp sống thường nhật của những làng nghề bình dị.',
  },
];

const quickTags = [
  { label: 'Gốm Bát Tràng', query: 'Gốm sứ' },
  { label: 'Đèn lồng Hội An', query: 'Đèn lồng' },
  { label: 'Dệt vải thổ cẩm', query: 'Dệt vải' },
  { label: 'Làm nón lá Huế', query: 'Làm nón' },
  { label: 'Đan tre nứa', query: 'Mây tre đan' },
];

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 900);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6500);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative min-h-[640px] md:min-h-[720px] lg:min-h-[780px] flex items-center justify-center overflow-hidden py-16 lg:py-24">
      {/* Carousel Background Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
          style={{
            opacity: index === current ? 1 : 0,
            transform: index === current ? 'scale(1)' : 'scale(1.08)',
          }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Deep Gradient Overlays for High Legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/60 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-[1]" />

      {/* Navigation Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-white hover:text-[#964824] transition-all opacity-0 md:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 lg:w-13 lg:h-13 rounded-full bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-white hover:text-[#964824] transition-all opacity-0 md:opacity-100 hover:scale-105 cursor-pointer shadow-lg"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 flex flex-col items-center text-center">
        {/* Category Pill Tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-bold uppercase tracking-wider mb-5 shadow-sm">
          <Sparkles size={14} className="text-[#E9C176]" />
          <span>{slides[current].tag}</span>
        </div>

        {/* Dynamic Animated Headline */}
        <div className="relative min-h-[110px] md:min-h-[140px] lg:min-h-[160px] w-full max-w-4xl flex items-center justify-center mb-3">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
              style={{
                opacity: index === current ? 1 : 0,
                transform: index === current ? 'translateY(0)' : 'translateY(16px)',
                pointerEvents: index === current ? 'auto' : 'none',
              }}
            >
              <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-extrabold text-shadow-lg leading-[1.1] tracking-tight">
                {slide.title}
                <br />
                <span className="text-[#E9C176] italic font-normal">{slide.subtitle}</span>
              </h1>
            </div>
          ))}
        </div>

        {/* Dynamic Animated Subtitle Description */}
        <div className="relative min-h-[48px] md:min-h-[56px] w-full max-w-2xl flex items-center justify-center mb-6">
          {slides.map((slide, index) => (
            <p
              key={index}
              className="absolute inset-0 flex items-center justify-center text-white/90 text-sm md:text-base lg:text-lg leading-relaxed text-shadow-subtle transition-all duration-700 ease-out"
              style={{
                opacity: index === current ? 1 : 0,
                transform: index === current ? 'translateY(0)' : 'translateY(12px)',
                pointerEvents: index === current ? 'auto' : 'none',
              }}
            >
              {slide.desc}
            </p>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mb-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${index === current
                  ? 'w-10 bg-[#E9C176]'
                  : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              aria-label={`Chuyển tới slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Search Box Component */}
        <SearchBox />

        {/* Quick Search Chips */}
        <div className="hidden sm:flex items-center justify-center gap-2 mt-5 text-xs text-white/80">
          <span className="font-semibold text-white/60">Gợi ý tìm kiếm:</span>
          {quickTags.map((tag) => (
            <Link
              key={tag.label}
              to={`/workshops?category=${encodeURIComponent(tag.query)}`}
              className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white/90 hover:text-white transition-colors"
            >
              {tag.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
