import { useState, useEffect } from 'react';
import { 
  X, 
  IdCard, 
  Check, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Hash, 
  Layers, 
  Briefcase, 
  AlertCircle,
  Building,
  Upload,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { emailService, isRealEmailConfigured } from '../services/emailService.js';

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

export const CampusIdModal = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onSwitchToLogin,
}) => {
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' or 'TEACHER'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [section, setSection] = useState('');
  const [semesterOrDesignation, setSemesterOrDesignation] = useState('3rd Semester');
  const [rollNumber, setRollNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');

  // OTP Verification States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Prepopulate if currentProfile is passed
  useEffect(() => {
    if (currentProfile) {
      setRole(currentProfile.role || 'STUDENT');
      setName(currentProfile.name || '');
      setEmail(currentProfile.email || '');
      setMobile(currentProfile.mobile || '');
      setAdmissionNumber(currentProfile.admissionNumber || '');
      setBranch(currentProfile.branch || BRANCHES[0]);
      setSection(currentProfile.section || '');
      setSemesterOrDesignation(currentProfile.semesterOrDesignation || (currentProfile.role === 'TEACHER' ? 'Assistant Professor' : '3rd Semester'));
      setRollNumber(currentProfile.rollNumber || '');
      setAvatarUrl(currentProfile.avatarUrl || '');
      setIsEmailVerified(true);
    } else {
      // Default reset
      setRole('STUDENT');
      setName('');
      setEmail('');
      setMobile('');
      setAdmissionNumber('');
      setBranch(BRANCHES[0]);
      setSection('');
      setSemesterOrDesignation('3rd Semester');
      setRollNumber('');
      setAvatarUrl('');
      setIsEmailVerified(false);
    }
    setOtpSent(false);
    setIsSendingOtp(false);
    setDeliveryStatus(null);
    setGeneratedOtp('');
    setEnteredOtp('');
    setOtpError('');
    setError('');
  }, [currentProfile, isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Send OTP
  const handleSendOtp = async () => {
    setOtpError('');
    setError('');
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid college email address first (e.g., yourname@college.edu).');
      return;
    }

    // Generate random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setIsSendingOtp(true);

    try {
      const result = await emailService.sendOtpEmail(cleanEmail, code, name || 'Campus Member');
      setDeliveryStatus(result);
      setOtpSent(true);
      setEnteredOtp('');
      setOtpCountdown(45);
    } catch (err) {
      console.error(err);
      setOtpError('Failed to dispatch verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify entered OTP
  const handleVerifyOtp = () => {
    setOtpError('');
    if (enteredOtp.trim() === generatedOtp.trim()) {
      setIsEmailVerified(true);
      setOtpSent(false);
      setGeneratedOtp('');
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      setOtpError('Invalid OTP code. Please enter the correct 6-digit code.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid college email ID.');
      return;
    }
    if (!isEmailVerified) {
      setError('Please verify your college email address via OTP before saving your ID.');
      return;
    }
    if (!mobile.trim()) {
      setError('Please enter your active mobile number so lost item finders can reach you.');
      return;
    }
    if (!admissionNumber.trim()) {
      setError(role === 'STUDENT' ? 'College Admission Number is required.' : 'Faculty / Employee ID is required.');
      return;
    }

    // Role-specific validation
    if (role === 'STUDENT') {
      if (!rollNumber.trim()) {
        setError('Student Roll Number is required.');
        return;
      }
      if (!section.trim()) {
        setError('Please type your section / division.');
        return;
      }
    }

    const saved = onSaveProfile({
      id: currentProfile?.id,
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      admissionNumber: admissionNumber.trim().toUpperCase(),
      branch: role === 'STUDENT' ? branch : 'Faculty Member',
      section: role === 'STUDENT' ? section.trim() : '',
      semesterOrDesignation,
      rollNumber: role === 'STUDENT' ? rollNumber.trim().toUpperCase() : `FAC-${admissionNumber.trim().toUpperCase()}`,
      avatarUrl: avatarUrl || undefined,
      isEmailVerified: true,
    });

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <IdCard className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                {currentProfile ? 'Update Campus Digital ID' : 'Create Campus Digital ID'}
              </h2>
              <p className="text-xs text-indigo-200">
                Official profile verification with College Email OTP check
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection: Student vs Teacher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Campus Role <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole('STUDENT');
                  setSemesterOrDesignation('3rd Semester');
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 border transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('TEACHER');
                  setSemesterOrDesignation('Assistant Professor');
                }}
                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 border transition-all cursor-pointer ${
                  role === 'TEACHER'
                    ? 'bg-violet-700 text-white border-violet-700 shadow-md shadow-violet-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Teacher / Faculty</span>
              </button>
            </div>
            {role === 'TEACHER' && (
              <p className="mt-1.5 text-[11px] text-slate-500 italic">
                Note: Branch and Section coordinates are not required for Teacher / Faculty profiles.
              </p>
            )}
          </div>

          {/* Name & College Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-name" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Full Name</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'STUDENT' ? 'e.g. Rahul Sharma' : 'e.g. Dr. Ananya Mukherjee'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="user-email" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span>College Email ID</span> <span className="text-rose-500">*</span>
                </label>
                {isEmailVerified && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  id="user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isEmailVerified) setIsEmailVerified(false);
                    setOtpSent(false);
                  }}
                  placeholder="e.g. name@college.edu"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-hidden ${
                    isEmailVerified
                      ? 'border-emerald-300 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500'
                      : 'border-slate-200 focus:ring-2 focus:ring-indigo-500'
                  }`}
                />

                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpCountdown > 0 || isSendingOtp}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    {isSendingOtp ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : otpSent ? (
                      otpCountdown > 0 ? `${otpCountdown}s` : 'Resend'
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OTP Verification Interactive Card */}
          {otpSent && !isEmailVerified && (
            <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Enter 6-Digit Email Verification Code</span>
                </div>
                <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires in 10 mins</span>
                </div>
              </div>

              {/* Delivery notification & Demo test box */}
              {deliveryStatus?.provider !== 'SIMULATED' ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Real Email Dispatched via {deliveryStatus?.provider}!</span>
                  </div>
                  <p className="mt-1 text-emerald-700 text-[11px]">
                    A verification code has been dispatched to <strong>{email}</strong>. Check your inbox and spam folder.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-white border border-indigo-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-700">
                      <span>📬 Code generated for: <strong>{email}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(generatedOtp)}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                    >
                      Auto-fill Code
                    </button>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-100 text-[11px] text-indigo-950 flex items-center justify-between">
                    <div>
                      <span className="font-semibold block">Browser Testing Code:</span>
                      <span>Your 6-digit OTP is: <strong className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-indigo-200 tracking-wider text-slate-900">{generatedOtp}</strong></span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">
                    💡 <em>Note:</em> In modern browsers, sending emails to real external inboxes requires an email API service (like free EmailJS or Supabase). See the Email Delivery Guide in README to connect real dispatch in 2 minutes!
                  </p>
                </div>
              )}

              {otpError && (
                <div className="text-xs text-rose-600 font-medium">
                  {otpError}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-indigo-300 bg-white font-mono text-base font-bold text-slate-900 tracking-widest text-center focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify Email</span>
                </button>
              </div>
            </div>
          )}

          {/* Mobile No & College Admission No / Employee ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="user-mobile" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-600" />
                <span>Mobile Number</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-mobile"
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="user-admission" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                <span>{role === 'STUDENT' ? 'College Admission No' : 'Faculty / Employee ID'}</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-admission"
                type="text"
                required
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder={role === 'STUDENT' ? 'e.g. ADM-2023-9081' : 'e.g. EMP-CSE-042'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
              />
            </div>
          </div>

          {/* Branch & Section - ONLY FOR STUDENTS (Removed for Teachers) */}
          {role === 'STUDENT' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="user-branch" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Branch / Department</span> <span className="text-rose-500">*</span>
                </label>
                <select
                  id="user-branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white cursor-pointer"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user-section" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Section / Division</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-section"
                  type="text"
                  required
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="Type your section (e.g. A, B, Section-1, Batch 2)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Semester (for Students) vs Designation (for Teachers) & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={role === 'TEACHER' ? 'sm:col-span-2' : ''}>
              <label htmlFor="user-sem-desig" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>{role === 'STUDENT' ? 'Current Semester' : 'Faculty Designation'}</span> <span className="text-rose-500">*</span>
              </label>
              <select
                id="user-sem-desig"
                value={semesterOrDesignation}
                onChange={(e) => setSemesterOrDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white cursor-pointer"
              >
                {(role === 'STUDENT' ? SEMESTERS : TEACHER_DESIGNATIONS).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Roll Number - only for students */}
            {role === 'STUDENT' && (
              <div>
                <label htmlFor="user-roll" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Student Roll Number</span> <span className="text-rose-500">*</span>
                </label>
                <input
                  id="user-roll"
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 22CS1045"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                />
              </div>
            )}
          </div>

          {/* Optional Profile Photo */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-indigo-400" />
              )}
            </div>

            <div className="flex-1">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-indigo-600" />
                <span>Upload ID Card Photo (Optional)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-[11px] text-slate-400">
                Shown to campus members when verifying returned belongings.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            {!currentProfile && onSwitchToLogin ? (
              <div className="text-xs text-slate-500">
                <span>Already registered? </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToLogin();
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  Sign In with Email
                </button>
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{currentProfile ? 'Save & Update ID' : 'Complete Sign Up'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
