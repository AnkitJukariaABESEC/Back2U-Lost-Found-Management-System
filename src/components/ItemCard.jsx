import { 
  MapPin, 
  Calendar, 
  User, 
  GraduationCap, 
  Hash, 
  CheckCircle, 
  Clock, 
  Building2, 
  ArrowRight,
  ShieldAlert,
  IdCard,
  Phone
} from 'lucide-react';
import { CATEGORIES } from '../lib/constants.js';

export const ItemCard = ({
  item,
  onOpenDetails,
  onClaimItem,
  onViewProfile,
}) => {
  const categoryMeta = CATEGORIES.find((c) => c.id === item.category) || {
    label: item.category,
    color: 'text-slate-700',
    bgLight: 'bg-slate-50 border-slate-200',
  };

  const getStatusBadge = () => {
    switch (item.status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-emerald-700 shadow-sm border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available to Claim
          </span>
        );
      case 'CLAIM_PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-amber-700 shadow-sm border border-amber-200/80">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Claim Under Review
          </span>
        );
      case 'HANDED_TO_OFFICE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-purple-700 shadow-sm border border-purple-200/80">
            <Building2 className="w-3.5 h-3.5 text-[#371B7A]" />
            At Security Desk
          </span>
        );
      case 'RETURNED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-700 shadow-sm border border-slate-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Returned to Owner
          </span>
        );
      default:
        return null;
    }
  };

  const profileData = item.finderProfile || {
    name: item.finderOrSeekerName,
    rollNumber: item.rollNumber,
    admissionNumber: item.admissionNumber || 'ADM-CAMPUS',
    branch: item.classDepartment,
    section: 'Section A',
    semesterOrDesignation: 'Semester/Dept',
    mobile: item.contactPhone || 'Contact Desk',
    email: item.contactEmail || 'student@college.edu',
    role: item.rollNumber?.startsWith('FAC') ? 'TEACHER' : 'STUDENT',
  };

  const isFound = item.reportType === 'FOUND';

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Top Banner / Image with soft rounded header */}
      <div className="relative h-50 w-full overflow-hidden bg-slate-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50/50 to-slate-100 text-slate-400">
            <ShieldAlert className="w-10 h-10 mb-1 text-slate-300" />
            <span className="text-xs font-medium text-slate-400">Photo not provided</span>
          </div>
        )}

        {/* Report Type Pill (Found in Mint Green, Lost in Soft Rose) */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wide shadow-sm ${
            isFound
              ? 'bg-emerald-600 text-white'
              : 'bg-[#EA580C] text-white'
          }`}>
            {isFound ? 'Found' : 'Lost Report'}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm bg-white/95 text-[#1F1746] border border-slate-200/80">
            {categoryMeta.label}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-3.5 right-3.5">
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-[#1F1746] line-clamp-1 group-hover:text-[#371B7A] transition-colors">
          {item.title}
        </h3>

        {/* Description */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {item.description}
        </p>

        {/* Location & Date */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-[#371B7A] shrink-0" />
            <span className="truncate font-semibold">{item.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Date: {item.date}</span>
          </div>
        </div>

        {/* Student / Teacher Verified Coordinate Card with Profile Viewer button */}
        <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:border-purple-200 transition-colors">
          <div className="text-[11px] font-bold text-[#371B7A] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>{isFound ? 'Reported By (Finder)' : 'Reported By (Owner)'}</span>
            <button
              type="button"
              onClick={() => onViewProfile(profileData, item.title)}
              className="text-[10px] text-[#371B7A] hover:text-[#2C1563] font-bold bg-white hover:bg-purple-100/60 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
              title="Click to view full verified Campus Profile (Email, Mobile, Admission No)"
            >
              <IdCard className="w-3 h-3" />
              <span>View Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-2 text-xs">
            {/* Student Name */}
            <button
              type="button"
              onClick={() => onViewProfile(profileData, item.title)}
              className="flex items-center gap-1.5 text-[#1F1746] font-bold text-left hover:text-[#371B7A] transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#371B7A] shrink-0" />
              <span className="truncate">{item.finderOrSeekerName}</span>
            </button>

            {/* Roll Number */}
            <div className="flex items-center gap-1.5 text-slate-800 font-mono font-medium">
              <Hash className="w-3.5 h-3.5 text-[#371B7A] shrink-0" />
              <span className="bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-900 text-[11px] font-bold">
                {item.rollNumber}
              </span>
            </div>

            {/* Class & Department */}
            <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 text-slate-600 text-[11px] mt-0.5">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.classDepartment}</span>
            </div>

            {/* Direct quick contact pill */}
            {item.contactPhone && (
              <div className="col-span-1 sm:col-span-2 flex items-center gap-1.5 text-emerald-800 text-[11px] pt-1">
                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Call/WA: <strong>{item.contactPhone}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Security desk mention if present */}
        {item.officeHandoverLocation && (
          <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-[11px] text-[#371B7A] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#371B7A] shrink-0" />
            <span className="truncate font-medium">Desk: {item.officeHandoverLocation}</span>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-2">
          {item.status !== 'RETURNED' ? (
            <button
              onClick={() => onClaimItem(item)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#371B7A] hover:bg-[#2C1563] active:scale-95 transition-all shadow-sm cursor-pointer"
            >
              <span>Claim This Item</span>
            </button>
          ) : (
            <div className="flex-1 text-center py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
              Resolved & Returned
            </div>
          )}

          <button
            onClick={() => onOpenDetails(item)}
            className="inline-flex items-center justify-center p-2.5 rounded-full text-slate-600 hover:text-[#371B7A] hover:bg-purple-50 border border-slate-200 transition-colors cursor-pointer"
            title="View Details & Verification History"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};