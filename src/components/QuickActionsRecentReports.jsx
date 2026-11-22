import { ArrowRight, MapPin, Box, Gift, Sparkles, Clock, PackageSearch } from 'lucide-react';

export const QuickActionsRecentReports = ({
  recentItems = [],
  onOpenReportWithType,
  onOpenDetails,
  onScrollToBrowse,
}) => {
  // Only display real items reported by students/teachers — NO demo items
  const displayItems = recentItems.slice(0, 3);

  const formatItemTime = (item) => {
    if (item.timeAgo) return item.timeAgo;
    if (!item.createdAt) return 'Recently';
    const diffHours = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Quick Actions */}
        <div className="lg:col-span-6 space-y-4">
          {/* Section Title with Orange Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-5 bg-[#EA580C] rounded-full inline-block" />
            <h2 className="text-xl sm:text-2xl font-black text-[#1F1746] tracking-tight">
              Quick Actions
            </h2>
          </div>

          <div className="space-y-4">
            {/* Card 1: Report a Lost Item (Pastel Lilac) */}
            <div
              onClick={() => onOpenReportWithType('LOST')}
              className="group relative flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#EDE9FE]/90 to-[#F5F3FF] border border-purple-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Outlined Box Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-purple-200 flex items-center justify-center text-[#371B7A] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Box className="w-8 h-8 text-[#371B7A] stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1F1746] group-hover:text-[#371B7A] transition-colors">
                    Report a Lost Item
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Tell us what you lost
                  </p>
                </div>
              </div>

              {/* Purple Circle Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#371B7A] text-white flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>

            {/* Card 2: Report a Found Item (Pastel Mint) */}
            <div
              onClick={() => onOpenReportWithType('FOUND')}
              className="group relative flex items-center justify-between p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#D1FAE5]/80 to-[#ECFDF5] border border-emerald-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
            >
              <div className="flex items-center gap-4 sm:gap-5">
                {/* Outlined Gift / Found Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Gift className="w-8 h-8 text-emerald-600 stroke-[1.75]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#1F1746] group-hover:text-emerald-700 transition-colors">
                    Report a Found Item
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Help someone get it back
                  </p>
                </div>
              </div>

              {/* Teal / Emerald Circle Arrow Button */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm group-hover:translate-x-1 transition-transform">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Reports */}
        <div className="lg:col-span-6 space-y-4">
          {/* Section Header with Orange Indicator & View All Link */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#EA580C] rounded-full inline-block" />
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1746] tracking-tight">
                Recent Reports
              </h2>
            </div>
            {displayItems.length > 0 && (
              <button
                onClick={onScrollToBrowse}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#371B7A] hover:text-[#EA580C] transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of Recent Items — NO DEMO ITEMS */}
          {displayItems.length > 0 ? (
            <div className="space-y-3">
              {displayItems.map((item) => {
                const isFound = item.reportType === 'FOUND';
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenDetails(item)}
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-100 shadow-xs hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Thumbnail Image */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-purple-50 text-[#371B7A]">
                            <Box className="w-6 h-6" />
                          </div>
                        )}
                      </div>

                      {/* Title & Location details */}
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-bold text-[#1F1746] truncate">
                          {item.title}
                        </h4>
                        <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.location || 'Campus Ground'}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="shrink-0">{formatItemTime(item)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Pill Badge (Found = Mint, Lost = Soft Rose) */}
                    <div className="shrink-0 pl-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          isFound
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isFound ? 'Found' : 'Lost'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Empty State when no items have been reported yet */
            <div className="p-8 rounded-3xl bg-white border border-dashed border-purple-200/90 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center mb-3 border border-purple-100">
                <PackageSearch className="w-6 h-6 text-[#371B7A]" />
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#1F1746]">
                No Reports Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                Misplaced your belongings or found someone's student ID or keys? Be the first to report it on Back2U!
              </p>
              <button
                onClick={() => onOpenReportWithType('FOUND')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#371B7A] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Submit First Report</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};