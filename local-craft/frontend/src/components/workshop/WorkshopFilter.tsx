import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { WORKSHOP_CATEGORIES, LOCATIONS } from '../../utils/constants';

interface WorkshopFilterProps {
  search: string;
  category: string;
  location: string;
  onSearchChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onLocationChange: (v: string) => void;
}

const WorkshopFilter: React.FC<WorkshopFilterProps> = ({ search, category, location, onSearchChange, onCategoryChange, onLocationChange }) => (
  <div className="flex flex-col md:flex-row gap-4 mb-8">
    <div className="flex-1 relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" />
      <input type="text" value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search workshops..." className="w-full pl-11 pr-4 py-3 border border-outline-variant rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
    </div>
    <select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
      <option value="">All Categories</option>
      {WORKSHOP_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
    </select>
    <select value={location} onChange={(e) => onLocationChange(e.target.value)} className="px-4 py-3 border border-outline-variant rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
      <option value="">All Locations</option>
      {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
    </select>
  </div>
);

export default WorkshopFilter;
