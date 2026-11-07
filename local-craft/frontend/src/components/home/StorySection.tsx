import React from 'react';
import { Link } from 'react-router-dom';

const StorySection: React.FC = () => (
  <section className="py-16 md:py-24 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div className="rounded-2xl overflow-hidden shadow-xl">
        <img src="/src/assets/images/artisan-story.jpg" alt="Câu chuyện nghệ nhân" className="w-full h-[400px] object-cover" />
      </div>
      <div>
        <span className="text-primary font-semibold text-sm tracking-wider uppercase">Sứ mệnh của chúng tôi</span>
        <h2 className="font-headline-lg text-headline-md text-deep-earth mt-3 mb-6">Không chỉ là một nền tảng đặt lịch.</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">
          CraftLocal hướng đến việc gìn giữ di sản truyền thống bằng cách kết nối du khách trực tiếp với các nghệ nhân. Mỗi lượt đặt lịch đều góp phần hỗ trợ cộng đồng địa phương và giúp những kỹ thuật thủ công lâu đời được truyền lại cho thế hệ sau.
        </p>
        <p className="text-on-surface-variant leading-relaxed mb-8">
          Chúng tôi tin rằng những trải nghiệm du lịch ý nghĩa nhất đến từ sự kết nối giữa con người và niềm vui khi tự tay tạo nên một sản phẩm đẹp.
        </p>
        <Link to="/about" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
          Đọc câu chuyện của chúng tôi →
        </Link>
      </div>
    </div>
  </section>
);

export default StorySection;
