import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  Bell, 
  PlusCircle, 
  LogIn, 
  UserPlus, 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  X,
  Sparkles
} from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase.js';

export const Navbar = ({
  onOpenReportModal,
  onOpenDeskModal,
  onOpenLoginModal,
  onOpenSignUpModal,
  onOpenCampusIdModal,
  onLogout,
  currentProfile,
  itemsCount,
  onScrollToBrowse,
}) => {
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [dbStatus, setDbStatus] = useState(isSupabaseConfigured ? 'Supabase Live' : 'Connecting...');

  useEffect(() => {
    fetch('/api/items')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.connected) {
          setDbStatus('MongoDB Atlas Live');
        } else if (isSupabaseConfigured) {
          setDbStatus('Supabase Live');
        } else {
          setDbStatus('Local Storage (Fallback)');
        }
      })
      .catch(() => {
        setDbStatus(isSupabaseConfigured ? 'Supabase Live' : 'Local Storage (Fallback)');
      });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20">
          
          {/* Logo & Brand matching FindIt inspiration */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#371B7A] flex items-center justify-center text-white shadow-md shadow-purple-900/20 shrink-0">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-2xl font-black tracking-tight text-[#1F1746]">
                  Back<span className="text-[#EA580C]">2U</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs font-medium text-slate-500 tracking-tight -mt-0.5">
                Lost & Found — Our Campus
              </p>
            </div>
          </div>

          {/* Centered Navigation Pills matching the inspiration image */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-50 rounded-full border border-slate-200/60 shadow-xs">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-5 py-1.5 rounded-full text-xs font-semibold bg-[#371B7A] text-white shadow-xs cursor-pointer transition-all"
            >
              Home
            </button>
            <button
              onClick={() => onOpenReportModal('FOUND')}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#371B7A] hover:bg-white transition-all cursor-pointer"
            >
              Report
            </button>
            <button
              onClick={onScrollToBrowse}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#371B7A] hover:bg-white transition-all cursor-pointer"
            >
              Browse
            </button>
            <button
              onClick={onOpenDeskModal}
              className="px-4 py-1.5 rounded-full text-xs font-medium text-slate-600 hover:text-[#371B7A] hover:bg-white transition-all cursor-pointer"
            >
              Campus Desks
            </button>
          </nav>

          {/* Right Action Controls: Notification Bell + Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell with red alert dot */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationToast((prev) => !prev)}
                className="relative p-2.5 rounded-full text-slate-700 hover:text-[#371B7A] hover:bg-purple-50/70 border border-slate-200/80 transition-colors cursor-pointer"
                title="Campus Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-[#371B7A]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </button>

              {/* Notification Popup Dropdown */}
              {showNotificationToast && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 p-4 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-purple-900/10 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1746]">
                      <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                      <span>Live Campus Activity</span>
                    </div>
                    <button 
                      onClick={() => setShowNotificationToast(false)} 
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="py-2.5 space-y-2 text-xs text-slate-600">
                    <p className="flex items-center justify-between">
                      <span>Live Active Listings:</span>
                      <strong className="text-[#371B7A] font-bold">{itemsCount} items</strong>
                    </p>
                    <p className="flex items-center justify-between">
                      <span>Database Engine:</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        dbStatus.includes('MongoDB')
                          ? 'text-emerald-700 bg-emerald-100'
                          : dbStatus.includes('Supabase')
                          ? 'text-teal-700 bg-teal-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}>
                        {dbStatus}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      Claimed items are automatically removed from the registry once approved.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Authentication Buttons: Login / Signup / Logout */}
            {!currentProfile ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Login Button */}
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#371B7A] hover:bg-purple-50/80 border border-[#371B7A]/30 transition-all cursor-pointer active:scale-95 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#371B7A]" />
                  <span>Log In</span>
                </button>

                {/* Sign Up Button */}
                <button
                  onClick={onOpenSignUpModal}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-[#EA580C] hover:bg-[#D94E07] shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Active User Campus Profile Pill */}
                <button
                  onClick={onOpenCampusIdModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-purple-50 text-[#371B7A] border border-[#371B7A]/20 hover:bg-purple-100 transition-colors cursor-pointer"
                  title="Click to view or edit your Campus ID"
                >
                  <UserCheck className="w-4 h-4 text-[#371B7A] shrink-0" />
                  <span className="max-w-[100px] sm:max-w-[120px] truncate">{(currentProfile?.name || 'Member').split(' ')[0]}</span>
                  <span className="text-[10px] bg-[#371B7A] text-white px-1.5 py-0.2 rounded-full font-bold uppercase">
                    {currentProfile?.role === 'TEACHER' ? 'Faculty' : 'ID'}
                  </span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                  title="Log out from Back2U"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};