import { Megaphone, HeartHandshake } from 'lucide-react';

export const CaringCampusBanner = ({ onOpenReportModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFF4EA] via-[#FFF0E2] to-[#FFE8D6] border border-amber-200/60 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        
        {/* Left Side: Orange Megaphone & Slogan */}
        <div className="flex items-center gap-4 sm:gap-5 z-10">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-[#EA580C] text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 transform -rotate-6">
            <Megaphone className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#1F1746] tracking-tight">
              Let's build a caring campus together!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Every returned notebook, student ID, and earphone keeps our university connected and trusted.
            </p>
          </div>
        </div>

        {/* Right Side: University Architectural Silhouette */}
        <div className="z-10 flex items-center gap-3">
          <button
            onClick={() => onOpenReportModal('FOUND')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#EA580C] hover:bg-[#D94E07] shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Join Our Mission</span>
          </button>
        </div>

        {/* Background College Skyline Graphic */}
        <div className="absolute right-0 bottom-0 opacity-15 pointer-events-none hidden lg:block">
          <svg width="240" height="90" viewBox="0 0 240 90" fill="currentColor" className="text-[#EA580C]">
            <rect x="20" y="30" width="40" height="60" />
            <polygon points="40,10 20,30 60,30" />
            <rect x="70" y="45" width="30" height="45" />
            <rect x="110" y="20" width="50" height="70" />
            <polygon points="135,0 110,20 160,20" />
            <circle cx="135" cy="35" r="6" fill="#fff" />
            <rect x="170" y="40" width="40" height="50" />
          </svg>
        </div>

      </div>
    </div>
  );
};