import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { products } from '../../utils/mockData';
import ProductCard from './ProductCard';

const ProductSection: React.FC = () => (
  <section className="py-16 md:py-20 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
    <div className="flex items-end justify-between mb-10">
      <div>
        <span className="text-[#964824] font-semibold text-sm tracking-wider uppercase">Sản phẩm</span>
        <h2 className="font-headline-lg text-headline-md text-[#3D2B1F] mt-2 mb-2">Mang di sản về nhà</h2>
        <p className="text-[#7A6255] max-w-lg">
          Mua các sản phẩm thủ công chính gốc trực tiếp từ cộng đồng nghệ nhân.
        </p>
      </div>
      <Link to="/products" className="hidden md:flex items-center gap-2 text-[#964824] font-semibold hover:gap-3 transition-all">
        Xem tất cả <ArrowRight size={18} />
      </Link>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.slice(0, 4).map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
    <Link to="/products" className="md:hidden flex items-center justify-center gap-2 mt-8 text-[#964824] font-semibold">
      Xem tất cả sản phẩm <ArrowRight size={18} />
    </Link>
  </section>
);

export default ProductSection;
