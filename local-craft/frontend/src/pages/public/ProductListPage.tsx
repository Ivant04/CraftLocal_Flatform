import React, { useState, useEffect } from 'react';
import productApi from '../../api/productApi';
import categoryApi from '../../api/categoryApi';
import { normalizeProduct } from '../../utils/normalizers';
import type { Product } from '../../types/product.type';
import ProductCard from '../../components/home/ProductCard';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { Search, SlidersHorizontal, RotateCcw, PackageCheck } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

const ProductListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    categoryApi
      .getAll({ type: 'PRODUCT' })
      .then((res) => {
        if (!active) return;
        const list = res.data?.data;
        setCategories(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (active) setCategories([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    productApi
      .getAll({
        category: category || undefined,
        search: debouncedSearch || undefined,
        sort: sortBy,
        limit: 50,
      })
      .then((res) => {
        if (!active) return;
        const raw = res.data?.data?.products ?? res.data?.data ?? [];
        setProducts(Array.isArray(raw) ? raw.map(normalizeProduct) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách sản phẩm.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, debouncedSearch, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setSortBy('popular');
  };

  const hasActiveFilters = Boolean(search || category || sortBy !== 'popular');
  const categoryOptions =
    categories.length > 0
      ? categories
      : PRODUCT_CATEGORIES.map((name) => ({ _id: name, name, slug: name }));

  return (
    <div className="min-h-screen bg-craft-contour py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
        {/* Page Header */}
        <PageHeader
          badge="Cửa hàng nghề truyền thống"
          title="Sản phẩm thủ công độc bản"
          subtitle="Tác phẩm mỹ nghệ được chế tác tỉ mỉ bởi nghệ nhân làng nghề, giao hàng tận nơi với bảo chứng nguồn gốc."
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7A6255] bg-white px-3.5 py-2 rounded-xl border border-[#EAD8CC]">
            <PackageCheck size={14} className="text-[#964824]" />
            <span>Hiển thị {products.length} sản phẩm</span>
          </div>
        </PageHeader>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 md:p-5 shadow-[0_8px_30px_rgba(61,43,31,0.04)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6255]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên sản phẩm, chất liệu, nghệ nhân..."
                className="w-full pl-11 pr-4 py-2.5 text-sm font-medium text-[#3D2B1F] placeholder-[#7A6255]/70 border border-[#EAD8CC] rounded-xl bg-[#FAF7F2]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#964824]/20 focus:border-[#964824] transition-all"
              />
            </div>

            {/* Category Select */}
            <div className="md:col-span-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-[#3D2B1F] border border-[#EAD8CC] rounded-xl bg-[#FAF7F2]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#964824]/20 focus:border-[#964824] transition-all cursor-pointer"
              >
                <option value="">Tất cả danh mục sản phẩm</option>
                {categoryOptions.map((c) => (
                  <option key={c._id} value={c.slug || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="md:col-span-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-[#3D2B1F] border border-[#EAD8CC] rounded-xl bg-[#FAF7F2]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#964824]/20 focus:border-[#964824] transition-all cursor-pointer"
              >
                <option value="popular">Bán chạy nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-[#EAD8CC]/60 overflow-x-auto pb-1 hide-scrollbar">
            <span className="text-xs font-bold text-[#7A6255] shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal size={13} /> Nhóm hàng:
            </span>
            <button
              onClick={() => setCategory('')}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !category
                  ? 'bg-[#964824] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#3D2B1F] hover:bg-[#EAD8CC]/60'
              }`}
            >
              Tất cả
            </button>
            {categoryOptions.map((c) => {
              const val = c.slug || c.name;
              const isSelected = category === val || category === c.name;
              return (
                <button
                  key={c._id}
                  onClick={() => setCategory(isSelected ? '' : val)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#964824] text-white shadow-xs'
                      : 'bg-[#FAF7F2] text-[#3D2B1F] hover:bg-[#EAD8CC]/60'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="ml-auto px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-full flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Đặt lại lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-80 rounded-2xl bg-white border border-[#EAD8CC] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-3xl border border-red-200 p-10 text-center text-red-700 text-sm">
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#EAD8CC] p-12 text-center my-6">
            <EmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Hãy thử tìm kiếm với tên sản phẩm khác hoặc làm mới lại các bộ lọc."
              action={
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#964824] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-[#7A3518] transition-colors cursor-pointer"
                >
                  Xóa tất cả bộ lọc
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
