import { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { HeroBanner } from './components/HeroBanner.jsx';
import { QuickActionsRecentReports } from './components/QuickActionsRecentReports.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { ItemCard } from './components/ItemCard.jsx';
import { CaringCampusBanner } from './components/CaringCampusBanner.jsx';
import { InstallAppBanner } from './components/InstallAppBanner.jsx';
import { ReportItemModal } from './components/ReportItemModal.jsx';
import { ClaimModal } from './components/ClaimModal.jsx';
import { ItemDetailsModal } from './components/ItemDetailsModal.jsx';
import { CampusDeskModal } from './components/CampusDeskModal.jsx';
import { CampusIdModal } from './components/CampusIdModal.jsx';
import { ProfileViewerModal } from './components/ProfileViewerModal.jsx';
import { LoginModal } from './components/LoginModal.jsx';
import { Footer } from './components/Footer.jsx';
import { itemService } from './services/itemService.js';
import { profileService } from './services/profileService.js';
import { emailService } from './services/emailService.js';
import { Search, SearchX, Sparkles, Filter, PackageSearch, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  // Authentication & Campus Profile State
  const [currentProfile, setCurrentProfile] = useState(null);
  const [verifiedEmailNotice, setVerifiedEmailNotice] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCampusIdModalOpen, setIsCampusIdModalOpen] = useState(false);

  // Profile Viewer State (for inspecting finder/owner ID card)
  const [isProfileViewerModalOpen, setIsProfileViewerModalOpen] = useState(false);
  const [selectedProfileForViewer, setSelectedProfileForViewer] = useState(null);
  const [selectedItemTitleForViewer, setSelectedItemTitleForViewer] = useState('');

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState('FOUND');
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedItemForClaim, setSelectedItemForClaim] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState(null);
  const [isDeskModalOpen, setIsDeskModalOpen] = useState(false);

  // Reference for smooth scroll to browse section
  const browseRef = useRef(null);

  const scrollToBrowse = () => {
    if (browseRef.current) {
      browseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Load Data and Active Profile
  const loadData = async () => {
    setLoading(true);
    const [fetchedItems, fetchedClaims] = await Promise.all([
      itemService.getItems(),
      itemService.getClaims(),
      profileService.syncProfiles(),
    ]);
    setItems(fetchedItems);
    setClaims(fetchedClaims);

    const activeUser = profileService.getCurrentUser();
    setCurrentProfile(activeUser);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Check for Email Verification Link in URL (?verify_email=...&token=...)
    const params = new URLSearchParams(window.location.search);
    const verifyEmail = params.get('verify_email');
    const token = params.get('token');

    if (verifyEmail && token) {
      const cleanEmail = decodeURIComponent(verifyEmail).trim().toLowerCase();
      emailService.markEmailVerified(cleanEmail);
      setVerifiedEmailNotice(cleanEmail);

      // Clean query params from URL without full reload
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      // If user profile already exists, automatically log them in
      (async () => {
        const existing = await profileService.findProfileByQuery(cleanEmail);
        if (existing) {
          const result = await profileService.login(cleanEmail);
          if (result.success) {
            setCurrentProfile(result.profile);
          }
        } else {
          // Open Sign Up modal immediately so user can complete registration
          setIsCampusIdModalOpen(true);
        }
      })();
    }
  }, []);

  // Handlers for Authentication & Profile
  const handleLogin = async (email) => {
    const result = await profileService.login(email);
    if (result.success) {
      setCurrentProfile(result.profile);
    }
    return result;
  };

  const handleLogout = () => {
    profileService.logout();
    setCurrentProfile(null);
  };

  const handleSaveProfile = async (profileData) => {
    const saved = await profileService.saveProfile(profileData);
    setCurrentProfile(saved);
  };

  const handleViewProfile = (profileOrItem, itemTitle = '') => {
    // If it's already a full profile object:
    if (profileOrItem && profileOrItem.email) {
      setSelectedProfileForViewer(profileOrItem);
    } else {
      // Normalize from item fields:
      setSelectedProfileForViewer({
        name: profileOrItem.finderOrSeekerName || profileOrItem.name,
        rollNumber: profileOrItem.rollNumber || 'N/A',
        admissionNumber: profileOrItem.admissionNumber || 'ADM-CAMPUS',
        branch: profileOrItem.classDepartment || profileOrItem.branch || 'Campus Department',
        section: (profileOrItem.rollNumber?.startsWith('FAC') || profileOrItem.role === 'TEACHER') ? '' : (profileOrItem.section || ''),
        semesterOrDesignation: profileOrItem.semesterOrDesignation || 'Campus Member',
        mobile: profileOrItem.contactPhone || profileOrItem.mobile || 'Available via Desk',
        email: profileOrItem.contactEmail || profileOrItem.email || 'student@college.edu',
        role: (profileOrItem.rollNumber?.startsWith('FAC') || profileOrItem.role === 'TEACHER') ? 'TEACHER' : 'STUDENT',
        avatarUrl: profileOrItem.avatarUrl,
      });
    }
    setSelectedItemTitleForViewer(itemTitle);
    setIsProfileViewerModalOpen(true);
  };

  // Handlers for Items
  const handleOpenReportModal = (type = 'FOUND') => {
    // If not logged in, prompt user to login/signup first
    if (!currentProfile) {
      setIsLoginModalOpen(true);
      return;
    }
    setReportModalType(type);
    setIsReportModalOpen(true);
  };

  const handleCreateItem = async (newItemData) => {
    try {
      const created = await itemService.createItem(newItemData);
      setItems((prev) => [created, ...prev.filter((it) => it.id !== created.id)]);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
    } catch (err) {
      console.error('Failed to create item:', err);
    }
  };

  const handleOpenClaimModal = (item) => {
    if (!currentProfile) {
      setIsLoginModalOpen(true);
      return;
    }
    setSelectedItemForClaim(item);
    setIsClaimModalOpen(true);
  };

  const handleSubmitClaim = async (claimData) => {
    const newClaim = await itemService.submitClaim(claimData);
    setClaims((prev) => [newClaim, ...prev]);
    setItems((prev) =>
      prev.map((it) => (it.id === claimData.itemId ? { ...it, status: 'CLAIM_PENDING' } : it))
    );
  };

  const handleOpenDetails = (item) => {
    setSelectedItemForDetails(item);
    setIsDetailsModalOpen(true);
  };

  // Automatic delete when claim is approved
  const handleApproveClaim = async (claimId) => {
    await itemService.updateClaimStatus(claimId, 'APPROVED');
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    await loadData();
    setIsDetailsModalOpen(false);
  };

  const handleRejectClaim = async (claimId) => {
    await itemService.updateClaimStatus(claimId, 'REJECTED');
    await loadData();
    setIsDetailsModalOpen(false);
  };

  // Automatic delete when marked as returned
  const handleMarkReturned = async (itemId) => {
    await itemService.deleteItem(itemId);
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    setIsDetailsModalOpen(false);
    setSelectedItemForDetails(null);
  };

  // Filtered Items Logic (Search by item name, description, student name, roll number, or location)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }
      // Type filter
      if (selectedType !== 'ALL' && item.reportType !== selectedType) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        const matchesLocation = item.location?.toLowerCase().includes(query);
        const matchesFinderName = item.finderOrSeekerName?.toLowerCase().includes(query);
        const matchesRoll = item.rollNumber?.toLowerCase().includes(query);
        const matchesClass = item.classDepartment?.toLowerCase().includes(query);

        return (
          matchesTitle ||
          matchesDesc ||
          matchesLocation ||
          matchesFinderName ||
          matchesRoll ||
          matchesClass
        );
      }
      return true;
    });
  }, [items, selectedCategory, selectedStatus, selectedType, searchQuery]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: items.length };
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FD] selection:bg-[#371B7A] selection:text-white animate-in fade-in duration-300">
      {/* Email Verification Success Notification Banner */}
      {verifiedEmailNotice && (
        <div className="bg-emerald-600 text-white py-2.5 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
          <span>Email <strong>{verifiedEmailNotice}</strong> has been verified successfully!</span>
          <button
            onClick={() => setVerifiedEmailNotice('')}
            className="ml-2 text-white/80 hover:text-white underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onOpenReportModal={handleOpenReportModal}
        onOpenDeskModal={() => setIsDeskModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenSignUpModal={() => setIsCampusIdModalOpen(true)}
        onOpenCampusIdModal={() => setIsCampusIdModalOpen(true)}
        onLogout={handleLogout}
        currentProfile={currentProfile}
        itemsCount={items.length}
        onScrollToBrowse={scrollToBrowse}
      />

      {/* Hero Section */}
      <HeroBanner
        onOpenReportWithType={handleOpenReportModal}
        onScrollToBrowse={scrollToBrowse}
      />

      {/* Quick Actions (Report Lost Item / Report Found Item) & Recent Reports (No Demo Items) */}
      <QuickActionsRecentReports
        recentItems={items}
        onOpenReportWithType={handleOpenReportModal}
        onOpenDetails={handleOpenDetails}
        onScrollToBrowse={scrollToBrowse}
      />

      {/* Campus Belongings Browse & Search Section */}
      <div ref={browseRef} className="scroll-mt-24">
        {/* Search Bar matching the modern pill aesthetic */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name, description, student name, or roll number..."
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-full bg-white border border-slate-200/90 shadow-sm text-slate-900 placeholder:text-slate-400 text-sm sm:text-base focus:outline-hidden focus:ring-2 focus:ring-[#371B7A] focus:border-[#371B7A] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category & Status Filter Bar */}
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          onSelectStatus={setSelectedStatus}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          categoryCounts={categoryCounts}
          totalResults={filteredItems.length}
        />
      </div>

      {/* Main Content Area: Campus Listings Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Section Heading & Filter Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-[#EA580C] rounded-full inline-block" />
              <h2 className="text-xl sm:text-2xl font-black text-[#1F1746] tracking-tight flex items-center gap-2">
                <span>Campus Belongings Feed</span>
                {selectedCategory !== 'ALL' && (
                  <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-[#371B7A] font-bold">
                    Filtered Category
                  </span>
                )}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Click on any finder's name or "View Profile" to inspect their verified Student/Teacher ID Card. Claimed items auto-delete once returned.
            </p>
          </div>

          {(searchQuery || selectedCategory !== 'ALL' || selectedStatus !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setSelectedStatus('ALL');
                setSelectedType('ALL');
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#371B7A] hover:text-[#2C1563] bg-purple-50 hover:bg-purple-100 px-3.5 py-1.5 rounded-full transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#371B7A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Fetching campus listings...
            </p>
          </div>
        ) : items.length === 0 ? (
          /* Empty Initial State - Zero items reported */
          <div className="my-10 p-8 sm:p-14 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center mx-auto mb-4 border border-purple-100">
              <PackageSearch className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#1F1746]">No Belongings Reported Yet</h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              The lost and found registry is currently clear. Found someone's student ID, keys, or notebook? Or misplaced something on campus?
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleOpenReportModal('FOUND')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-[#371B7A] hover:bg-[#2C1563] shadow-md shadow-purple-900/20 transition-all cursor-pointer"
              >
                <span>📦 Report Found Item</span>
              </button>
              <button
                onClick={() => handleOpenReportModal('LOST')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <span>🔍 Report Lost Item</span>
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          /* Empty Search State */
          <div className="my-10 p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-purple-50 text-[#371B7A] flex items-center justify-center mx-auto mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#1F1746]">No matching belongings found</h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
              We couldn't find any reports matching "{searchQuery}". Try searching with a broader keyword, roll number, or department.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setSelectedStatus('ALL');
                  setSelectedType('ALL');
                }}
                className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
              <button
                onClick={() => handleOpenReportModal('LOST')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-[#EA580C] hover:bg-[#D94E07] shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Post Lost Query</span>
              </button>
            </div>
          </div>
        ) : (
          /* Item Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onOpenDetails={handleOpenDetails}
                onClaimItem={handleOpenClaimModal}
                onViewProfile={handleViewProfile}
              />
            ))}
          </div>
        )}
      </main>

      {/* Caring Campus Banner matching FindIt */}
      <CaringCampusBanner onOpenReportModal={handleOpenReportModal} />

      {/* Footer */}
      <Footer
        onOpenReportModal={() => handleOpenReportModal('FOUND')}
        onOpenDeskModal={() => setIsDeskModalOpen(true)}
      />

      {/* Modals */}
      <ReportItemModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleCreateItem}
        currentProfile={currentProfile}
        onOpenCampusIdModal={() => {
          setIsReportModalOpen(false);
          setIsCampusIdModalOpen(true);
        }}
        initialType={reportModalType}
      />

      <ClaimModal
        item={selectedItemForClaim}
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        onSubmitClaim={handleSubmitClaim}
      />

      <ItemDetailsModal
        item={selectedItemForDetails}
        claims={claims}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onClaimItem={handleOpenClaimModal}
        onApproveClaim={handleApproveClaim}
        onRejectClaim={handleRejectClaim}
        onMarkReturned={handleMarkReturned}
        onViewProfile={handleViewProfile}
      />

      <CampusDeskModal
        isOpen={isDeskModalOpen}
        onClose={() => setIsDeskModalOpen(false)}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
        onSwitchToSignUp={() => {
          setIsLoginModalOpen(false);
          setIsCampusIdModalOpen(true);
        }}
      />

      {/* Sign Up Modal */}
      <CampusIdModal
        isOpen={isCampusIdModalOpen}
        onClose={() => setIsCampusIdModalOpen(false)}
        currentProfile={currentProfile}
        initialEmail={verifiedEmailNotice}
        onSaveProfile={handleSaveProfile}
        onSwitchToLogin={() => {
          setIsCampusIdModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Profile Viewer Modal */}
      <ProfileViewerModal
        profile={selectedProfileForViewer}
        itemTitle={selectedItemTitleForViewer}
        isOpen={isProfileViewerModalOpen}
        onClose={() => setIsProfileViewerModalOpen(false)}
      />

      {/* Android PWA Install App Banner */}
      <InstallAppBanner />
    </div>
  );
}