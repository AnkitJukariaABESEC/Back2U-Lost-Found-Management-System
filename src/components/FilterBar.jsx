import { 
  CreditCard, 
  Laptop, 
  Key, 
  BookOpen, 
  Shirt, 
  Glasses, 
  Package, 
  SlidersHorizontal,
  LayoutGrid
} from 'lucide-react';
import { CATEGORIES } from '../lib/constants.js';

export const FilterBar = ({
  selectedCategory,
  onSelectCategory,
  selectedStatus,
  onSelectStatus,
  selectedType,
  onSelectType,
  categoryCounts,
  totalResults,
}) => {
  const getCategoryIcon = (id) => {
    switch (id) {
      case 'STUDENT_ID': return <CreditCard className="w-4 h-4" />;
      case 'ELECTRONICS': return <Laptop className="w-4 h-4" />;
      case 'KEYS_WALLETS': return <Key className="w-4 h-4" />;
      case 'BOOKS_STATIONERY': return <BookOpen className="w-4 h-4" />;
      case 'CLOTHING_BAGS': return <Shirt className="w-4 h-4" />;
      case 'ACCESSORIES': return <Glasses className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white border-y border-slate-100 sticky top-18 sm:top-20 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        
        {/* Row 1: Category Chips as smooth rounded pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => onSelectCategory('ALL')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#371B7A] text-white shadow-sm'
                : 'bg-slate-100/90 text-slate-600 hover:bg-purple-50 hover:text-[#371B7A]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>All Categories</span>
            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
              selectedCategory === 'ALL' ? 'bg-purple-900/60 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {categoryCounts['ALL'] || 0}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#371B7A] text-white shadow-sm shadow-purple-900/20'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-purple-50 hover:text-[#371B7A]'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-purple-900/60 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: Secondary Filter Controls (Type, Status, Results count) */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          {/* Report Type Toggles */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-full">
            <button
              onClick={() => onSelectType('ALL')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedType === 'ALL' ? 'bg-white text-[#1F1746] shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Listings
            </button>
            <button
              onClick={() => onSelectType('FOUND')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedType === 'FOUND' ? 'bg-emerald-600 text-white shadow-xs font-bold' : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Found Items
            </button>
            <button
              onClick={() => onSelectType('LOST')}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                selectedType === 'LOST' ? 'bg-[#EA580C] text-white shadow-xs font-bold' : 'text-slate-600 hover:text-[#EA580C]'
              }`}
            >
              Lost Queries
            </button>
          </div>

          {/* Status Dropdown & Results Counter */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="status-select" className="text-slate-500 text-xs font-medium">Status:</label>
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => onSelectStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-[#371B7A] cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available to Claim</option>
                <option value="CLAIM_PENDING">Claim Under Review</option>
                <option value="HANDED_TO_OFFICE">At Security Desk</option>
                <option value="RETURNED">Successfully Returned</option>
              </select>
            </div>

            <div className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-[#1F1746]">{totalResults}</span> items
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};