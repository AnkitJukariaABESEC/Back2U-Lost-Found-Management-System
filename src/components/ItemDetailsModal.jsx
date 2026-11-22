import { 
  X, 
  MapPin, 
  Calendar, 
  User, 
  GraduationCap, 
  Hash, 
  Phone, 
  Mail, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Check, 
  XCircle,
  IdCard
} from 'lucide-react';
import { CATEGORIES } from '../lib/constants.js';

export const ItemDetailsModal = ({
  item,
  claims,
  isOpen,
  onClose,
  onClaimItem,
  onApproveClaim,
  onRejectClaim,
  onMarkReturned,
  onViewProfile,
}) => {
  if (!isOpen || !item) return null;

  const categoryMeta = CATEGORIES.find((c) => c.id === item.category) || {
    label: item.category,
    color: 'text-slate-700',
    bgLight: 'bg-slate-50 border-slate-200',
  };

  const itemClaims = claims.filter((c) => c.itemId === item.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              item.reportType === 'FOUND' ? 'bg-indigo-600 text-white' : 'bg-amber-600 text-white'
            }`}>
              {item.reportType === 'FOUND' ? 'Found Belonging' : 'Lost Item Query'}
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${categoryMeta.bgLight} ${categoryMeta.color}`}>
              {categoryMeta.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Showcase Image */}
          {item.imageUrl && (
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title & Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {item.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Location & Date grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">Found Location</span>
                <span className="font-semibold text-slate-900">{item.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="text-[11px] text-slate-400 block">Date Reported</span>
                <span className="font-semibold text-slate-900">{item.date}</span>
              </div>
            </div>
          </div>

          {/* Official Security Desk Location */}
          {item.officeHandoverLocation && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Deposited at Campus Office</h4>
                <p className="mt-0.5 text-blue-700">
                  This item was securely submitted to: <strong>{item.officeHandoverLocation}</strong>.
                  You can collect it directly during official campus hours with your Student ID card.
                </p>
              </div>
            </div>
          )}

          {/* Reporter Details (Finder / Seeker) */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 flex items-center justify-between">
              <span>{item.reportType === 'FOUND' ? 'Finder Information' : 'Poster Information'}</span>
              <span className="text-[11px] font-normal text-indigo-700">Registered Student</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-800">
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Name: <strong>{item.finderOrSeekerName}</strong></span>
              </div>

              <div className="flex items-center gap-2 text-slate-800 font-mono">
                <Hash className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Roll No: <strong>{item.rollNumber}</strong></span>
              </div>

              <div className="col-span-1 sm:col-span-2 flex items-center gap-2 text-slate-800">
                <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Class / Department: <strong>{item.classDepartment}</strong></span>
              </div>

              {item.contactPhone && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phone: <a href={`tel:${item.contactPhone}`} className="text-indigo-600 hover:underline">{item.contactPhone}</a></span>
                </div>
              )}

              {item.contactEmail && (
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Email: <a href={`mailto:${item.contactEmail}`} className="text-indigo-600 hover:underline">{item.contactEmail}</a></span>
                </div>
              )}
            </div>

            {/* View Full Campus ID Button */}
            <button
              type="button"
              onClick={() => onViewProfile(item.finderProfile || item, item.title)}
              className="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <IdCard className="w-4 h-4 text-indigo-600" />
              <span>View Finder's Verified Campus Profile & Direct Contact</span>
            </button>
          </div>

          {/* Active Claims & Verification Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Claims & Handshake Log ({itemClaims.length})
              </span>
              <span className="text-[11px] text-slate-500">Confidential Verification</span>
            </h4>

            {itemClaims.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No active claims have been filed for this item yet.
              </p>
            ) : (
              <div className="space-y-3">
                {itemClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900">
                        {claim.claimantName} ({claim.claimantRollNo})
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        claim.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : claim.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <div className="text-slate-600">
                      <strong>Class:</strong> {claim.claimantClass} | <strong>Contact:</strong> {claim.claimantContact}
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                      <strong>Submitted Proof:</strong> {claim.proofDetails}
                    </div>

                    {/* Verification Actions for Finder */}
                    {claim.status === 'PENDING' && (
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={() => onApproveClaim(claim.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                          title="Approves claim, confirms return, and automatically deletes item from active feed"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve Claim & Return (Auto-Delete)</span>
                        </button>
                        <button
                          onClick={() => onRejectClaim(claim.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject Claim</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {item.status !== 'RETURNED' ? (
              <button
                onClick={() => onMarkReturned(item.id)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 transition-colors cursor-pointer"
                title="Mark as returned to rightful student"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark as Returned</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Case Resolved
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close
            </button>
            {item.status !== 'RETURNED' && (
              <button
                onClick={() => {
                  onClose();
                  onClaimItem(item);
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
