import { useState, useEffect } from 'react';
import { 
  MapPin, 
  LogIn, 
  UserPlus, 
  Mail, 
  User, 
  Phone, 
  GraduationCap, 
  Hash, 
  Briefcase, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  ArrowRight,
  Send,
  Loader2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { emailService } from '../services/emailService.js';
import { profileService } from '../services/profileService.js';
import { InstallAppBanner } from './InstallAppBanner.jsx';

const BRANCHES = [
  'Computer Science and Engineering (CSE-1)',
  'Computer Science and Engineering (CSE-2)',
  'Computer Science and Engineering (CSE-3)',
  'Electronics and Communication Engineering',
  'Electrical and Computer Engineering',
  'Mechanical Engineering',
  'CSE (AI-ML)',
  'CSE (DS)',
];

const SEMESTERS = [
  '1st Semester',
  '2nd Semester',
  '3rd Semester',
  '4th Semester',
  '5th Semester',
  '6th Semester',
  '7th Semester',
  '8th Semester',
];

const TEACHER_DESIGNATIONS = [
  'Assistant Professor',
  'Associate Professor',
  'Professor',
  'Head of Department (HOD)',
  'Lab Instructor',
  'Dean / Directorate',
];

const DRAFT_KEY = 'back2u_signup_draft_v1';

export const FrontAuthPage = ({ onAuthSuccess, onGuestPreview, initialVerifiedEmail = '' }) => {
  // Always default to SIGNUP tab so users can complete their details after email verification
  const [activeTab, setActiveTab] = useState('SIGNUP');

  // Load any previously typed signup draft so opening email in new tab doesn't wipe fields
  const getDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };
  const draft = getDraft();

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState(initialVerifiedEmail || '');
  const [loginError, setLoginError] = useState('');

  // --- SIGNUP STATE ---
  const [role, setRole] = useState(draft.role || 'STUDENT');
  const [name, setName] = useState(draft.name || '');
  const [signupEmail, setSignupEmail] = useState(initialVerifiedEmail || draft.signupEmail || '');
  const [mobile, setMobile] = useState(draft.mobile || '');
  const [admissionNumber, setAdmissionNumber] = useState(draft.admissionNumber || '');
  const [branch, setBranch] = useState(draft.branch || BRANCHES[0]);
  const [section, setSection] = useState(draft.section || '');
  const [semesterOrDesignation, setSemesterOrDesignation] = useState(draft.semesterOrDesignation || '3rd Semester');
  const [rollNumber, setRollNumber] = useState(draft.rollNumber || '');
  const [avatarUrl, setAvatarUrl] = useState(draft.avatarUrl || '');
  const [signupError, setSignupError] = useState('');

  // Verification Link States
  const [isEmailVerified, setIsEmailVerified] = useState(
    Boolean(initialVerifiedEmail) || Boolean(signupEmail && emailService.isEmailVerified(signupEmail))
  );
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [sentMessage, setSentMessage] = useState('');

  // Persist draft in localStorage as user types
  useEffect(() => {
    try {
      const data = {
        role,
        name,
        signupEmail,
        mobile,
        admissionNumber,
        branch,
        section,
        semesterOrDesignation,
        rollNumber,
        avatarUrl,
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch {}
  }, [role, name, signupEmail, mobile, admissionNumber, branch, section, semesterOrDesignation, rollNumber, avatarUrl]);

  // When initialVerifiedEmail arrives from clicking email link
  useEffect(() => {
    if (initialVerifiedEmail) {
      setSignupEmail(initialVerifiedEmail);
      setLoginEmail(initialVerifiedEmail);
      setIsEmailVerified(true);
      setActiveTab('SIGNUP'); // MUST ALWAYS be on SIGNUP so user can complete filling remaining details!
      setSignupError('');
    }
  }, [initialVerifiedEmail]);

  // Check if current signup email is verified
  useEffect(() => {
    if (signupEmail && emailService.isEmailVerified(signupEmail)) {
      setIsEmailVerified(true);
    }
  }, [signupEmail]);

  // Cross-tab auto-verification listener (e.g. if link is clicked in mobile or another window)
  useEffect(() => {
    const handleStorageChange = () => {
      if (signupEmail && emailService.isEmailVerified(signupEmail)) {
        setIsEmailVerified((prev) => {
          if (!prev) {
            try {
              confetti({
                particleCount: 60,
                spread: 60,
                origin: { y: 0.6 },
              });
            } catch {}
          }
          return true;
        });
        setLinkSent(false);
        setActiveTab('SIGNUP'); // Stay firmly on SIGNUP tab so user can complete filling details!
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [signupEmail]);

  // Handle Login submission (Email Only)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const clean = loginEmail.trim().toLowerCase();
    if (!clean) {
      setLoginError('Please enter your college email address.');
      return;
    }

    const result = profileService.login(clean);
    if (result.success) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      onAuthSuccess(result.profile);
    } else {
      setLoginError(result.message || 'No registered Campus ID found with this email.');
    }
  };

  // Handle Send Verification Link directly to user's email
  const handleSendVerificationLink = async () => {
    setSignupError('');

    const cleanEmail = signupEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setSignupError('Please enter a valid college email address first (e.g. yourname@college.edu).');
      return;
    }

    setIsSendingLink(true);

    try {
      // 1. Generate token
      const token = emailService.createVerificationToken(cleanEmail);

      // 2. Build verification link
      const verificationUrl = `${window.location.origin}/?verify_email=${encodeURIComponent(cleanEmail)}&token=${token}`;

      // 3. Dispatch directly to recipient's email address
      const delivery = await emailService.sendVerificationLink(
        cleanEmail,
        verificationUrl,
        name.trim() || (role === 'TEACHER' ? 'Faculty Member' : 'Student')
      );

      if (!delivery.success) {
        setSignupError(delivery.message || delivery.error || 'Failed to dispatch verification email.');
        return;
      }

      setLinkSent(true);
      setSentMessage(delivery.message || `Verification link has been sent to ${cleanEmail}. Check your inbox!`);
    } catch (err) {
      console.error('Email link dispatch failed:', err);
      setSignupError('Failed to dispatch verification email. Please check your connection.');
    } finally {
      setIsSendingLink(false);
    }
  };

  // Handle Sign Up submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    setSignupError('');

    if (!name.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid college email address.');
      return;
    }
    if (!isEmailVerified) {
      setSignupError('Please check your email and click the verification link sent to your inbox before continuing.');
      return;
    }
    if (!mobile.trim() || mobile.length < 8) {
      setSignupError('Please enter a valid contact phone number.');
      return;
    }
    if (!admissionNumber.trim()) {
      setSignupError(role === 'TEACHER' ? 'Please enter your Employee / Faculty ID.' : 'Please enter your College Admission Number.');
      return;
    }
    if (role === 'STUDENT' && !section.trim()) {
      setSignupError('Please type your section (e.g., A, B, C, CSE-B).');
      return;
    }
    if (!rollNumber.trim()) {
      setSignupError('Please enter your Roll Number / Desk ID.');
      return;
    }

    const newProfile = {
      role,
      name: name.trim(),
      email: signupEmail.trim().toLowerCase(),
      mobile: mobile.trim(),
      admissionNumber: admissionNumber.trim().toUpperCase(),
      branch: role === 'TEACHER' ? 'Faculty / Academic Directorate' : branch,
      section: role === 'TEACHER' ? '' : section.trim().toUpperCase(),
      semesterOrDesignation,
      rollNumber: rollNumber.trim().toUpperCase(),
      avatarUrl: avatarUrl.trim() || `https://api.dicebear.com/7.x/identicon/svg?seed=${name.trim()}`,
      verifiedAt: new Date().toISOString(),
    };

    const saved = profileService.saveProfile(newProfile);
    profileService.login(saved.email);

    // Clear saved signup draft once ID is created
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch {}

    onAuthSuccess(saved);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F6FC] via-[#F8F9FD] to-purple-50 flex flex-col justify-between relative overflow-hidden">
      
      {/* Decorative Animated Blurred Blobs */}
      <div className="absolute top-0 right-0 -mr-28 -mt-28 w-[650px] h-[650px] rounded-full bg-gradient-to-br from-purple-200/50 to-indigo-100/40 blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 left-0 -ml-28 -mb-28 w-[500px] h-[500px] rounded-full bg-amber-100/50 blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Top Simple Brand Header */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#371B7A] flex items-center justify-center text-white shadow-md shadow-purple-900/20">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-[#1F1746]">
              Back<span className="text-[#EA580C]">2U</span>
            </span>
            <p className="text-[11px] font-medium text-slate-500 -mt-0.5">
              Lost & Found — Our Campus
            </p>
          </div>
        </div>

        {/* Guest Preview Button */}
        <button
          onClick={onGuestPreview}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-[#371B7A] hover:bg-purple-100/70 border border-[#371B7A]/20 transition-all cursor-pointer active:scale-95"
        >
          <Eye className="w-3.5 h-3.5 text-[#371B7A]" />
          <span>Browse as Guest</span>
        </button>
      </header>

      {/* Main Container: Split Hero Presentation + Animated Auth Card */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Visual Campus Hero & Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Orange Sparks */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#EA580C]" />
              <span>University Central Belongings Network</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1F1746] tracking-tight leading-[1.12]">
              Lost Something? <br />
              <span className="text-[#EA580C]">Found Something?</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-lg leading-relaxed">
              Create your verified Campus ID or sign in. When registering, we send an auto-verification link directly to your email inbox. Once clicked, you are automatically redirected to log in.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#371B7A] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-[#371B7A]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F1746]">Verified Campus IDs</h4>
                  <p className="text-[11px] text-slate-500">Students & Teachers only</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/90 border border-slate-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F1746]">Direct Email Link</h4>
                  <p className="text-[11px] text-slate-500">Auto-verifies & redirects</p>
                </div>
              </div>
            </div>

            {/* Illustrated Campus Mini Card */}
            <div className="relative overflow-hidden rounded-3xl border border-purple-200/60 shadow-lg bg-white p-4 max-w-md hidden sm:block">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=300&q=80"
                    alt="Campus"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-[#1F1746]">Auto-Delete on Claim</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Items are cleared automatically from the campus board once returned.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Animated Interactive Auth Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 sm:p-8 max-w-md mx-auto relative">
              
              {/* Tab Selector: Login vs Sign Up */}
              <div className="flex items-center p-1 bg-slate-100 rounded-full mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('LOGIN');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'LOGIN'
                      ? 'bg-[#371B7A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#371B7A]'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('SIGNUP');
                    setSignupError('');
                  }}
                  className={`flex-1 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'SIGNUP'
                      ? 'bg-[#371B7A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#371B7A]'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Sign Up</span>
                </button>
              </div>

              {/* VIEW 1: LOGIN FORM (Email Only) */}
              {activeTab === 'LOGIN' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-center pb-2">
                    <h3 className="text-xl font-black text-[#1F1746]">Welcome Back</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Enter your registered college email to access Back2U.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                      <div>
                        <span>{loginError}</span>
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={() => setActiveTab('SIGNUP')}
                            className="font-bold underline text-[#371B7A] cursor-pointer"
                          >
                            Click here to Sign Up with your details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#1F1746] mb-1.5">
                      College Email ID
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="e.g. rahul.sharma@college.edu"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#371B7A] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-[#371B7A] hover:bg-[#2C1563] shadow-md shadow-purple-900/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Log In to Campus Board</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Don't have a Campus ID?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('SIGNUP')}
                        className="font-bold text-[#EA580C] hover:underline cursor-pointer"
                      >
                        Create ID (Sign Up)
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* VIEW 2: SIGN UP FORM */}
              {activeTab === 'SIGNUP' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-in fade-in duration-200 max-h-[75vh] overflow-y-auto pr-1 scrollbar-none">
                  <div className="text-center pb-1">
                    <h3 className="text-lg font-black text-[#1F1746]">Create Campus ID</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter your email to receive an activation link directly in your inbox.
                    </p>
                  </div>

                  {signupError && (
                    <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  {/* Role Selector: Student vs Teacher */}
                  <div>
                    <label className="block text-xs font-bold text-[#1F1746] mb-1">
                      Campus Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('STUDENT')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          role === 'STUDENT'
                            ? 'bg-purple-50 border-[#371B7A] text-[#371B7A]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('TEACHER')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          role === 'TEACHER'
                            ? 'bg-purple-50 border-[#371B7A] text-[#371B7A]'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Briefcase className="w-4 h-4" />
                        <span>Teacher / Faculty</span>
                      </button>
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#1F1746] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === 'TEACHER' ? 'Prof. Ananya Sen' : 'Aarav Sharma'}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#371B7A] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* College Email & Link Dispatch */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#1F1746]">
                        College Email Address
                      </label>
                      {isEmailVerified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          required
                          disabled={isEmailVerified}
                          value={signupEmail}
                          onChange={(e) => {
                            setSignupEmail(e.target.value);
                            setIsEmailVerified(false);
                            setLinkSent(false);
                          }}
                          placeholder="student@college.edu"
                          className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:ring-1 focus:ring-[#371B7A] ${
                            isEmailVerified
                              ? 'border-emerald-300 bg-emerald-50/40 text-emerald-900 font-semibold'
                              : 'border-slate-200 bg-slate-50/50'
                          }`}
                        />
                      </div>
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendVerificationLink}
                          disabled={isSendingLink}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#EA580C] hover:bg-[#D94E07] text-white shrink-0 cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                        >
                          {isSendingLink ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Sending...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>{linkSent ? 'Resend Link' : 'Send Link'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Verification Status Banner (Sent to actual email) */}
                    {isEmailVerified ? (
                      <div className="mt-2.5 flex items-start gap-2.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2.5 rounded-2xl border border-emerald-300 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold">College Email Verified!</div>
                          <p className="text-[11px] text-emerald-700 font-normal mt-0.5">
                            Please complete your details below (Name, Mobile, Roll Number) and click &quot;Complete ID &amp; Enter Back2U&quot; to create your Campus ID.
                          </p>
                        </div>
                      </div>
                    ) : linkSent ? (
                      <div className="mt-2.5 p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-1.5 animate-in fade-in duration-300">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F1746]">
                          <Mail className="w-4 h-4 text-[#371B7A]" />
                          <span>Check Your Email Inbox</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          We sent a verification link to <strong>{signupEmail}</strong>.
                          Please open your email inbox (and spam folder), and click the link to verify your email and complete your signup details.
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 pt-1">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                          <span>Waiting for you to click the link in your email...</span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Mobile Number & Admission No */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="9876543210"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                        {role === 'TEACHER' ? 'Faculty ID' : 'Admission No'}
                      </label>
                      <input
                        type="text"
                        required
                        value={admissionNumber}
                        onChange={(e) => setAdmissionNumber(e.target.value)}
                        placeholder={role === 'TEACHER' ? 'FAC-9021' : 'ADM-2024-819'}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 uppercase"
                      />
                    </div>
                  </div>

                  {/* Student-Only Fields: Branch & Section (Strictly removed for Teachers) */}
                  {role === 'STUDENT' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                          Branch
                        </label>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer"
                        >
                          {BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                            Section (Type here)
                          </label>
                          <input
                            type="text"
                            required
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                            placeholder="e.g. A, B, CSE-1A"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                            Semester
                          </label>
                          <select
                            value={semesterOrDesignation}
                            onChange={(e) => setSemesterOrDesignation(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer"
                          >
                            {SEMESTERS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teacher-Only Designation */}
                  {role === 'TEACHER' && (
                    <div>
                      <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                        Academic Designation
                      </label>
                      <select
                        value={semesterOrDesignation}
                        onChange={(e) => setSemesterOrDesignation(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer"
                      >
                        {TEACHER_DESIGNATIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Roll Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#1F1746] mb-1">
                      Roll Number / Desk ID
                    </label>
                    <input
                      type="text"
                      required
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      placeholder={role === 'TEACHER' ? 'FAC-EE-04' : '21CS1045'}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 uppercase"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-[#371B7A] hover:bg-[#2C1563] shadow-md shadow-purple-900/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
                  >
                    <span>Complete ID & Enter Back2U</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-1">
                    <p className="text-[11px] text-slate-500">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('LOGIN')}
                        className="font-bold text-[#371B7A] hover:underline cursor-pointer"
                      >
                        Log in here
                      </button>
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Bottom Subtext */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500">
        © 2026 Back2U • Central Campus Belongings Recovery Network
      </footer>

      {/* Android PWA Install App Banner */}
      <InstallAppBanner />
    </div>
  );
};
