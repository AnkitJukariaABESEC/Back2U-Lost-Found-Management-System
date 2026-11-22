import { 
  X, 
  Mail, 
  Phone, 
  GraduationCap, 
  Hash, 
  Briefcase, 
  ShieldCheck, 
  Building, 
  Layers, 
  MessageSquareQuote,
  Share2
} from 'lucide-react';

export const ProfileViewerModal = ({
  profile,
  isOpen,
  onClose,
  itemTitle,
}) => {
  if (!isOpen || !profile) return null;

  const isTeacher = profile.role === 'TEACHER';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Top University Brand Bar */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Verified Campus Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Digital Campus ID Card Container */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Item Association Banner */}
          {itemTitle && (
            <div className="p-3 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
              <span className="truncate">Finder for: <strong>"{itemTitle}"</strong></span>
              <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shrink-0">
                Contact Person
              </span>
            </div>
          )}

          {/* Physical ID Card Style Component */}
          <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-100 bg-gradient-to-b from-white to-slate-50 p-6 shadow-md shadow-indigo-100/40">
            {/* Top Crest / Institution banner */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-indigo-600 uppercase block">
                  CAMPUS DIGITAL IDENTITY
                </span>
                <h3 className="text-sm font-black text-slate-900">
                  CENTRAL UNIVERSITY PORTAL
                </h3>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
              </div>
            </div>

            {/* Photo & Primary Info Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
              {/* Profile Avatar / Photo */}
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shrink-0 border-2 border-white">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-black">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
                {/* Role badge */}
                <div className={`absolute bottom-0 inset-x-0 text-center py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white ${
                  isTeacher ? 'bg-violet-700' : 'bg-indigo-600'
                }`}>
                  {isTeacher ? 'Teacher' : 'Student'}
                </div>
              </div>

              {/* Names and Key Stats */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {profile.name}
                </h2>
                {!isTeacher ? (
                  <p className="text-xs text-indigo-700 font-medium mt-0.5">
                    {profile.branch}
                  </p>
                ) : (
                  <p className="text-xs text-violet-700 font-bold mt-0.5">
                    {profile.semesterOrDesignation}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold text-[11px] border border-slate-200">
                    {isTeacher ? `Faculty ID: ${profile.admissionNumber}` : `Roll: ${profile.rollNumber}`}
                  </span>
                  {!isTeacher && profile.section && (
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 font-semibold text-[11px] border border-indigo-200">
                      {profile.section}
                    </span>
                  )}
                  {!isTeacher && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] border border-slate-200">
                      {profile.semesterOrDesignation}
                    </span>
                  )}
                  {isTeacher && (
                    <span className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 font-semibold text-[11px] border border-violet-200">
                      Faculty Member
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Profile Metadata Grid */}
            <div className="mt-5 pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* College Email */}
              <div className="col-span-1 sm:col-span-2 flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60">
                <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">College Email ID</span>
                  <a href={`mailto:${profile.email}`} className="font-semibold text-slate-900 hover:text-indigo-600 truncate block">
                    {profile.email}
                  </a>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Mobile Number</span>
                  <a href={`tel:${profile.mobile}`} className="font-semibold text-slate-900 hover:text-emerald-700 truncate block">
                    {profile.mobile}
                  </a>
                </div>
              </div>

              {/* Admission Number / Faculty ID */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60 font-mono">
                <Hash className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-sans font-medium">
                    {isTeacher ? 'Faculty / Employee ID' : 'College Admission No'}
                  </span>
                  <span className="font-bold text-slate-900 truncate block text-[11px]">
                    {profile.admissionNumber}
                  </span>
                </div>
              </div>

              {/* Branch & Section - ONLY FOR STUDENTS */}
              {!isTeacher ? (
                <>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60">
                    <Building className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Department</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {profile.branch}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/60">
                    <Layers className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-medium">Class Coordinates</span>
                      <span className="font-medium text-slate-800 truncate block">
                        {profile.section} • {profile.semesterOrDesignation}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                /* For Teachers: Designation info block */
                <div className="col-span-1 sm:col-span-2 flex items-center gap-2 p-2 rounded-xl bg-violet-50/60 border border-violet-100">
                  <Briefcase className="w-4 h-4 text-violet-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] text-violet-600 block font-medium">Official Designation</span>
                    <span className="font-bold text-violet-950 truncate block">
                      {profile.semesterOrDesignation}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Action Contact Row for the Person who lost the item */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Direct Contact Options
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <a
                href={`tel:${profile.mobile}`}
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Finder</span>
              </a>

              <a
                href={`https://wa.me/${profile.mobile?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(profile.name)},%20I%20saw%20your%20report%20on%20Back2U%20regarding%20my%20lost%20belonging.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <MessageSquareQuote className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <a
                href={`mailto:${profile.email}?subject=Back2U%20-%20Query%20about%20Lost%20Item&body=Hi%20${encodeURIComponent(profile.name)},%0D%0A%0D%0AI%20am%20contacting%20you%20regarding%20the%20item%20reported%20on%20Back2U.`}
                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Profile verified under university roll database.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
