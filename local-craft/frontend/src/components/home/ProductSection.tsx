import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import productApi from '../../api/productApi';
import { normalizeProduct } from '../../utils/normalizers';
import type { Product } from '../../types/product.type';
import ProductCard from './ProductCard';

const ProductSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    productApi
      .getAll({ limit: 4, sort: 'popular' })
      .then((res) => {
        if (!active) return;
        const raw = res.data?.data?.products ?? res.data?.data ?? [];
        setProducts(Array.isArray(raw) ? raw.map(normalizeProduct) : []);
      })
      .catch(() => {
        if (active) setProducts([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
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
          <div className="craft-hatch-accent mb-4" aria-hidden="true" />
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-80 rounded-2xl bg-white border border-[#EAD8CC] animate-pulse" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-[#EAD8CC] p-8 text-center text-sm text-[#7A6255]">
          Chưa có sản phẩm nào từ cơ sở dữ liệu.
        </div>
      )}

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
};

export default ProductSection;
