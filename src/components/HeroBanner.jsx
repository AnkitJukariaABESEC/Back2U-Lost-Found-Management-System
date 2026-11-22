import { 
  Send, 
  Search, 
  ShieldCheck, 
  Zap, 
  Users, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';

export const HeroBanner = ({
  onOpenReportWithType,
  onScrollToBrowse,
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#F5F6FC] via-[#F8F9FD] to-white pt-6 pb-12 sm:pt-10 sm:pb-16">
      
      {/* Decorative Soft Background Waves & Blobs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-200/40 to-indigo-100/30 blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-0 -ml-20 w-[400px] h-[400px] rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Hero Split: Left Content + Right Campus Imagery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines & Action Buttons */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Playful Orange Accent Sparks */}
            <div className="flex items-center gap-1.5 text-[#EA580C] select-none">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#EA580C]">
                <line x1="2" y1="18" x2="8" y2="4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="13" y1="18" x2="19" y2="2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                <line x1="24" y1="18" x2="30" y2="6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C]/90">
                Central Campus Registry
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1F1746] tracking-tight leading-[1.12]">
              Lost Something? <br />
              <span className="text-[#EA580C]">Found Something?</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base sm:text-lg max-w-lg leading-relaxed font-normal">
              Back2U helps you report, discover and reunite lost items in our campus.
            </p>

            {/* Call To Action Buttons matching the inspiration */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              {/* Primary Purple Pill Button */}
              <button
                onClick={() => onOpenReportWithType('FOUND')}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-sm sm:text-base font-semibold text-white bg-[#371B7A] hover:bg-[#2C1563] shadow-lg shadow-purple-900/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4 rotate-45" />
                <span>Report an Item →</span>
              </button>

              {/* Secondary Transparent / Pill Button */}
              <button
                onClick={onScrollToBrowse}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm sm:text-base font-semibold text-[#371B7A] bg-white hover:bg-purple-50/60 border-2 border-[#371B7A] transition-all active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#371B7A]" />
                <span>Browse Items</span>
              </button>
            </div>
          </div>

          {/* Right Column: Collegiate Campus Photo with Curved Cut & Sticker Badge */}
          <div className="lg:col-span-6 relative mt-4 lg:mt-0">
            
            {/* Campus Building Photo with Organic Curve mask matching the inspiration */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Soft aesthetic background shadow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-200 to-amber-200 rounded-[40px] rounded-bl-[100px] sm:rounded-bl-[140px] blur-lg opacity-40 -z-10" />

              <div className="relative overflow-hidden rounded-[36px] rounded-bl-[90px] sm:rounded-bl-[140px] shadow-2xl border-4 border-white bg-slate-100 aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"
                  alt="University Campus Academic Hall"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating "Together we find!" Illustrated Sticker Badge */}
              <div className="absolute -top-4 -right-2 sm:-top-6 sm:-right-4 z-20 flex flex-col items-center select-none pointer-events-none">
                
                {/* Playful curved badge slogan */}
                <div className="transform rotate-12 -mb-2 bg-white/95 px-3 py-1 rounded-full shadow-md border border-purple-200/80">
                  <span className="text-xs sm:text-sm font-black text-[#1F1746] tracking-tight">
                    Together we find!
                  </span>
                </div>

                {/* Magnifying Glass Inspecting Backpack Graphic Badge */}
                <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-full bg-white border-4 border-[#371B7A] p-2 shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform">
                  <div className="w-full h-full rounded-full bg-purple-50/80 flex items-center justify-center relative">
                    {/* Backpack SVG illustration */}
                    <svg className="w-9 h-9 sm:w-12 sm:h-12 text-[#371B7A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="6" width="16" height="15" rx="4" />
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <line x1="12" y1="10" x2="12" y2="14" />
                      <line x1="8" y1="10" x2="8.01" y2="10" />
                      <line x1="16" y1="10" x2="16.01" y2="10" />
                    </svg>
                    {/* Tiny magnifying glass badge overlay */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#EA580C] text-white flex items-center justify-center border-2 border-white shadow-md">
                      <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* The 4-Column Feature & Trust Bar matching the inspiration */}
        <div className="mt-12 sm:mt-16 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-5 sm:p-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            
            {/* 1. Trusted & Secure */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center shrink-0 border border-purple-100">
                <ShieldCheck className="w-6 h-6 text-[#371B7A]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1746]">Trusted & Secure</h4>
                <p className="text-xs text-slate-500 mt-0.5">Your data is safe with us</p>
              </div>
            </div>

            {/* 2. Fast & Easy */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center shrink-0 border border-purple-100">
                <Zap className="w-6 h-6 text-[#371B7A]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1746]">Fast & Easy</h4>
                <p className="text-xs text-slate-500 mt-0.5">Report or find in seconds</p>
              </div>
            </div>

            {/* 3. Community Driven */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center shrink-0 border border-purple-100">
                <Users className="w-6 h-6 text-[#371B7A]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1746]">Community Driven</h4>
                <p className="text-xs text-slate-500 mt-0.5">Help your fellow students</p>
              </div>
            </div>

            {/* 4. Reunite, Together */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center shrink-0 border border-purple-100">
                <HeartHandshake className="w-6 h-6 text-[#371B7A]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F1746]">Reunite, Together</h4>
                <p className="text-xs text-slate-500 mt-0.5">Because every item matters</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};