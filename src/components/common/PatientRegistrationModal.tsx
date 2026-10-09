import { useState, useId } from 'react';
import { motion } from 'framer-motion';
import {
  X, UserPlus, CheckCircle2, AlertTriangle,
  User, Phone, Mail, Building, Stethoscope,
  ShieldCheck, Loader2
} from 'lucide-react';
import { doctorService } from '../../services/api/doctorService';

interface PatientRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientRegistered: (patientId: string) => void;
}

export function PatientRegistrationModal({
  isOpen,
  onClose,
  onPatientRegistered
}: PatientRegistrationModalProps) {
  const nameId = useId();
  const dobId = useId();
  const ageId = useId();
  const genderId = useId();
  const bloodGroupId = useId();
  const phoneId = useId();
  const emailId = useId();
  const addressId = useId();
  const cityId = useId();
  const stateId = useId();
  const pincodeId = useId();
  const deptId = useId();
  const doctorId = useId();
  const emgNameId = useId();
  const emgPhoneId = useId();
  const langId = useId();
  const notesId = useId();
  const emailConsentId = useId();
  const smsConsentId = useId();
  const confirmDistinctId = useId();

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'Unknown',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    department: 'Cardiology',
    assignedDoctor: 'Dr. Rajesh Mehta',
    emergencyName: '',
    emergencyPhone: '',
    preferredLanguage: 'English',
    emailConsent: true,
    smsConsent: true,
    notes: ''
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [confirmedDistinct, setConfirmedDistinct] = useState(false);

  // Registration success state
  const [registeredPatient, setRegisteredPatient] = useState<{
    id: string;
    name: string;
    department: string;
    phone: string;
  } | null>(null);

  // Auto-calculate age from DOB
  const handleDobChange = (dobValue: string) => {
    let calculatedAge = formData.age;
    if (dobValue) {
      const birthDate = new Date(dobValue);
      const today = new Date();
      if (!isNaN(birthDate.getTime())) {
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age >= 0 && age < 130) {
          calculatedAge = age.toString();
        }
      }
    }
    setFormData(prev => ({
      ...prev,
      dob: dobValue,
      age: calculatedAge
    }));
    if (errors.dob) {
      setErrors(prev => ({ ...prev, dob: '' }));
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    // 1. Name (required)
    if (!formData.name.trim()) {
      errs.name = 'Patient full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Please enter at least 2 characters for the name.';
    }

    // 2. Mobile Phone (required)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Mobile number is required.';
    } else if (phoneDigits.length < 10) {
      errs.phone = 'Enter a valid 10-digit mobile number.';
    }

    // 3. Email (optional, but valid format if provided)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Please enter a valid email address.';
      }
    }

    // 4. DOB (optional, but not in future)
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      if (isNaN(birthDate.getTime())) {
        errs.dob = 'Invalid date format.';
      } else if (birthDate > today) {
        errs.dob = 'Date of birth cannot be in the future.';
      }
    }

    // 5. PIN Code (optional, but 5-6 digits if provided)
    if (formData.pincode.trim()) {
      const pinDigits = formData.pincode.replace(/\D/g, '');
      if (pinDigits.length < 5 || pinDigits.length > 6) {
        errs.pincode = 'PIN code should be 5-6 digits.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, overrideDuplicate: boolean = false) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        dob: formData.dob || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender,
        blood_group: formData.bloodGroup !== 'Unknown' ? formData.bloodGroup : undefined,
        contact_phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        department: formData.department,
        attending_physician: formData.assignedDoctor,
        emergency_contact_name: formData.emergencyName.trim() || undefined,
        emergency_contact_phone: formData.emergencyPhone.trim() || undefined,
        preferred_language: formData.preferredLanguage,
        email_consent: formData.emailConsent,
        sms_consent: formData.smsConsent,
        notes: formData.notes.trim() || undefined,
        allow_duplicate: overrideDuplicate || confirmedDistinct
      };

      const result = await doctorService.registerPatient(payload);

      if (result.status === 'duplicate_warning') {
        setDuplicateWarning(result);
        setSubmitting(false);
        return;
      }

      if (result.status === 'success' || result.patientId) {
        setRegisteredPatient({
          id: result.patientId || result.patient?.id,
          name: result.patient?.name || formData.name,
          department: result.patient?.department || formData.department,
          phone: result.patient?.contactPhone || formData.phone
        });
        setDuplicateWarning(null);
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      // Check if 409 duplicate
      if (err.message && err.message.includes('409')) {
        setDuplicateWarning({
          message: 'A patient with this contact phone or details already exists in MySQL.',
          matchedPatient: null
        });
      } else {
        setServerError(err.message || 'An unexpected error occurred while saving to MySQL database.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      dob: '',
      age: '',
      gender: 'Male',
      bloodGroup: 'Unknown',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      department: 'Cardiology',
      assignedDoctor: 'Dr. Rajesh Mehta',
      emergencyName: '',
      emergencyPhone: '',
      preferredLanguage: 'English',
      emailConsent: true,
      smsConsent: true,
      notes: ''
    });
    setErrors({});
    setServerError(null);
    setDuplicateWarning(null);
    setConfirmedDistinct(false);
    setRegisteredPatient(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative my-auto"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00e575]/20 text-[#00e575] flex items-center justify-center border border-[#00e575]/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">Register New Patient</h2>
              <p className="text-xs text-slate-300">
                CareFlow EHR Registry • Persists directly to MySQL Database
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* SUCCESS SCREEN */}
          {registeredPatient ? (
            <div className="py-8 px-4 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-300">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Patient Successfully Registered
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-3">{registeredPatient.name}</h3>
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-[#00e575] font-mono text-sm font-bold rounded-xl shadow-xs">
                  <span>Patient ID:</span>
                  <span className="underline decoration-[#00e575]">{registeredPatient.id}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Department: <strong className="text-slate-800">{registeredPatient.department}</strong> • Contact: <strong className="text-slate-800">{registeredPatient.phone}</strong>
                </p>
              </div>

              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 max-w-lg mx-auto">
                Patient is now active across all CareFlow AI modules including Appointments, Discharge Intelligence, Follow-up Queue, and Notification Engines.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => {
                    const pid = registeredPatient.id;
                    resetForm();
                    onClose();
                    onPatientRegistered(pid);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  Open Centralized Profile
                </button>
                <button
                  onClick={() => {
                    resetForm();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Register Another Patient
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
              {/* SERVER / DB ERROR BANNER */}
              {serverError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-900">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="block font-bold">Registration Error:</strong>
                    <span>{serverError}</span>
                  </div>
                </div>
              )}

              {/* DUPLICATE WARNING BANNER */}
              {duplicateWarning && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-amber-900 tracking-wider">
                        Potential Duplicate Patient Detected
                      </h4>
                      <p className="text-xs text-amber-900 mt-0.5">
                        {duplicateWarning.message || 'An existing record in MySQL shares matching contact information or demographic details.'}
                      </p>
                      {duplicateWarning.matchedPatient && (
                        <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-200 text-xs font-mono text-slate-800">
                          <strong>Matched Record:</strong> {duplicateWarning.matchedPatient.name} (ID: {duplicateWarning.matchedPatient.id}) • Phone: {duplicateWarning.matchedPatient.contactPhone} • Dept: {duplicateWarning.matchedPatient.department}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <label htmlFor={confirmDistinctId} className="flex items-center gap-2 text-xs text-amber-950 font-medium cursor-pointer">
                      <input
                        id={confirmDistinctId}
                        type="checkbox"
                        checked={confirmedDistinct}
                        onChange={(e) => setConfirmedDistinct(e.target.checked)}
                        className="rounded border-amber-300 text-teal-800 focus:ring-teal-700"
                      />
                      <span>I have verified this is a distinct patient with the same details.</span>
                    </label>

                    <button
                      type="button"
                      disabled={!confirmedDistinct || submitting}
                      onClick={(e) => handleSubmit(e, true)}
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer self-end shrink-0"
                    >
                      {submitting ? 'Registering...' : 'Proceed with Registration'}
                    </button>
                  </div>
                </div>
              )}

              {/* ================= SECTION A: PERSONAL INFORMATION ================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    A. Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label htmlFor={nameId} className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={nameId}
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="e.g., Rajesh Kumar"
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${
                        errors.name
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:border-[#00e575] focus:ring-[#00e575]'
                      }`}
                    />
                    {errors.name && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.name}</p>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label htmlFor={genderId} className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      id={genderId}
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] text-slate-800"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label htmlFor={dobId} className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                    <input
                      id={dobId}
                      type="date"
                      value={formData.dob}
                      onChange={(e) => handleDobChange(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${
                        errors.dob
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:border-[#00e575] focus:ring-[#00e575]'
                      }`}
                    />
                    {errors.dob && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.dob}</p>}
                  </div>

                  {/* Age (auto-calculated) */}
                  <div>
                    <label htmlFor={ageId} className="block text-xs font-bold text-slate-700 mb-1">
                      Age <span className="text-[10px] text-slate-500 font-normal">(Auto-calculated)</span>
                    </label>
                    <input
                      id={ageId}
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      placeholder="e.g., 45"
                      min="0"
                      max="125"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>

                  {/* Blood Group */}
                  <div>
                    <label htmlFor={bloodGroupId} className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      id={bloodGroupId}
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] text-slate-800"
                    >
                      <option value="Unknown">Unknown / Not Tested</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ================= SECTION B: CONTACT INFORMATION ================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Phone className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    B. Contact & Address Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Mobile Number */}
                  <div>
                    <label htmlFor={phoneId} className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={phoneId}
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        if (errors.phone) setErrors({ ...errors, phone: '' });
                      }}
                      placeholder="+91 98765 43210"
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${
                        errors.phone
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:border-[#00e575] focus:ring-[#00e575]'
                      }`}
                    />
                    {errors.phone && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor={emailId} className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      id={emailId}
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="patient@example.com"
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:border-[#00e575] focus:ring-[#00e575]'
                      }`}
                    />
                    {errors.email && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>}
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label htmlFor={langId} className="block text-xs font-bold text-slate-700 mb-1">Preferred Language</label>
                    <select
                      id={langId}
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData({ ...formData, preferredLanguage: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] text-slate-800"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label htmlFor={addressId} className="block text-xs font-bold text-slate-700 mb-1">Residential Address</label>
                    <input
                      id={addressId}
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address, apartment, or flat no."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor={cityId} className="block text-xs font-bold text-slate-700 mb-1">City</label>
                    <input
                      id={cityId}
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Chennai"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label htmlFor={stateId} className="block text-xs font-bold text-slate-700 mb-1">State</label>
                    <input
                      id={stateId}
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="e.g., Tamil Nadu"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>

                  {/* PIN Code */}
                  <div>
                    <label htmlFor={pincodeId} className="block text-xs font-bold text-slate-700 mb-1">PIN Code</label>
                    <input
                      id={pincodeId}
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => {
                        setFormData({ ...formData, pincode: e.target.value });
                        if (errors.pincode) setErrors({ ...errors, pincode: '' });
                      }}
                      placeholder="e.g., 600001"
                      className={`w-full px-3.5 py-2.5 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-1 transition-colors ${
                        errors.pincode
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-400 bg-red-50/20'
                          : 'border-slate-200 focus:border-[#00e575] focus:ring-[#00e575]'
                      }`}
                    />
                    {errors.pincode && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>

              {/* ================= SECTION C: HOSPITAL & CLINICAL INFO ================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Building className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    C. Hospital & Emergency Contact
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Department */}
                  <div>
                    <label htmlFor={deptId} className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                    <select
                      id={deptId}
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] text-slate-800"
                    >
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Neurology">Neurology</option>
                      <option value="General Medicine">General Medicine</option>
                      <option value="Nephrology">Nephrology</option>
                      <option value="Pulmonology">Pulmonology</option>
                      <option value="Oncology">Oncology</option>
                    </select>
                  </div>

                  {/* Assigned Doctor */}
                  <div>
                    <label htmlFor={doctorId} className="block text-xs font-bold text-slate-700 mb-1">Assigned Doctor</label>
                    <input
                      id={doctorId}
                      type="text"
                      value={formData.assignedDoctor}
                      onChange={(e) => setFormData({ ...formData, assignedDoctor: e.target.value })}
                      placeholder="e.g., Dr. Rajesh Mehta"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>

                  {/* Emergency Contact Name */}
                  <div>
                    <label htmlFor={emgNameId} className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Name</label>
                    <input
                      id={emgNameId}
                      type="text"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      placeholder="Spouse / Parent / Next of kin"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>

                  {/* Emergency Contact Phone */}
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label htmlFor={emgPhoneId} className="block text-xs font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
                    <input
                      id={emgPhoneId}
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="+91 98765 00000"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>
                </div>
              </div>

              {/* ================= SECTION D: CONSENT & NOTES ================= */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-teal-800" />
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    D. Notification Consent & Clinical Notes
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <label htmlFor={emailConsentId} className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer font-medium">
                      <input
                        id={emailConsentId}
                        type="checkbox"
                        checked={formData.emailConsent}
                        onChange={(e) => setFormData({ ...formData, emailConsent: e.target.checked })}
                        className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                      />
                      <span>Email Notification Consent (Appointment Confirmations)</span>
                    </label>

                    <label htmlFor={smsConsentId} className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer font-medium">
                      <input
                        id={smsConsentId}
                        type="checkbox"
                        checked={formData.smsConsent}
                        onChange={(e) => setFormData({ ...formData, smsConsent: e.target.checked })}
                        className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                      />
                      <span>SMS / WhatsApp Notification Consent</span>
                    </label>
                  </div>

                  <div>
                    <label htmlFor={notesId} className="block text-xs font-bold text-slate-700 mb-1">Additional Clinical Notes</label>
                    <textarea
                      id={notesId}
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Special care notes, known allergies, or mobility assistance requirements..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] disabled:opacity-50 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer font-mono"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving to MySQL...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Register Patient
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
