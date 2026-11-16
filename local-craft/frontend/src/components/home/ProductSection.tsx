import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { products } from '../../utils/mockData';
import ProductCard from './ProductCard';

const ProductSection: React.FC = () => (
  <section className="py-16 md:py-24 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#964824]/10 text-[#964824] rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
          <ShoppingBag size={14} className="text-[#964824]" />
          <span>Sản phẩm chính gốc</span>
        </span>
        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3D2B1F] tracking-tight mt-1 mb-3">
          Mang di sản về tổ ấm
        </h2>
        <p className="text-[#7A6255] text-sm md:text-base max-w-xl leading-relaxed">
          Từng sản phẩm thủ công đều được đóng gói tỉ mỉ và vận chuyển trực tiếp từ làng nghề, bảo chứng nguồn gốc và tay nghề nghệ nhân.
        </p>
      </div>
      <Link
        to="/products"
        className="hidden md:inline-flex items-center gap-2 text-[#964824] font-bold text-sm hover:gap-3 transition-all group"
      >
        <span>Xem tất cả sản phẩm</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.slice(0, 4).map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>

    <div className="md:hidden mt-8 text-center">
      <Link
        to="/products"
        className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-white text-[#964824] border border-[#EAD8CC] rounded-2xl font-bold text-sm shadow-xs hover:bg-[#FAF7F2]"
      >
        <span>Xem tất cả sản phẩm</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  </section>
);

export default ProductSection;
