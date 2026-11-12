import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import categoryApi from '../../api/categoryApi';
import CraftCategoryIcon from '../common/CraftCategoryIcon';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

const CategorySection: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    categoryApi
      .getAll()
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (active) setCategories([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="py-16 md:py-24 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#964824]/10 text-[#964824] rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
          <Sparkles size={13} />
          <span>Danh mục nghề thủ công</span>
        </span>
        <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#3D2B1F] tracking-tight mb-3">
          Khám phá theo làng nghề
        </h2>
        <div className="craft-hatch-accent mx-auto mb-4" aria-hidden="true" />
        <p className="text-[#7A6255] text-sm md:text-base leading-relaxed">
          Trực tiếp gặp gỡ nghệ nhân và hòa mình vào nét đẹp văn hóa truyền thống đặc sắc khắp các miền đất nước.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8 gap-3.5 md:gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-32 rounded-2xl bg-white border border-[#EAD8CC] animate-pulse"
              />
            ))
          : categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/workshops?category=${encodeURIComponent(cat.slug || cat.name)}`}
                className="group flex flex-col items-center p-4 md:p-5 rounded-2xl bg-white border border-[#EAD8CC] hover:border-[#964824]/40 hover:bg-[#FAF7F2] hover:shadow-[0_12px_32px_rgba(61,43,31,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-[#FAF7F2] flex items-center justify-center group-hover:bg-[#964824]/10 group-hover:scale-110 transition-all duration-300 border border-[#EAD8CC] group-hover:border-[#964824]/30 mb-3 shadow-2xs">
                  <CraftCategoryIcon slug={cat.slug} name={cat.name} className="w-8 h-8" />
                </div>
                <span className="text-xs md:text-sm font-bold text-[#3D2B1F] group-hover:text-[#964824] transition-colors text-center line-clamp-2">
                  {cat.name}
                </span>
              </Link>
            ))}
      </div>
    </section>
  );
};

export default CategorySection;
