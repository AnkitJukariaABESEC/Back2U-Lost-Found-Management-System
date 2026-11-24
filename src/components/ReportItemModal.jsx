import { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  Sparkles,
  AlertCircle,
  IdCard,
  UserCheck
} from 'lucide-react';
import { CATEGORIES, CAMPUS_LOCATIONS } from '../lib/constants.js';
import { compressImage } from '../utils/imageCompressor.js';

const PRESET_IMAGES = [
  { label: 'Student ID', url: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop&q=80' },
  { label: 'AirPods / Tech', url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80' },
  { label: 'Keys / Ring', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' },
  { label: 'Book / Notebook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
];

export const ReportItemModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentProfile,
  onOpenCampusIdModal,
  initialType = 'FOUND',
}) => {
  const [reportType, setReportType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('STUDENT_ID');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [imageUrl, setImageUrl] = useState('');

  // Student / Teacher Profile Details
  const [finderName, setFinderName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [classDept, setClassDept] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');

  // Campus Security Handover
  const [isHandedToDesk, setIsHandedToDesk] = useState(false);
  const [deskLocation, setDeskLocation] = useState('Main Gate Security Office (Post A)');

  const [error, setError] = useState('');

  // Auto-fill from currentProfile if available
  useEffect(() => {
    if (currentProfile) {
      setFinderName(currentProfile.name || '');
      setRollNumber(currentProfile.rollNumber || '');
      if (currentProfile.role === 'TEACHER') {
        setClassDept(`${currentProfile.semesterOrDesignation} (Faculty)`);
      } else {
        setClassDept(`${currentProfile.branch} (Sec: ${currentProfile.section}, ${currentProfile.semesterOrDesignation})`);
      }
      setContactPhone(currentProfile.mobile || '');
      setContactEmail(currentProfile.email || '');
      setAdmissionNo(currentProfile.admissionNumber || '');
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Please fill in item title, location, and description.');
      return;
    }
    if (!finderName.trim() || !rollNumber.trim() || !classDept.trim()) {
      setError('Name, Roll Number / ID, and Department are required.');
      return;
    }

    // Construct linked profile object so the owner who lost it can view all details
    const linkedProfile = currentProfile || {
      id: 'usr-' + Date.now(),
      name: finderName.trim(),
      email: contactEmail.trim().toLowerCase(),
      mobile: contactPhone.trim(),
      admissionNumber: admissionNo.trim().toUpperCase() || 'N/A',
      branch: classDept.trim(),
      section: 'Section A',
      semesterOrDesignation: 'Semester/Dept',
      rollNumber: rollNumber.trim().toUpperCase(),
      role: 'STUDENT',
    };

    onSubmit({
      title: title.trim(),
      reportType,
      category,
      description: description.trim(),
      location: location.trim(),
      date,
      imageUrl: imageUrl || undefined,
      status: isHandedToDesk ? 'HANDED_TO_OFFICE' : 'AVAILABLE',
      finderOrSeekerName: finderName.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      classDepartment: classDept.trim(),
      contactPhone: contactPhone.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      admissionNumber: admissionNo.trim() || undefined,
      officeHandoverLocation: isHandedToDesk ? deskLocation : undefined,
      finderProfile: linkedProfile,
    });

    onClose();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.7);
        setImageUrl(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Report Campus Belonging</h2>
            <p className="text-xs text-indigo-200 mt-0.5">
              Connect lost items with rightful campus owners in minutes
            </p>
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
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campus ID Link Banner */}
          {currentProfile ? (
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900">Posting from Verified Campus ID: </span>
                  <span className="text-indigo-800 font-semibold">{currentProfile.name}</span>
                  <span className="text-slate-500"> ({currentProfile.role === 'TEACHER' ? 'Faculty' : 'Student'}, {currentProfile.rollNumber || currentProfile.admissionNumber})</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenCampusIdModal}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
              >
                Switch ID
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <IdCard className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs text-amber-900">
                  You haven't created your Campus ID card yet. Create it once to auto-fill reports!
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenCampusIdModal}
                className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-1.5 rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                Create ID
              </button>
            </div>
          )}

          {/* Type Toggle: FOUND vs LOST */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              I Want To Report
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setReportType('FOUND')}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  reportType === 'FOUND'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>📦 I Found an Item</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType('LOST')}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  reportType === 'LOST'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>🔍 I Lost My Belonging</span>
              </button>
            </div>
          </div>

          {/* Item Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-title" className="block text-xs font-bold text-slate-700 mb-1">
                Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                id="item-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Student ID Card, Casio Calculator, Blue Flask"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label htmlFor="item-category" className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="item-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="item-description" className="block text-xs font-bold text-slate-700 mb-1">
              Description & Distinctive Marks <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="item-description"
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, brand, model, stickers, or distinguishing characteristics..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Location & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="item-location" className="block text-xs font-bold text-slate-700 mb-1">
                Campus Location <span className="text-rose-500">*</span>
              </label>
              <input
                id="item-location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Central Library 2nd floor, Canteen table 5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {CAMPUS_LOCATIONS.slice(0, 3).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setLocation(loc)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                  >
                    + {loc.split('-')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="item-date" className="block text-xs font-bold text-slate-700 mb-1">
                Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="item-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Reporter Campus Details */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Finder / Reporter Campus Identification
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="student-name" className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  value={finderName}
                  onChange={(e) => setFinderName(e.target.value)}
                  placeholder="e.g. Rohit Verma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="student-roll" className="block text-xs font-semibold text-slate-600 mb-1">
                  Roll No / Faculty ID <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-roll"
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="e.g. 22CS1098"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                />
              </div>

              <div>
                <label htmlFor="student-admission" className="block text-xs font-semibold text-slate-600 mb-1">
                  College Admission No
                </label>
                <input
                  id="student-admission"
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  placeholder="e.g. ADM-2023-9081"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-hidden uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label htmlFor="student-class" className="block text-xs font-semibold text-slate-600 mb-1">
                  Branch / Dept <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-class"
                  type="text"
                  required
                  value={classDept}
                  onChange={(e) => setClassDept(e.target.value)}
                  placeholder="e.g. B.Tech CSE (Sec A, 3rd Sem)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="student-phone" className="block text-xs font-semibold text-slate-600 mb-1">
                  Mobile Number (For Calling)
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label htmlFor="student-email" className="block text-xs font-semibold text-slate-600 mb-1">
                  College Email ID
                </label>
                <input
                  id="student-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Photo Section */}
          <div className="pt-3 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Photo (Upload or Select Preset)
            </label>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload From Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Or select a test photo:</span>
              </div>

              <div className="flex items-center gap-1.5">
                {PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      imageUrl === preset.url
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {imageUrl && (
              <div className="mt-3 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Campus Security Desk Checkbox */}
          {reportType === 'FOUND' && (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHandedToDesk}
                  onChange={(e) => setIsHandedToDesk(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  I have deposited this item at an official Campus Security / Office Desk
                </span>
              </label>

              {isHandedToDesk && (
                <div className="pl-6 pt-1">
                  <label htmlFor="desk-location" className="block text-[11px] font-medium text-slate-600 mb-1">
                    Select Drop-off Desk:
                  </label>
                  <select
                    id="desk-location"
                    value={deskLocation}
                    onChange={(e) => setDeskLocation(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Main Gate Security Office (Post A)">Main Gate Security Office (Post A)</option>
                    <option value="Central Library Ground Floor Helpdesk">Central Library Ground Floor Helpdesk</option>
                    <option value="Student Welfare Directorate Room 102">Student Welfare Directorate Room 102</option>
                    <option value="Sports Complex Reception">Sports Complex Reception</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Submit Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
