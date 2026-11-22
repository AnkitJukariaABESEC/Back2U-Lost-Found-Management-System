import { MapPin, ShieldCheck, Database, Heart } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase.js';

export const Footer = ({
  onOpenReportModal,
  onOpenDeskModal,
}) => {
  return (
    <footer className="bg-[#181136] text-slate-300 border-t border-purple-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#371B7A] flex items-center justify-center text-white shadow-md border border-purple-400/30">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Back<span className="text-[#EA580C]">2U</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Back2U is the university's automated lost & found network connecting students, 
              faculty, and campus security. Report misplaced belongings in seconds and track them 
              back to your hands safely.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-950/80 text-purple-200 border border-purple-800/60">
                <Database className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Backend: {isSupabaseConfigured ? 'Supabase Postgres Live' : 'Local Storage Engine'}</span>
              </span>
            </div>
          </div>

          {/* Col 2: Fast Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Campus Tools
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onOpenReportModal('FOUND')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Report Found Belonging
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenReportModal('LOST')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Report Lost Query
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDeskModal}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Campus Security Desks
                </button>
              </li>
              <li className="text-emerald-400 font-medium">
                <span>Auto-Delete when Claimed (Active)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Trust Guidelines */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Verification Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                <span>Never share OTPs or personal bank details in claims.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                <span>Exchange items in daylight or at the Main Campus Gate.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#EA580C] shrink-0 mt-0.5" />
                <span>ID cards can be turned into Library Desk directly.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-purple-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Back2U • Built for University Students & Campus Safety.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-[#EA580C] fill-[#EA580C]" /> for our campus community
          </p>
        </div>
      </div>
    </footer>
  );
};