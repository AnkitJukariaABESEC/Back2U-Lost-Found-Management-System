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
  CheckCircle2, 
  Sparkles, 
  Send,
  Loader2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { emailService } from '../services/emailService.js';

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

  // Verification Link States
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState(null);
  const [sentLinkUrl, setSentLinkUrl] = useState('');

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
    setLinkSent(false);
    setIsSendingLink(false);
    setDeliveryStatus(null);
    setError('');
  }, [currentProfile, isOpen]);

  // Check if current email is already verified in storage
  useEffect(() => {
    if (email && emailService.isEmailVerified(email)) {
      setIsEmailVerified(true);
    }
  }, [email]);

  // Cross-tab auto-verification listener
  useEffect(() => {
    const handleStorageChange = () => {
      if (email && emailService.isEmailVerified(email)) {
        setIsEmailVerified((prev) => {
          if (!prev) {
            try {
              confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
            } catch {}
          }
          return true;
        });
        setLinkSent(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [email]);

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

  // Trigger Send Verification Link
  const handleSendVerificationLink = async () => {
    setError('');
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please provide a valid college email address first (e.g., yourname@college.edu).');
      return;
    }

    setIsSendingLink(true);
    setDeliveryStatus(null);

    try {
      const token = emailService.createVerificationToken(cleanEmail);
      const verificationUrl = `${window.location.origin}/?verify_email=${encodeURIComponent(cleanEmail)}&token=${token}`;
      setSentLinkUrl(verificationUrl);

      const result = await emailService.sendVerificationLink(cleanEmail, verificationUrl, name || 'Campus Member');
      if (!result.success) {
        setError(result.message || result.error || 'Failed to dispatch verification email.');
        return;
      }
      setDeliveryStatus(result);
      setLinkSent(true);
    } catch (err) {
      console.error(err);
      setError('Failed to send verification link. Please check your connection.');
    } finally {
      setIsSendingLink(false);
    }
  };

  // Direct Verification Handler (Simulates clicking the verification link directly)
  const handleDirectVerify = () => {
    if (!email) return;
    emailService.markEmailVerified(email);
    setIsEmailVerified(true);
    setLinkSent(false);
    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
      });
    } catch {}
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
      setError('Please click the verification link sent to your email before saving your ID.');
      return;
    }
    if (!mobile.trim()) {
      setError('Please enter your active mobile number so lost item finders can reach you.');
      return;
    }
    if (!admissionNumber.trim()) {
      setError(role === 'TEACHER' ? 'College Admission Number is required.' : 'Faculty / Employee ID is required.');
      return;
    }

    // Role-specific validation
    if (role === 'STUDENT') {
      if (!rollNumber.trim()) {
        setError('Roll Number is mandatory for Students.');
        return;
      }
      if (!section.trim()) {
        setError('Please type your section (e.g. A, B, C, CSE-1B).');
        return;
      }
    } else {
      if (!rollNumber.trim()) {
        setError('Desk ID / Employee Code is mandatory for Teachers.');
        return;
      }
    }

    const profileData = {
      role,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      admissionNumber: admissionNumber.trim().toUpperCase(),
      branch: role === 'TEACHER' ? 'Faculty / Academic Directorate' : branch,
      section: role === 'TEACHER' ? '' : section.trim().toUpperCase(),
      semesterOrDesignation,
      rollNumber: rollNumber.trim().toUpperCase(),
      avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${name.trim()}`,
      verifiedAt: new Date().toISOString(),
    };

    onSaveProfile(profileData);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-700 via-indigo-800 to-violet-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <IdCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {currentProfile ? 'Edit Campus Digital ID' : 'Sign Up — Create Campus Digital ID'}
              </h3>
              <p className="text-xs text-indigo-200">
                Official profile displayed to other students & teachers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer text-indigo-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Your Role on Campus <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === 'STUDENT'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('TEACHER')}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  role === 'TEACHER'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Teacher / Faculty</span>
              </button>
            </div>
          </div>

          {/* Name & Email Row */}
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
                    setLinkSent(false);
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
                    onClick={handleSendVerificationLink}
                    disabled={isSendingLink}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 transition-colors whitespace-nowrap cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
                  >
                    {isSendingLink ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>{linkSent ? 'Resend Link' : 'Send Link'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Verification Link Status Card */}
          {linkSent && !isEmailVerified && (
            <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  <span>Verification link sent to: {email}</span>
                </div>
                <div className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Waiting for click</span>
                </div>
              </div>
              <p className="text-xs text-indigo-700 leading-relaxed">
                Please check your email inbox (and spam folder) and click the verification link to automatically activate your account.
              </p>
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
                placeholder="e.g. 9876543210 (For lost item finders to contact you)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="user-admission" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-indigo-600" />
                <span>{role === 'STUDENT' ? 'College Admission Number' : 'Faculty / Employee ID'}</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="user-admission"
                type="text"
                required
                value={admissionNumber}
                onChange={(e) => setAdmissionNumber(e.target.value)}
                placeholder={role === 'STUDENT' ? 'e.g. 2021-ADM-8492' : 'e.g. FAC-CSE-092'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
              />
            </div>
          </div>

          {/* Branch & Section: OMITTED FOR TEACHERS */}
          {role === 'STUDENT' && (
            <div className="space-y-4 pt-1">
              {/* Branch */}
              <div>
                <label htmlFor="user-branch" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>College Branch</span> <span className="text-rose-500">*</span>
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

              {/* Section (Typing Area) & Semester */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="user-section" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Section (Type your section)</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="user-section"
                    type="text"
                    required
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="e.g. A, B, C, CSE-1A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Type your specific class section</span>
                </div>

                <div>
                  <label htmlFor="user-sem" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Current Semester</span> <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="user-sem"
                    value={semesterOrDesignation}
                    onChange={(e) => setSemesterOrDesignation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white cursor-pointer"
                  >
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Specific Designation */}
          {role === 'TEACHER' && (
            <div>
              <label htmlFor="user-designation" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>Academic Designation</span> <span className="text-rose-500">*</span>
              </label>
              <select
                id="user-designation"
                value={semesterOrDesignation}
                onChange={(e) => setSemesterOrDesignation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white cursor-pointer"
              >
                {TEACHER_DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Roll Number / Desk ID */}
          <div>
            <label htmlFor="user-roll" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-indigo-600" />
              <span>{role === 'STUDENT' ? 'University / College Roll Number' : 'Official Desk ID / Cabin Number'}</span> <span className="text-rose-500">*</span>
            </label>
            <input
              id="user-roll"
              type="text"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder={role === 'STUDENT' ? 'e.g. 2100290120045' : 'e.g. CABIN-402-IT'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
            />
          </div>

          {/* Photo / Avatar Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span>Profile Photo or Avatar</span> <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100">
            {onSwitchToLogin && (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                Already registered? Log In
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Save Campus Profile</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
