import { useState } from 'react';
import { X, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ClaimModal = ({
  item,
  isOpen,
  onClose,
  onSubmitClaim,
}) => {
  const [claimantName, setClaimantName] = useState('');
  const [claimantRollNo, setClaimantRollNo] = useState('');
  const [claimantClass, setClaimantClass] = useState('');
  const [claimantContact, setClaimantContact] = useState('');
  const [proofDetails, setProofDetails] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !item) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!claimantName.trim() || !claimantRollNo.trim() || !claimantClass.trim() || !proofDetails.trim()) {
      setError('Please fill in your name, roll number, class, and proof details.');
      return;
    }

    onSubmitClaim({
      itemId: item.id,
      claimantName: claimantName.trim(),
      claimantRollNo: claimantRollNo.trim().toUpperCase(),
      claimantClass: claimantClass.trim(),
      claimantContact: claimantContact.trim() || 'Not specified',
      proofDetails: proofDetails.trim(),
    });

    // Fire confetti for successful claim submission
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    setSubmitted(true);
  };

  const handleCloseAndReset = () => {
    setSubmitted(false);
    setClaimantName('');
    setClaimantRollNo('');
    setClaimantClass('');
    setClaimantContact('');
    setProofDetails('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Claim Item Ownership</h2>
              <p className="text-xs text-indigo-100">Verification & Handshake Process</p>
            </div>
          </div>
          <button
            onClick={handleCloseAndReset}
            className="p-2 rounded-xl text-indigo-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Claim Registered Successfully!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Your claim for <span className="font-semibold text-slate-900">"{item.title}"</span> has been logged. 
              The finder (<span className="font-medium text-indigo-600">{item.finderOrSeekerName}</span>, Roll: {item.rollNumber}) 
              or campus security will review your proof.
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-left space-y-1">
              <div><strong>Item:</strong> {item.title}</div>
              <div><strong>Location Found:</strong> {item.location}</div>
              {item.officeHandoverLocation && (
                <div><strong>Collection Point:</strong> {item.officeHandoverLocation}</div>
              )}
            </div>
            <button
              onClick={handleCloseAndReset}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
            >
              Back to Campus Feed
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Item Mini Card */}
            <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-xl object-cover border border-indigo-200 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                <p className="text-[11px] text-slate-500 truncate">Found at: {item.location}</p>
                <p className="text-[11px] text-indigo-700 font-medium truncate">
                  Finder: {item.finderOrSeekerName} ({item.rollNumber})
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Claimant Info */}
            <div className="space-y-3">
              <div>
                <label htmlFor="claimant-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="claimant-name"
                  type="text"
                  required
                  value={claimantName}
                  onChange={(e) => setClaimantName(e.target.value)}
                  placeholder="e.g. Sahil Khan"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="claimant-roll" className="block text-xs font-bold text-slate-700 mb-1">
                    Your Roll No <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="claimant-roll"
                    type="text"
                    required
                    value={claimantRollNo}
                    onChange={(e) => setClaimantRollNo(e.target.value)}
                    placeholder="e.g. 23IT2041"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                  />
                </div>
                <div>
                  <label htmlFor="claimant-class" className="block text-xs font-bold text-slate-700 mb-1">
                    Class / Dept <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="claimant-class"
                    type="text"
                    required
                    value={claimantClass}
                    onChange={(e) => setClaimantClass(e.target.value)}
                    placeholder="e.g. B.Tech IT 2nd Year"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="claimant-contact" className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone / WhatsApp
                </label>
                <input
                  id="claimant-contact"
                  type="tel"
                  value={claimantContact}
                  onChange={(e) => setClaimantContact(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {/* Crucial: Proof of Ownership Question */}
              <div>
                <label htmlFor="claimant-proof" className="block text-xs font-bold text-slate-700 mb-1">
                  Confidential Proof of Ownership <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="claimant-proof"
                  required
                  rows={3}
                  value={proofDetails}
                  onChange={(e) => setProofDetails(e.target.value)}
                  placeholder="Describe unique details that prove you own this (e.g., lock-screen wallpaper, specific sticker, serial number, scratch on corner, contents inside wallet/pouch)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  This explanation is confidential and visible only to the finder and campus security for verification.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseAndReset}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                Confirm Claim
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
