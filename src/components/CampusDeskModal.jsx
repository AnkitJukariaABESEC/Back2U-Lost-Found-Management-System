import { X, Building2, Phone, Clock, MapPin, ShieldCheck } from 'lucide-react';

export const CampusDeskModal = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const DESKS = [
    {
      title: 'Main Campus Security Post A',
      location: 'Ground Floor, Adjacent to Main Entrance Gate',
      timings: '24 Hours / 7 Days a week',
      contact: '+91 11-2345-6789 (Ext. 101)',
      inCharge: 'Officer S. Kumar',
      notes: 'Best for expensive electronics, keys, ID cards, and wallets found after 5 PM.',
    },
    {
      title: 'Central Library Circulation Desk',
      location: 'Central Library, 1st Floor Entry Foyer',
      timings: 'Monday - Saturday: 8:00 AM - 10:00 PM',
      contact: '+91 11-2345-6789 (Ext. 240)',
      inCharge: 'Chief Librarian Desk',
      notes: 'Drop-off point for books, notebooks, spectacles, calculators, and stationery.',
    },
    {
      title: 'Student Welfare & Affairs Office',
      location: 'Administrative Block, Room 102',
      timings: 'Monday - Friday: 9:00 AM - 5:00 PM',
      contact: '+91 11-2345-6789 (Ext. 150)',
      inCharge: 'Dean of Student Welfare Office',
      notes: 'Official mediation point for disputed claims and student ID card re-issuance.',
    },
    {
      title: 'Sports Complex Equipment Desk',
      location: 'Indoor Stadium Reception',
      timings: 'Daily: 6:00 AM - 8:00 PM',
      contact: '+91 11-2345-6789 (Ext. 310)',
      inCharge: 'Sports Officer',
      notes: 'Handles sports gear, water bottles, tracksuits, and gym lockers belongings.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10">
              <Building2 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Official Campus Desks</h2>
              <p className="text-xs text-indigo-200">Designated physical lost & found drop-off counters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Important Campus Policy:</span> When collecting high-value belongings (smartphones, laptops, wallets) from any campus desk, you must present your physical Student Identity Card and sign the campus property register.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {DESKS.map((desk) => (
              <div
                key={desk.title}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:bg-white transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{desk.title}</h3>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                    {desk.inCharge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{desk.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{desk.timings}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{desk.contact}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  {desk.notes}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
