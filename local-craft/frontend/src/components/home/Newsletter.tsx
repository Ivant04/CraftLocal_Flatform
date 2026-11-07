import React, { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  return (
    <section className="py-16 md:py-20 bg-primary/5">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 text-center">
        <Mail size={40} className="mx-auto text-primary mb-4" />
        <h2 className="font-headline-lg text-headline-md text-deep-earth mb-3">
          Lấy cảm hứng từ văn hóa địa phương
        </h2>
        <p className="text-on-surface-variant max-w-lg mx-auto mb-8">
          Đăng ký nhận tin để khám phá nghệ nhân mới, workshop sắp diễn ra và những câu chuyện từ cộng đồng.
        </p>
        {subscribed ? (
          <div className="flex items-center justify-center gap-2 text-green-600 font-semibold">
            <Check size={20} /> Đăng ký thành công!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email của bạn"
              className="flex-1 w-full px-4 py-3 rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
              Đăng ký <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
