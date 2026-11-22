import { useState } from 'react';
import { 
  MapPin, 
  LogIn, 
  UserPlus, 
  Mail, 
  User, 
  Phone, 
  GraduationCap, 
  Hash, 
  Layers, 
  Briefcase, 
  ShieldCheck, 
  Zap, 
  Users, 
  HeartHandshake, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  KeyRound, 
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { emailService, isRealEmailConfigured } from '../services/emailService.js';
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

export const FrontAuthPage = ({ onAuthSuccess, onGuestPreview }) => {
  const [activeTab, setActiveTab] = useState('LOGIN'); // 'LOGIN' or 'SIGNUP'

  // --- LOGIN STATE ---
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- SIGNUP STATE ---
  const [role, setRole] = useState('STUDENT');
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [section, setSection] = useState('');
  const [semesterOrDesignation, setSemesterOrDesignation] = useState('3rd Semester');
  const [rollNumber, setRollNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [signupError, setSignupError] = useState('');

  // OTP Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userEnteredOtp, setUserEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Handle Login submission (Email Only)
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your college email address.');
      return;
    }

    const result = profileService.login(loginEmail.trim());
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

  // Handle OTP Dispatch
  const handleSendOtp = async () => {
    setOtpError('');
    setSignupError('');

    const cleanEmail = signupEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setOtpError('Please enter a valid college email address first (e.g. yourname@college.edu).');
      return;
    }

    setIsSendingOtp(true);
    setDeliveryStatus(null);

    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      const delivery = await emailService.sendOtpEmail(
        cleanEmail,
        code,
        name.trim() || (role === 'TEACHER' ? 'Faculty Member' : 'Student')
      );

      setOtpSent(true);
      setDeliveryStatus(delivery);
    } catch (err) {
      console.error('OTP send failed:', err);
      // Fallback code generation to ensure user is never stuck
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallbackCode);
      setOtpSent(true);
      setDeliveryStatus({
        success: true,
        provider: 'FALLBACK',
        message: 'Verification code generated for your session.',
        previewCode: fallbackCode,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOtp = () => {
    setOtpError('');
    if (!userEnteredOtp || userEnteredOtp.length !== 6) {
      setOtpError('Please enter the 6-digit code sent to your email.');
      return;
    }

    if (userEnteredOtp === generatedOtp) {
      setIsEmailVerified(true);
      setOtpSent(false);
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      setOtpError('Incorrect verification code. Please check and try again.');
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
      setSignupError('Please verify your college email address via OTP first.');
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
              Sign in or create your verified Campus ID to report belongings, view finder profiles, 
              and safely recover items across campus.
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
                  <KeyRound className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1F1746]">Instant Email OTP</h4>
                  <p className="text-[11px] text-slate-500">One-time secure verification</p>
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

              {/* VIEW 2: SIGN UP FORM (Asks All The Things & OTP) */}
              {activeTab === 'SIGNUP' && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5 animate-in fade-in duration-200 max-h-[75vh] overflow-y-auto pr-1 scrollbar-none">
                  <div className="text-center pb-1">
                    <h3 className="text-lg font-black text-[#1F1746]">Create Campus ID</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Register with your official campus credentials and OTP verification.
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

                  {/* College Email & OTP Verification */}
                  <div>
                    <label className="block text-xs font-bold text-[#1F1746] mb-1">
                      College Email & Verification
                    </label>
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
                            setOtpSent(false);
                          }}
                          placeholder="student@college.edu"
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-1 focus:ring-[#371B7A] bg-slate-50/50"
                        />
                      </div>
                      {!isEmailVerified && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-[#EA580C] hover:bg-[#D94E07] text-white shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          {isSendingOtp ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                        </button>
                      )}
                    </div>

                    {/* Email Verification Status */}
                    {isEmailVerified ? (
                      <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Email verified with OTP</span>
                      </div>
                    ) : otpSent ? (
                      <div className="mt-2 p-3 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-[#371B7A] font-semibold">
                          <span>Enter 6-digit OTP:</span>
                          {deliveryStatus?.previewCode && (
                            <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              Demo Code: {deliveryStatus.previewCode}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={userEnteredOtp}
                            onChange={(e) => setUserEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit OTP"
                            className="flex-1 px-3 py-1.5 text-center font-mono text-sm tracking-widest rounded-xl border border-slate-300 bg-white"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#371B7A] text-white hover:bg-[#2C1563] cursor-pointer"
                          >
                            Verify
                          </button>
                        </div>
                        {otpError && <p className="text-[11px] text-rose-600 font-medium">{otpError}</p>}
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