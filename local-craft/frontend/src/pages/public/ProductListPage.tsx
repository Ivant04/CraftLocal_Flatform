import React, { useState } from 'react';
import { products } from '../../utils/mockData';
import ProductCard from '../../components/home/ProductCard';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { Search } from 'lucide-react';

const ProductListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-16 py-10">
      <h1 className="font-headline-lg text-headline-md text-deep-earth mb-8">Sản phẩm thủ công</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm kiếm sản phẩm..." className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-white">
          <option value="">Tất cả danh mục</option>
          {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <p className="text-sm text-on-surface-variant mb-6">Tìm thấy {filtered.length} sản phẩm</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
};

export default ProductListPage;
