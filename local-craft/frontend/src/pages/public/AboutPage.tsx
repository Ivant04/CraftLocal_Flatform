import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Globe, Users, Star } from 'lucide-react';

const values = [
  { icon: <Heart size={28} />, title: 'Gìn giữ di sản', desc: 'Hỗ trợ nghệ nhân bảo tồn kỹ thuật thủ công truyền thống lâu đời.' },
  { icon: <Globe size={28} />, title: 'Du lịch bền vững', desc: 'Thúc đẩy trao đổi văn hóa có trách nhiệm giữa du khách và cộng đồng.' },
  { icon: <Users size={28} />, title: 'Trao quyền cộng đồng', desc: 'Tạo thu nhập bền vững cho nghệ nhân và cộng đồng địa phương.' },
  { icon: <Star size={28} />, title: 'Trải nghiệm chất lượng', desc: 'Các workshop được tuyển chọn kỹ lưỡng để mang đến trải nghiệm tốt nhất.' },
];

const AboutPage: React.FC = () => (
  <div>
    {/* Hero */}
    <section className="bg-deep-earth text-white py-20">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 text-center">
        <h1 className="font-headline-lg text-display-md mb-6">Về CraftLocal</h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">
          Chúng tôi kết nối du khách với nghệ nhân địa phương, tạo nên những trải nghiệm du lịch có ý nghĩa và góp phần bảo tồn di sản văn hóa Việt Nam.
        </p>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
      <h2 className="font-headline-lg text-headline-md text-deep-earth text-center mb-12">Giá trị cốt lõi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((v) => (
          <div key={v.title} className="text-center p-6 rounded-2xl hover:bg-soft-clay/30 transition-colors">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">{v.icon}</div>
            <h3 className="font-semibold text-lg text-on-surface mb-2">{v.title}</h3>
            <p className="text-on-surface-variant text-sm">{v.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 bg-primary/5 text-center">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
        <h2 className="font-headline-lg text-headline-md text-deep-earth mb-4">Sẵn sàng khám phá?</h2>
        <p className="text-on-surface-variant mb-8 max-w-lg mx-auto">Tham gia hàng ngàn du khách đã trải nghiệm văn hóa thủ công Việt Nam cùng CraftLocal.</p>
        <div className="flex justify-center gap-4">
          <Link to="/workshops" className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all">Khám phá Workshop</Link>
          <Link to="/register" className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all">Trở thành Chủ xưởng</Link>
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
