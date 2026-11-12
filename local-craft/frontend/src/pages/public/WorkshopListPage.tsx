import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import workshopApi from '../../api/workshopApi';
import categoryApi from '../../api/categoryApi';
import { normalizeWorkshop } from '../../utils/normalizers';
import type { Workshop } from '../../types/workshop.type';
import WorkshopCard from '../../components/home/WorkshopCard';
import { LOCATIONS, WORKSHOP_CATEGORIES } from '../../utils/constants';
import { Search, SlidersHorizontal, RotateCcw, Sparkles } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

const WorkshopListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const locationParam = searchParams.get('location') || '';

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState(categoryParam);
  const [location, setLocation] = useState(locationParam);
  const [sortBy, setSortBy] = useState('popular');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCategory(categoryParam);
    setLocation(locationParam);
  }, [categoryParam, locationParam]);

  useEffect(() => {
    let active = true;
    categoryApi
      .getAll({ type: 'WORKSHOP' })
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
    workshopApi
      .getAll({
        category: category || undefined,
        location: location || undefined,
        search: debouncedSearch || undefined,
        sort: sortBy,
        limit: 50,
      })
      .then((res) => {
        if (!active) return;
        const raw = res.data?.data?.workshops ?? res.data?.data ?? [];
        setWorkshops(Array.isArray(raw) ? raw.map(normalizeWorkshop) : []);
      })
      .catch((err) => {
        if (active) setError(err?.response?.data?.message || 'Không tải được danh sách workshop.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, location, debouncedSearch, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setCategory('');
    setLocation('');
    setSortBy('popular');
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(search || category || location || sortBy !== 'popular');
  const categoryOptions =
    categories.length > 0
      ? categories
      : WORKSHOP_CATEGORIES.map((name) => ({ _id: name, name, slug: name }));

  return (
    <div className="min-h-screen bg-craft-contour py-8 md:py-12">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16">
        {/* Page Header */}
        <PageHeader
          badge="Khám phá di sản"
          title="Trải nghiệm & Workshop thủ công"
          subtitle="Gặp gỡ những nghệ nhân bậc thầy, tìm hiểu kỹ nghệ cổ truyền và tự tay tạo nên tác phẩm độc bản của riêng bạn."
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7A6255] bg-white px-3.5 py-2 rounded-xl border border-[#EAD8CC]">
            <Sparkles size={14} className="text-[#964824]" />
            <span>Hiển thị {workshops.length} workshop</span>
          </div>
        </PageHeader>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-[#EAD8CC] p-4 md:p-5 shadow-[0_8px_30px_rgba(61,43,31,0.04)] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6255]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên workshop, nghề, nghệ nhân..."
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
                <option value="">Tất cả danh mục nghề</option>
                {categoryOptions.map((c) => (
                  <option key={c._id} value={c.slug || c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Select */}
            <div className="md:col-span-2">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-[#3D2B1F] border border-[#EAD8CC] rounded-xl bg-[#FAF7F2]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#964824]/20 focus:border-[#964824] transition-all cursor-pointer"
              >
                <option value="">Tất cả địa điểm</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* Sort Select */}
            <div className="md:col-span-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-medium text-[#3D2B1F] border border-[#EAD8CC] rounded-xl bg-[#FAF7F2]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#964824]/20 focus:border-[#964824] transition-all cursor-pointer"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="price-asc">Giá: Thấp đến cao</option>
                <option value="price-desc">Giá: Cao đến thấp</option>
              </select>
            </div>
          </div>

          {/* Quick Category Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3.5 border-t border-[#EAD8CC]/60 overflow-x-auto pb-1 hide-scrollbar">
            <span className="text-xs font-bold text-[#7A6255] shrink-0 mr-1 flex items-center gap-1">
              <SlidersHorizontal size={13} /> Lọc nhanh:
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
        ) : workshops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {workshops.map((ws) => (
              <WorkshopCard key={ws._id} workshop={ws} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#EAD8CC] p-12 text-center my-6">
            <EmptyState
              title="Không tìm thấy workshop phù hợp"
              description="Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại danh mục và địa điểm khác xem sao nhé."
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

export default WorkshopListPage;
