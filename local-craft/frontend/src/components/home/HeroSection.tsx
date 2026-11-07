import React, { useState, useEffect, useCallback } from 'react';
import SearchBox from './SearchBox';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: '/src/assets/images/hero-workshop.jpg',
    title: 'Khám phá workshop văn hóa',
    subtitle: 'cùng nghệ nhân địa phương',
    desc: 'Đặt lịch trải nghiệm thực tế, gặp gỡ nghệ nhân địa phương và mang về những sản phẩm thủ công đầy ý nghĩa.',
  },
  {
    image: '/src/assets/images/pottery-workshop.jpg',
    title: 'Nghệ thuật gốm sứ',
    subtitle: 'truyền thống Việt Nam',
    desc: 'Tự tay tạo nên những tác phẩm gốm độc đáo dưới sự hướng dẫn của nghệ nhân tại làng nghề truyền thống.',
  },
  {
    image: '/src/assets/images/lantern-workshop.jpg',
    title: 'Đèn lồng Hội An',
    subtitle: 'di sản văn hóa sống',
    desc: 'Học cách làm đèn lồng truyền thống và mang về một phần linh hồn phố cổ Hội An.',
  },
  {
    image: '/src/assets/images/textile-workshop.jpg',
    title: 'Dệt vải thủ công',
    subtitle: 'nghệ thuật sợi tơ',
    desc: 'Khám phá nghệ thuật dệt vải với những họa tiết văn hóa đặc sắc từ vùng cao Tây Bắc.',
  },
  {
    image: '/src/assets/images/artisan-story.jpg',
    title: 'Câu chuyện nghệ nhân',
    subtitle: 'giữ hồn văn hóa Việt',
    desc: 'Lắng nghe, kết nối và trải nghiệm cuộc sống của những người giữ gìn di sản văn hóa dân tộc.',
  },
];

const HeroSection: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 1200);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative min-h-[720px] md:min-h-[680px] lg:min-h-[760px] flex items-center justify-center overflow-hidden">
      {/* Carousel images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className="absolute inset-0 transition-all duration-[1500ms] ease-in-out"
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

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/70 z-[1]" />

      {/* Carousel arrows - desktop */}
      <button
        onClick={prev}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white transition-all opacity-0 md:opacity-100 hover:scale-105"
        aria-label="Previous slide"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={next}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/25 hover:text-white transition-all opacity-0 md:opacity-100 hover:scale-105"
        aria-label="Next slide"
      >
        <ChevronRight size={22} />
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Animated text */}
          <div className="relative h-[140px] md:h-[160px] lg:h-[180px] w-full mb-4">
            {slides.map((slide, index) => (
              <div
                key={index}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out"
                style={{
                  opacity: index === current ? 1 : 0,
                  transform: index === current ? 'translateY(0)' : 'translateY(20px)',
                }}
              >
                <h1 className="font-headline-lg text-4xl md:text-5xl lg:text-6xl text-white text-shadow-subtle leading-tight tracking-wide">
                  {slide.title}
                  <br />
                  <span className="text-[#FFB597]">{slide.subtitle}</span>
                </h1>
              </div>
            ))}
          </div>

          {/* Animated description */}
          <div className="relative h-[60px] md:h-[50px] w-full mb-6">
            {slides.map((slide, index) => (
              <p
                key={index}
                className="absolute inset-0 flex items-center justify-center text-white/90 text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto text-shadow-subtle transition-all duration-700 ease-in-out"
                style={{
                  opacity: index === current ? 1 : 0,
                  transform: index === current ? 'translateY(0)' : 'translateY(12px)',
                }}
              >
                {slide.desc}
              </p>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="flex items-center gap-2 mb-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === current
                    ? 'w-10 bg-white'
                    : 'w-3 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Search Box */}
          <SearchBox />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
