import { useState, useEffect, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Calendar, Clock, Phone, Mail, MapPin, Building,
  Stethoscope, FileText, CheckCircle2, AlertTriangle, Sparkles,
  Plus, Bell, ShieldCheck, History, Check, Loader2, ArrowRight
} from 'lucide-react';
import { doctorService } from '../../services/api/doctorService';
import { StatusBadge, CareCoordinationPriorityBadge } from './StatusBadge';

interface CentralizedPatientProfileModalProps {
  patientId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshParent?: () => void;
  onShowToast?: (msg: string) => void;
}

export function CentralizedPatientProfileModal({
  patientId,
  isOpen,
  onClose,
  onRefreshParent,
  onShowToast
}: CentralizedPatientProfileModalProps) {
  const [patient, setPatient] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'tests' | 'tasks' | 'timeline' | 'notifications'>('overview');

  // New Appointment Form State
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('10:30 AM');
  const [apptDoctor, setApptDoctor] = useState('Dr. Rajesh Mehta');
  const [apptDept, setApptDept] = useState('Cardiology');
  const [apptNotes, setApptNotes] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [submittingAppt, setSubmittingAppt] = useState(false);

  // Unique IDs for appointment form inputs
  const apptDateId = useId();
  const apptTimeId = useId();
  const apptDoctorId = useId();
  const apptDeptId = useId();
  const apptNotesId = useId();
  const sendEmailId = useId();

  // New Test Order Form State
  const [showAddTest, setShowAddTest] = useState(false);
  const [testName, setTestName] = useState('');
  const [testDueDate, setTestDueDate] = useState('');
  const [testNotes, setTestNotes] = useState('');
  const [submittingTest, setSubmittingTest] = useState(false);

  // Unique IDs for test order form inputs
  const testNameId = useId();
  const testDueDateId = useId();
  const testNotesId = useId();

  // Contact Edit State
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await doctorService.getPatientProfile(patientId);
      setPatient(data);
      if (data.email) setEditEmail(data.email);
      if (data.contactPhone) setEditPhone(data.contactPhone);
      if (data.department) setApptDept(data.department);
      if (data.attendingPhysician) setApptDoctor(data.attendingPhysician);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message || 'Failed to retrieve patient profile from MySQL.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (isOpen && patientId) {
      loadProfile();
      setActiveTab('overview');
      setShowAddAppt(false);
      setShowAddTest(false);
    }
  }, [isOpen, patientId, loadProfile]);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setSavingContact(true);
    try {
      await doctorService.updatePatient(patientId, {
        email: editEmail.trim(),
        contact_phone: editPhone.trim()
      });
      if (onShowToast) onShowToast(`Patient email & contact updated successfully in MySQL!`);
      setIsEditingContact(false);
      await loadProfile();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`Failed to update patient contact: ${err.message}`);
    } finally {
      setSavingContact(false);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !apptDate) return;
    setSubmittingAppt(true);
    try {
      await doctorService.createAppointment({
        patient_id: patientId,
        appointment_date: apptDate,
        time_str: apptTime,
        doctor_name: apptDoctor,
        department: apptDept,
        notes: apptNotes,
        send_confirmation_email: sendEmail,
        patient_email: editEmail || patient?.email || undefined,
        recipient_email: editEmail || patient?.email || undefined,
        status: 'scheduled'
      });
      if (onShowToast) onShowToast(`Appointment successfully scheduled for ${patient?.name || 'patient'}.`);
      setShowAddAppt(false);
      setApptNotes('');
      await loadProfile();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`Failed to book appointment: ${err.message}`);
    } finally {
      setSubmittingAppt(false);
    }
  };

  const handleConfirmAppointment = async (apptId: string) => {
    try {
      await doctorService.confirmAppointment(apptId);
      if (onShowToast) onShowToast(`Appointment confirmed & email notification dispatched!`);
      await loadProfile();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`Failed to confirm appointment: ${err.message}`);
    }
  };

  const handleOrderTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !testName.trim()) return;
    setSubmittingTest(true);
    try {
      await doctorService.addPatientTest(patientId, {
        test_name: testName.trim(),
        due_date: testDueDate || undefined,
        notes: testNotes.trim() || undefined
      });
      if (onShowToast) onShowToast(`Required test '${testName}' successfully ordered.`);
      setShowAddTest(false);
      setTestName('');
      setTestNotes('');
      await loadProfile();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`Failed to order test: ${err.message}`);
    } finally {
      setSubmittingTest(false);
    }
  };

  const handleCompleteTest = async (testId: string, name: string) => {
    try {
      await doctorService.completePatientTest(testId);
      if (onShowToast) onShowToast(`Test '${name}' marked as verified complete.`);
      await loadProfile();
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      alert(`Failed to complete test: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative my-auto"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-600/30 text-teal-300 font-bold flex items-center justify-center text-lg border border-teal-400/20 shadow-inner">
              {patient?.name ? patient.name.slice(0, 2).toUpperCase() : 'PT'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">{patient?.name || 'Loading Patient Profile...'}</h2>
                {patient?.id && (
                  <span className="text-xs font-mono font-bold bg-[#00e575]/20 text-[#00e575] px-2.5 py-0.5 rounded-full border border-[#00e575]/30">
                    {patient.id}
                  </span>
                )}
                {patient?.priorityLevel && (
                  <CareCoordinationPriorityBadge level={patient.priorityLevel} size="sm" />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span>{patient?.gender || 'Patient'}</span>
                <span>•</span>
                <span>{patient?.age ? `${patient.age} yrs` : 'Age unrecorded'}</span>
                {patient?.bloodGroup && patient.bloodGroup !== 'Unknown' && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-red-300">Blood Group: {patient.bloodGroup}</span>
                  </>
                )}
                <span>•</span>
                <span>Dept: <strong className="text-white">{patient?.department || 'Cardiology'}</strong></span>
                <span>•</span>
                <span>Physician: <strong className="text-white">{patient?.attendingPhysician || 'Dr. Rajesh Mehta'}</strong></span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 bg-slate-50 flex items-center gap-1 overflow-x-auto shrink-0 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#00e575] text-slate-900 font-bold bg-white/70'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Overview & Demographics
          </button>

          <button
            onClick={() => setActiveTab('appointments')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-[#00e575] text-slate-900 font-bold bg-white/70'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Appointments ({patient?.appointments?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tests'
                ? 'border-[#00e575] text-slate-900 font-bold bg-white/70'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            Required Tests ({patient?.requiredTests?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-[#00e575] text-slate-900 font-bold bg-white/70'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Follow-up Tasks ({patient?.followUpTasks?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'border-[#00e575] text-slate-900 font-bold bg-white/70'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Timeline & Audit ({patient?.timeline?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'border-[#00e575] text-slate-900 font-bold bg-white/70'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Reminders ({patient?.notifications?.length || 0})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-teal-800" />
              <p className="text-xs font-semibold">Retrieving centralized patient record from MySQL...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900">
              <strong className="block font-bold">Error loading profile:</strong>
              <span>{error}</span>
            </div>
          ) : patient ? (
            <>
              {/* TAB 1: OVERVIEW & DEMOGRAPHICS */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Demographics Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-teal-800" /> Patient Demographics & Contact
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setEditEmail(patient.email || '');
                          setEditPhone(patient.contactPhone || '');
                          setIsEditingContact(!isEditingContact);
                        }}
                        className="text-xs font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {isEditingContact ? 'Cancel' : 'Edit Email / Contact'}
                      </button>
                    </div>

                    {isEditingContact ? (
                      <form onSubmit={handleSaveContact} className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-3 mb-4">
                        <div className="text-xs font-bold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-teal-800" /> Update Notification Email & Phone
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Patient Email (Receives appointment & discharge emails)
                            </label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="patient@example.com"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              Mobile Number (Receives SMS / Voice Calls)
                            </label>
                            <input
                              type="tel"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:ring-2 focus:ring-teal-700 outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setIsEditingContact(false)}
                            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingContact}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            {savingContact ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            Save to MySQL Database
                          </button>
                        </div>
                      </form>
                    ) : null}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Full Name</span>
                        <span className="text-slate-900 font-bold text-sm">{patient.name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient ID (MRN)</span>
                        <span className="text-slate-800 font-mono font-semibold">{patient.id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth / Age</span>
                        <span className="text-slate-800 font-medium">
                          {patient.dob || 'Unspecified'} {patient.age ? `(${patient.age} yrs)` : ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Mobile</span>
                        <span className="text-slate-800 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-teal-700" />
                          {patient.contactPhone || 'None'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Email Address</span>
                        <span className="text-slate-800 font-medium flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-teal-700" />
                          {patient.email || 'None on file'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Language</span>
                        <span className="text-slate-800 font-medium">{patient.preferredLanguage || 'English'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Address & Location</span>
                        <span className="text-slate-800 font-medium flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-teal-700" />
                          {[patient.address, patient.city, patient.state, patient.pincode].filter(Boolean).join(', ') || 'No residential address recorded'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Contact</span>
                        <span className="text-slate-800 font-medium">
                          {patient.emergencyContactName || 'None'} {patient.emergencyContactPhone ? `(${patient.emergencyContactPhone})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clinical & Discharge Summary */}
                  <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3 text-xs">
                    <h3 className="font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-teal-800" /> Clinical & Hospital Assignment
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-teal-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Department</span>
                        <span className="text-slate-900 font-bold">{patient.department || 'Cardiology'}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-teal-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending Clinician</span>
                        <span className="text-slate-900 font-bold">{patient.attendingPhysician || 'Dr. Rajesh Mehta'}</span>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-teal-100">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Discharge Status</span>
                        <span className="text-slate-900 font-bold">{patient.dischargeDate ? `Discharged (${patient.dischargeDate})` : 'Active Inpatient / Registered'}</span>
                      </div>
                    </div>

                    {patient.notes && (
                      <div className="p-3 bg-white rounded-xl border border-teal-100 mt-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Coordinator Notes</span>
                        <span className="text-slate-800">{patient.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: APPOINTMENTS */}
              {activeTab === 'appointments' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Patient Appointment Records
                      </h3>
                      <p className="text-xs text-slate-500">Managed in MySQL with Multilingual Email Confirmation</p>
                    </div>

                    <button
                      onClick={() => setShowAddAppt(!showAddAppt)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Schedule Appointment
                    </button>
                  </div>

                  {/* Add Appointment Subform */}
                  <AnimatePresence>
                    {showAddAppt && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleCreateAppointment}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 overflow-hidden"
                      >
                        <h4 className="text-xs font-bold text-slate-900 uppercase">Schedule New Follow-up</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label htmlFor={apptDateId} className="block text-slate-700 font-bold mb-1">Appointment Date *</label>
                            <input
                              id={apptDateId}
                              type="date"
                              required
                              value={apptDate}
                              onChange={(e) => setApptDate(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor={apptTimeId} className="block text-slate-700 font-bold mb-1">Time</label>
                            <input
                              id={apptTimeId}
                              type="text"
                              value={apptTime}
                              onChange={(e) => setApptTime(e.target.value)}
                              placeholder="10:30 AM"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor={apptDeptId} className="block text-slate-700 font-bold mb-1">Department</label>
                            <input
                              id={apptDeptId}
                              type="text"
                              value={apptDept}
                              onChange={(e) => setApptDept(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor={apptDoctorId} className="block text-slate-700 font-bold mb-1">Doctor</label>
                            <input
                              id={apptDoctorId}
                              type="text"
                              value={apptDoctor}
                              onChange={(e) => setApptDoctor(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="text-xs">
                          <label htmlFor={apptNotesId} className="block text-slate-700 font-bold mb-1">Appointment Notes</label>
                          <input
                            id={apptNotesId}
                            type="text"
                            value={apptNotes}
                            onChange={(e) => setApptNotes(e.target.value)}
                            placeholder="e.g., Post-discharge recovery review..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <label htmlFor={sendEmailId} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer font-medium">
                            <input
                              id={sendEmailId}
                              type="checkbox"
                              checked={sendEmail}
                              onChange={(e) => setSendEmail(e.target.checked)}
                              className="rounded border-slate-300 text-teal-800 focus:ring-teal-700"
                            />
                            <span>Send multilingual Email Confirmation immediately</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddAppt(false)}
                              className="px-3 py-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={submittingAppt}
                              className="px-4 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs"
                            >
                              {submittingAppt ? 'Saving...' : 'Book & Save in MySQL'}
                            </button>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* List of Appointments */}
                  <div className="space-y-3">
                    {!patient.appointments || patient.appointments.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                        No appointments currently scheduled for this patient.
                      </div>
                    ) : (
                      patient.appointments.map((appt: any) => (
                        <div
                          key={appt.id}
                          className="p-4 bg-white rounded-xl border border-slate-200 text-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{appt.department} Consultation</span>
                              <StatusBadge status={appt.status} size="sm" />
                              <span className="text-[10px] font-mono text-slate-400">Ref: #{appt.id}</span>
                            </div>
                            <p className="text-slate-700 font-medium mt-1">
                              With <strong>{appt.doctorName || appt.doctor}</strong> • {appt.location || 'Outpatient Pavilion'}
                            </p>
                            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                              <span className="flex items-center gap-1 font-semibold text-teal-800">
                                <Calendar className="w-3.5 h-3.5" />
                                {appt.appointmentDate || appt.date} at {appt.timeStr || appt.time}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {appt.status === 'scheduled' && (
                              <button
                                onClick={() => handleConfirmAppointment(appt.id)}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Confirm & Dispatch Email
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: REQUIRED TESTS */}
              {activeTab === 'tests' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                        Required Clinical Tests & Labs
                      </h3>
                      <p className="text-xs text-slate-500">Track pending and completed lab orders</p>
                    </div>

                    <button
                      onClick={() => setShowAddTest(!showAddTest)}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Order New Test
                    </button>
                  </div>

                  {/* Add Test Subform */}
                  <AnimatePresence>
                    {showAddTest && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleOrderTest}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 overflow-hidden text-xs"
                      >
                        <h4 className="font-bold text-slate-900 uppercase">Order Required Lab / Diagnostic Test</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label htmlFor={testNameId} className="block text-slate-700 font-bold mb-1">Test Name *</label>
                            <input
                              id={testNameId}
                              type="text"
                              required
                              value={testName}
                              onChange={(e) => setTestName(e.target.value)}
                              placeholder="e.g., Blood Test (CBC, Lipid Profile), ECG"
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label htmlFor={testDueDateId} className="block text-slate-700 font-bold mb-1">Due Date</label>
                            <input
                              id={testDueDateId}
                              type="date"
                              value={testDueDate}
                              onChange={(e) => setTestDueDate(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor={testNotesId} className="block text-slate-700 font-bold mb-1">Clinical Instructions / Notes</label>
                          <input
                            id={testNotesId}
                            type="text"
                            value={testNotes}
                            onChange={(e) => setTestNotes(e.target.value)}
                            placeholder="e.g., Fasting 12 hours required before blood draw..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddTest(false)}
                            className="px-3 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={submittingTest}
                            className="px-4 py-1.5 font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs"
                          >
                            {submittingTest ? 'Saving...' : 'Order Test'}
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* List of Tests */}
                  <div className="space-y-3">
                    {!patient.requiredTests || patient.requiredTests.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                        No pending or required lab tests recorded for this patient.
                      </div>
                    ) : (
                      patient.requiredTests.map((t: any) => (
                        <div
                          key={t.id}
                          className="p-4 bg-white rounded-xl border border-slate-200 text-xs shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm">{t.testName}</span>
                              <StatusBadge status={t.status} size="sm" />
                              <span className="text-[10px] font-mono text-slate-400">Ref: #{t.id}</span>
                            </div>
                            <p className="text-slate-600 mt-1">
                              Due: <strong className="text-slate-900">{t.dueDate || 'Prior to next visit'}</strong>
                            </p>
                            {t.notes && <p className="text-slate-500 italic mt-0.5">{t.notes}</p>}
                          </div>

                          {t.status !== 'completed' && (
                            <button
                              onClick={() => handleCompleteTest(t.id, t.testName)}
                              className="px-3.5 py-1.5 font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Mark Verified Complete
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Follow-up Tasks
                  </h3>
                  {!patient.followUpTasks || patient.followUpTasks.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                      No follow-up tasks recorded for this patient.
                    </div>
                  ) : (
                    patient.followUpTasks.map((tsk: any) => (
                      <div key={tsk.id} className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs shadow-xs flex items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900">{tsk.title}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Due: {tsk.dueDate} • Type: {tsk.taskType || 'Follow-up'} • Attending: {tsk.attending}
                          </div>
                        </div>
                        <StatusBadge status={tsk.status} size="sm" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 5: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Patient Audit Trail & Event Timeline
                  </h3>
                  {!patient.timeline || patient.timeline.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                      No timeline events recorded yet.
                    </div>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-teal-200 space-y-4 text-xs">
                      {patient.timeline.map((evt: any) => (
                        <div key={evt.id} className="relative">
                          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-800 border-2 border-white shadow-xs" />
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span>{evt.title}</span>
                            <span className="text-[10px] font-mono text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                              {evt.dateStr || evt.date}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{evt.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Notification & Reminder Delivery Logs
                  </h3>
                  {!patient.notifications || patient.notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">
                      No notifications or reminders dispatched yet.
                    </div>
                  ) : (
                    patient.notifications.map((notif: any) => (
                      <div key={notif.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-900">{notif.scenario || 'Reminder'}</span>
                          <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {notif.status}
                          </span>
                        </div>
                        <p className="text-slate-700">{notif.subject || notif.message}</p>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Channel: {notif.channel} • Recipient: {notif.recipientEmail || notif.recipientPhone} • Sent: {notif.sentAt || notif.createdAt}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
