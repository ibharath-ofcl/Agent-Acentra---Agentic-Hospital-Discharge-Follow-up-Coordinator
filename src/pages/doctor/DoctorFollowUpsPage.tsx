import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo, Search, Filter, AlertTriangle, CheckCircle2, Clock,
  Calendar, User, ArrowUpRight, Check, X, ShieldCheck,
  PhoneCall, FileText, ChevronRight, Sparkles, RefreshCw, GitBranch,
  Building2, Activity, AlertOctagon, Info
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { SourceEvidenceTag } from '../../components/common/SourceEvidenceTag';
import { doctorService } from '../../services/api/doctorService';
import { demoPatients } from '../../data/demoData';

export interface FollowUpRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  mrn: string;
  primaryDiagnosis: string;
  followUpType: string;
  specialty: string;
  dueDate: string;
  dueDaysRemaining: number;
  priority: 'urgent' | 'high' | 'medium' | 'routine';
  status: 'pending' | 'completed' | 'overdue' | 'needs-review';
  assignedCoordinator: string;
  dependencyStatus?: {
    requiredPrecondition: string;
    preconditionStatus: 'satisfied' | 'pending' | 'overdue';
    workflowRisk: string;
  };
  lastActivity: string;
  objective: string;
  relatedTasks: string[];
  reminderHistory: {
    timestamp: string;
    channel: 'Voice Call' | 'SMS' | 'Portal';
    status: string;
    outcome: string;
  }[];
  sourceEvidence: {
    documentId: string;
    documentName: string;
    pageNumber: number;
    sectionTitle: string;
    extractedText: string;
    confidence: number;
  };
  needsReviewReason?: string;
}

const INITIAL_FOLLOW_UPS: FollowUpRecord[] = [
  {
    id: 'FU-001',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    patientAge: 58,
    patientGender: 'Male',
    mrn: 'MRN-9281C',
    primaryDiagnosis: 'Acute Myocardial Infarction (Post-PCI)',
    followUpType: 'Cardiology Specialist Follow-up',
    specialty: 'Cardiovascular Care',
    dueDate: '15 Oct 2026',
    dueDaysRemaining: 6,
    priority: 'urgent',
    status: 'pending',
    assignedCoordinator: 'Dr. Meera Patel',
    dependencyStatus: {
      requiredPrecondition: 'Fasting Lipid & Renal Panel',
      preconditionStatus: 'pending',
      workflowRisk: 'Cardiologist requires blood panel results prior to clinic review of stent stability.',
    },
    lastActivity: 'Automated reminder queued for 14 Oct • 10:00 AM',
    objective: 'Evaluate post-MI rhythm stability, assess dual-antiplatelet tolerance, and review echocardiogram.',
    relatedTasks: ['Repeat Serum Creatinine & Lipid Panel', 'Home BP & Pulse Baseline Submission', 'Medication Adherence Check'],
    reminderHistory: [
      { timestamp: '06 Oct 2026', channel: 'Portal', status: 'Sent', outcome: 'Discharge instructions confirmed by patient' },
      { timestamp: '14 Oct 2026', channel: 'Voice Call', status: 'Scheduled', outcome: 'Pre-appointment 24hr reminder call scheduled' },
    ],
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Post-Discharge Specialist Plan',
      extractedText: 'Patient must be evaluated in Cardiology Outpatient Clinic within 10 days of hospital discharge with recent fasting lab panel.',
      confidence: 0.98,
    },
  },
  {
    id: 'FU-002',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    patientAge: 73,
    patientGender: 'Female',
    mrn: 'MRN-7740L',
    primaryDiagnosis: 'Hip Fracture — Post-surgical Fixation',
    followUpType: 'Orthopedic Surgical Review',
    specialty: 'Orthopedics & Surgery',
    dueDate: '14 Oct 2026',
    dueDaysRemaining: 5,
    priority: 'urgent',
    status: 'needs-review',
    assignedCoordinator: 'Dr. Ananya Desai',
    dependencyStatus: {
      requiredPrecondition: 'Pelvis & Hip X-Ray Series',
      preconditionStatus: 'pending',
      workflowRisk: 'Surgical team cannot assess hardware position without confirmed imaging.',
    },
    lastActivity: 'Flagged for Coordinator review regarding conflicting weight-bearing orders',
    objective: 'Hardware integrity evaluation, wound check, and physical therapy progression.',
    relatedTasks: ['Bilateral Hip Radiographs', 'Physical Therapy Mobility Protocol Confirmation'],
    reminderHistory: [
      { timestamp: '05 Oct 2026', channel: 'SMS', status: 'Delivered', outcome: 'Appointment date SMS acknowledged by caregiver' },
    ],
    sourceEvidence: {
      documentId: 'DOC005',
      documentName: 'Discharge Summary • Lakshmi Venkatesh',
      pageNumber: 3,
      sectionTitle: 'Rehab Mobility Protocol & Follow-up',
      extractedText: 'Discharge order says non-weight bearing x 4 weeks; PT note says partial weight bearing with walker. Orthopedic review at 10 days with repeat X-Ray.',
      confidence: 0.74,
    },
    needsReviewReason: 'Conflicting clinical instructions: Attending ordered strict non-weight bearing while Rehab notes indicated partial weight bearing.',
  },
  {
    id: 'FU-003',
    patientId: 'P004',
    patientName: 'Ravi Kumar',
    patientAge: 63,
    patientGender: 'Male',
    mrn: 'MRN-5512R',
    primaryDiagnosis: 'Congestive Heart Failure Exacerbation',
    followUpType: 'Heart Failure Outpatient Clinic',
    specialty: 'Cardiovascular Care',
    dueDate: '07 Oct 2026',
    dueDaysRemaining: -1,
    priority: 'urgent',
    status: 'overdue',
    assignedCoordinator: 'Dr. Meera Patel',
    dependencyStatus: {
      requiredPrecondition: 'Daily Weight & Vitals Telemetry',
      preconditionStatus: 'overdue',
      workflowRisk: 'Missed scheduled 7-day post-discharge window without recorded clinic check-in.',
    },
    lastActivity: 'Attempt 1 voice reminder unanswered; retry scheduled',
    objective: 'Assess volume status, check for peripheral edema, and titrate loop diuretic dosage.',
    relatedTasks: ['Daily AM Weight Telemetry', 'Serum Electrolyte Panel'],
    reminderHistory: [
      { timestamp: '07 Oct 2026 • 09:30 AM', channel: 'Voice Call', status: 'No Answer', outcome: 'Call disconnected after 5 rings' },
      { timestamp: '07 Oct 2026 • 10:00 AM', channel: 'SMS', status: 'Delivered', outcome: 'Coordinator follow-up callback SMS queued' },
    ],
    sourceEvidence: {
      documentId: 'DOC004',
      documentName: 'Discharge Summary • Ravi Kumar',
      pageNumber: 2,
      sectionTitle: 'Mandatory Follow-up Timetable',
      extractedText: 'Mandatory outpatient clinic visit within 7 days post-discharge due to congestive history.',
      confidence: 0.96,
    },
  },
  {
    id: 'FU-004',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    patientAge: 42,
    patientGender: 'Female',
    mrn: 'MRN-3389P',
    primaryDiagnosis: 'Type 2 Diabetes — Hypoglycemia Recovery',
    followUpType: 'Endocrinology & Glycemic Management',
    specialty: 'Endocrinology',
    dueDate: '18 Oct 2026',
    dueDaysRemaining: 9,
    priority: 'high',
    status: 'pending',
    assignedCoordinator: 'Dr. Rajesh Iyer',
    dependencyStatus: {
      requiredPrecondition: 'Fasting Blood Glucose Log (7-Day)',
      preconditionStatus: 'satisfied',
      workflowRisk: 'Log submitted via portal; ready for physician review.',
    },
    lastActivity: 'Portal glucose log received and synchronized',
    objective: 'Re-evaluate basal insulin dosing following hospital hypoglycemic event.',
    relatedTasks: ['Fasting Blood Glucose & HbA1c Lab', 'Dietary Consultation Call'],
    reminderHistory: [
      { timestamp: '06 Oct 2026', channel: 'Portal', status: 'Completed', outcome: 'Patient submitted baseline morning glucose log' },
    ],
    sourceEvidence: {
      documentId: 'DOC002',
      documentName: 'Discharge Summary • Priya Sharma',
      pageNumber: 2,
      sectionTitle: 'Endocrinology Plan',
      extractedText: 'Repeat blood glucose fasting curve by October 18 with outpatient endocrinologist.',
      confidence: 0.93,
    },
  },
  {
    id: 'FU-005',
    patientId: 'P003',
    patientName: 'Rahul Kumar',
    patientAge: 49,
    patientGender: 'Male',
    mrn: 'MRN-8812R',
    primaryDiagnosis: 'Post-Laparoscopic Cholecystectomy',
    followUpType: 'Post-Surgical Wound & Incision Review',
    specialty: 'General Surgery',
    dueDate: '22 Oct 2026',
    dueDaysRemaining: 13,
    priority: 'routine',
    status: 'pending',
    assignedCoordinator: 'Dr. Ananya Desai',
    dependencyStatus: {
      requiredPrecondition: 'Wound Dressing Integrity Check',
      preconditionStatus: 'satisfied',
      workflowRisk: 'Normal surgical healing reported; on schedule.',
    },
    lastActivity: 'Appointment slot confirmed with Surgery Clinic Suite 102',
    objective: 'Inspect port-site incisions, verify suture dissolution, and clear for return to full physical work.',
    relatedTasks: ['Wound site inspection', 'Diet progression to low-fat solid meals'],
    reminderHistory: [
      { timestamp: '07 Oct 2026', channel: 'Portal', status: 'Sent', outcome: 'Appointment confirmation emailed' },
    ],
    sourceEvidence: {
      documentId: 'DOC003',
      documentName: 'Discharge Summary • Rahul Kumar',
      pageNumber: 1,
      sectionTitle: 'Surgical Instructions',
      extractedText: 'Routine post-op follow-up in 2 weeks with Dr. Desai at Surgical Recovery Outpatient.',
      confidence: 0.97,
    },
  },
  {
    id: 'FU-006',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    patientAge: 58,
    patientGender: 'Male',
    mrn: 'MRN-9281C',
    primaryDiagnosis: 'Acute Myocardial Infarction',
    followUpType: 'Nephrology Referral Clarification',
    specialty: 'Nephrology',
    dueDate: '20 Oct 2026 (Unspecified in EHR)',
    dueDaysRemaining: 11,
    priority: 'high',
    status: 'needs-review',
    assignedCoordinator: 'Dr. Meera Patel',
    dependencyStatus: {
      requiredPrecondition: 'Serum Creatinine Trend confirmation',
      preconditionStatus: 'pending',
      workflowRisk: 'Discharge document omitted exact appointment timeframe.',
    },
    lastActivity: 'Flagged for coordinator date verification',
    objective: 'Evaluate renal perfusion and baseline creatinine stabilization post-contrast exposure.',
    relatedTasks: ['Serum Creatinine Repeat Test', 'Consultation Date Booking'],
    reminderHistory: [],
    sourceEvidence: {
      documentId: 'DOC001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Specialist Referrals',
      extractedText: 'Consider nephrology consultation for serum creatinine 1.4 at discharge. Timing not specified.',
      confidence: 0.69,
    },
    needsReviewReason: 'Missing follow-up date and timeframe in original discharge document.',
  },
  {
    id: 'FU-007',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    patientAge: 42,
    patientGender: 'Female',
    mrn: 'MRN-3389P',
    primaryDiagnosis: 'Type 2 Diabetes — Hypoglycemia Recovery',
    followUpType: 'Discharge Medication Reconciliation Check',
    specialty: 'Clinical Pharmacy',
    dueDate: '06 Oct 2026',
    dueDaysRemaining: 0,
    priority: 'high',
    status: 'completed',
    assignedCoordinator: 'Dr. Rajesh Iyer',
    dependencyStatus: {
      requiredPrecondition: 'Pharmacy Dispense Confirmation',
      preconditionStatus: 'satisfied',
      workflowRisk: 'Completed without issues.',
    },
    lastActivity: 'Verified by Coordinator on 06 Oct 2026',
    objective: 'Confirm patient picked up revised insulin glargine prescription and understands dose adjustment.',
    relatedTasks: ['Prescription fill verification', 'Hypoglycemia emergency kit check'],
    reminderHistory: [
      { timestamp: '06 Oct 2026', channel: 'Voice Call', status: 'Completed', outcome: 'Patient confirmed receipt of new insulin pen' },
    ],
    sourceEvidence: {
      documentId: 'DOC002',
      documentName: 'Discharge Summary • Priya Sharma',
      pageNumber: 1,
      sectionTitle: 'Medication Reconciliation',
      extractedText: 'Reduced Lantus dosage to 16 units QHS; pharmacy counsel mandatory before discharge.',
      confidence: 0.99,
    },
  },
];

export function DoctorFollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpRecord[]>(INITIAL_FOLLOW_UPS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue' | 'needs-review'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'routine'>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('all');
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingPatientId, setBookingPatientId] = useState('MRN-RAVI-001');
  const [bookingDate, setBookingDate] = useState('2026-10-15');
  const [bookingTime, setBookingTime] = useState('10:30 AM');
  const [bookingDoctor, setBookingDoctor] = useState('Dr. Rajesh Mehta');
  const [bookingDept, setBookingDept] = useState('Cardiology Outpatient Clinic');
  const [bookingNotes, setBookingNotes] = useState('');
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const data = await doctorService.getFollowUps();
      if (Array.isArray(data) && data.length > 0) {
        setFollowUps(data);
      }
    } catch (err) {
      console.error("Failed to load doctor follow-ups:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDoctorBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate) {
      showToast('⚠️ Please enter an appointment date');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await doctorService.createAppointment({
        patient_id: bookingPatientId,
        appointment_date: bookingDate,
        time_str: bookingTime,
        doctor_name: bookingDoctor,
        department: bookingDept,
        notes: bookingNotes || 'Scheduled by Coordinator',
        send_confirmation_email: sendConfirmationEmail,
        status: 'scheduled'
      });
      const emailStatus = res.emailNotification?.status;
      const statusText = emailStatus === 'sent' ? 'Dispatched to inbox' :
                         emailStatus === 'simulated' ? 'Simulated & logged' :
                         emailStatus === 'skipped' ? 'Skipped (Consent)' : 'Logged';
      showToast(`✓ Appointment saved in MySQL for ${res.appointment?.patientName || 'Patient'}! Email: ${statusText}`);
      setIsBookingOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(`⚠️ Booking failed: ${err.message || 'Error creating appointment'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAppointment = async (apptId: string, patientName: string) => {
    setConfirmingId(apptId);
    try {
      const res = await doctorService.confirmAppointment(apptId);
      const emailStatus = res.emailNotification?.status;
      showToast(`✓ Appointment confirmed for ${patientName}! Confirmation email: ${emailStatus === 'sent' ? 'Sent' : 'Simulated & Logged'}`);
      await loadData();
    } catch (err: any) {
      showToast(`⚠️ Confirmation error: ${err.message || 'Failed'}`);
    } finally {
      setConfirmingId(null);
    }
  };

  // Compute operational stats
  const stats = useMemo(() => {
    return {
      total: followUps.length,
      pending: followUps.filter(f => f.status === 'pending').length,
      completed: followUps.filter(f => f.status === 'completed').length,
      overdue: followUps.filter(f => f.status === 'overdue').length,
      needsReview: followUps.filter(f => f.status === 'needs-review').length,
      highPriority: followUps.filter(f => f.priority === 'urgent' || f.priority === 'high').length,
    };
  }, [followUps]);

  // Filtered list
  const filteredFollowUps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return followUps.filter(item => {
      const matchSearch =
        !q ||
        item.patientName.toLowerCase().includes(q) ||
        item.mrn.toLowerCase().includes(q) ||
        item.followUpType.toLowerCase().includes(q) ||
        item.specialty.toLowerCase().includes(q) ||
        item.primaryDiagnosis.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || (priorityFilter === 'urgent' ? item.priority === 'urgent' : item.priority === priorityFilter);
      const matchPatient = selectedPatientId === 'all' || item.patientId === selectedPatientId;

      return matchSearch && matchStatus && matchPriority && matchPatient;
    });
  }, [followUps, searchQuery, statusFilter, priorityFilter, selectedPatientId]);

  const handleMarkCompleted = async (id: string, name: string) => {
    setFollowUps(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'completed' as const } : f))
    );
    if (selectedFollowUp && selectedFollowUp.id === id) {
      setSelectedFollowUp(prev => prev ? { ...prev, status: 'completed' as const } : null);
    }
    try {
      await doctorService.updateTaskStatus(id, 'completed');
      showToast(`✓ Follow-up for ${name} completed and persisted in MySQL database`);
    } catch {
      showToast(`Follow-up for ${name} marked as completed locally`);
    }
  };

  const handleResolveReview = async (id: string, name: string) => {
    setFollowUps(prev =>
      prev.map(f => (f.id === id ? { ...f, status: 'pending' as const, needsReviewReason: undefined } : f))
    );
    if (selectedFollowUp && selectedFollowUp.id === id) {
      setSelectedFollowUp(prev => prev ? { ...prev, status: 'pending' as const, needsReviewReason: undefined } : null);
    }
    try {
      await doctorService.updateTaskStatus(id, 'pending');
      showToast(`✓ Review resolved for ${name} and updated in MySQL database`);
    } catch {
      showToast(`Clinical instruction review resolved for ${name}`);
    }
  };

  return (
    <DoctorLayout toastMessage={toastMessage} activeTab="followup">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider flex items-center gap-1">
                <ListTodo className="w-3.5 h-3.5" /> Care Coordination Operations
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Coordinator: Dr. Meera Patel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Follow-ups
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Operational command view of post-discharge specialist appointments, diagnostic dependencies, and coordination workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>

            <button
              onClick={() => {
                loadData();
                showToast('Follow-up list synchronized with HMS backend');
              }}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
              <span>Sync State</span>
            </button>
          </div>
        </div>

        {/* Operational KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Tracked</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <span className="text-[10px] text-teal-800 font-semibold mt-0.5 block">5 Discharged Patients</span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-xs bg-amber-50/20">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Pending Action</span>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.pending}</div>
            <span className="text-[10px] text-amber-700 mt-0.5 block">Active deadlines</span>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-xs bg-red-50/20">
            <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider block">Overdue Follow-up</span>
            <div className="text-2xl font-black text-red-600 mt-1">{stats.overdue}</div>
            <span className="text-[10px] text-red-700 font-bold mt-0.5 block">Immediate contact</span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-300 p-4 shadow-xs bg-amber-50/40">
            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">Needs Review</span>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.needsReview}</div>
            <span className="text-[10px] text-amber-800 mt-0.5 block">Ambiguous EHR note</span>
          </div>

          <div className="bg-white rounded-2xl border border-purple-200 p-4 shadow-xs bg-purple-50/20">
            <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wider block">High Priority</span>
            <div className="text-2xl font-black text-purple-900 mt-1">{stats.highPriority}</div>
            <span className="text-[10px] text-purple-700 mt-0.5 block">Urgent timeframe</span>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/20">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Completed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.completed}</div>
            <span className="text-[10px] text-emerald-800 font-semibold mt-0.5 block">Verified & closed</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search patient name, MRN, specialty, or condition..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden transition-colors font-medium text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                aria-label="Filter by patient"
                value={selectedPatientId}
                onChange={e => setSelectedPatientId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All Patients ({demoPatients.length})</option>
                {demoPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by priority level"
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High Priority</option>
                <option value="routine">Routine</option>
              </select>
            </div>
          </div>

          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
            <span className="text-[11px] font-bold text-slate-500 mr-1 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3 text-teal-700" /> Filter:
            </span>
            {[
              { id: 'all', label: `All (${followUps.length})` },
              { id: 'pending', label: `Pending (${stats.pending})` },
              { id: 'overdue', label: `Overdue (${stats.overdue})`, alert: stats.overdue > 0 },
              { id: 'needs-review', label: `Needs Review (${stats.needsReview})`, alert: stats.needsReview > 0 },
              { id: 'completed', label: `Completed (${stats.completed})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                  statusFilter === tab.id
                    ? 'bg-teal-900 text-white shadow-xs'
                    : tab.alert
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Follow-up Items Table / Card Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-4 h-4 text-teal-700" /> Active Follow-up Roster ({filteredFollowUps.length})
            </span>
            <span className="text-[11px] text-slate-500">Sorted by clinical deadline</span>
          </div>

          {filteredFollowUps.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">No follow-ups match current filter criteria</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting filters or searching a different term</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setSelectedPatientId('all');
                }}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredFollowUps.map(item => {
                const isOverdue = item.status === 'overdue';
                const isNeedsReview = item.status === 'needs-review';
                const isCompleted = item.status === 'completed';

                return (
                  <div
                    key={item.id}
                    className={`p-5 transition-colors hover:bg-slate-50/60 ${
                      isOverdue ? 'bg-red-50/20' : isNeedsReview ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Patient info & Follow-up Details */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.patientName}</span>
                          <span className="text-xs font-mono text-teal-800 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {item.mrn}
                          </span>
                          <span className="text-xs text-slate-500">• {item.patientAge} yo {item.patientGender}</span>
                          <span className="text-xs text-slate-600 font-medium">({item.primaryDiagnosis})</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                            {item.followUpType}
                          </h3>
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                            {item.specialty}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-1 max-w-3xl">
                          <strong>Objective:</strong> {item.objective}
                        </p>

                        {/* Care Dependency Alert Tag */}
                        {item.dependencyStatus && (
                          <div className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                            item.dependencyStatus.preconditionStatus === 'overdue'
                              ? 'bg-red-50 border-red-200 text-red-900'
                              : item.dependencyStatus.preconditionStatus === 'pending'
                              ? 'bg-amber-50 border-amber-200 text-amber-900'
                              : 'bg-teal-50 border-teal-200 text-teal-900'
                          }`}>
                            <GitBranch className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-700" />
                            <div>
                              <div className="font-bold">
                                Care Dependency: {item.dependencyStatus.requiredPrecondition}{' '}
                                <span className="font-normal">({item.dependencyStatus.preconditionStatus.toUpperCase()})</span>
                              </div>
                              <div className="text-[11px] opacity-90">{item.dependencyStatus.workflowRisk}</div>
                            </div>
                          </div>
                        )}

                        {/* Flagged Review Alert */}
                        {item.needsReviewReason && (
                          <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 flex items-start gap-2 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <strong>Needs Human Review:</strong> {item.needsReviewReason}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Due Date, Badges & Actions */}
                      <div className="flex flex-row lg:flex-col lg:items-end justify-between items-center gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <div className="flex items-center gap-1.5 justify-start lg:justify-end">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-xs text-slate-900">{item.dueDate}</span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                            {item.dueDaysRemaining < 0 ? (
                              <span className="text-red-600 font-bold">Overdue by {Math.abs(item.dueDaysRemaining)} day{Math.abs(item.dueDaysRemaining) > 1 ? 's' : ''}</span>
                            ) : item.dueDaysRemaining === 0 ? (
                              <span className="text-amber-600 font-bold">Due Today</span>
                            ) : (
                              <span>In {item.dueDaysRemaining} days</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.status} />
                          <PriorityBadge priority={item.priority === 'routine' ? 'low' : item.priority} />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedFollowUp(item)}
                            className="px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Detail Modal */}
      <AnimatePresence>
        {selectedFollowUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setSelectedFollowUp(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Follow-up Operations Dossier
                </span>
                <span className="text-xs font-mono text-slate-500">Ref: #{selectedFollowUp.id}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{selectedFollowUp.followUpType}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="font-bold text-slate-900">{selectedFollowUp.patientName}</span>
                <span>• MRN: {selectedFollowUp.mrn}</span>
                <span>• {selectedFollowUp.specialty}</span>
              </div>

              {/* Status Banner */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Due Date</span>
                  <strong className="text-slate-900">{selectedFollowUp.dueDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Provider</span>
                  <strong className="text-slate-900">{selectedFollowUp.assignedCoordinator}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Status</span>
                  <StatusBadge status={selectedFollowUp.status} />
                </div>
              </div>

              {/* Clinical Objective */}
              <div className="mt-4 text-xs space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">Follow-up Objective</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedFollowUp.objective}
                </p>
              </div>

              {/* Care Dependency Graph Status */}
              {selectedFollowUp.dependencyStatus && (
                <div className="mt-4 p-3.5 bg-teal-50/80 rounded-xl border border-teal-200 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-teal-950 font-bold">
                    <GitBranch className="w-4 h-4 text-teal-700" />
                    <span>Care Coordination Dependency</span>
                  </div>
                  <div className="text-slate-800">
                    <strong>Required Precondition:</strong> {selectedFollowUp.dependencyStatus.requiredPrecondition}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    <strong>Workflow Risk:</strong> {selectedFollowUp.dependencyStatus.workflowRisk}
                  </div>
                </div>
              )}

              {/* Related Tasks */}
              <div className="mt-4 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">Related Care Tasks</span>
                <div className="space-y-1.5">
                  {selectedFollowUp.relatedTasks.map((tsk, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{tsk}</span>
                      <span className="text-[10px] text-teal-800 font-bold bg-teal-50 px-2 py-0.5 rounded">Linked</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source Evidence Citation */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" /> Grounded EHR Provenance
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {selectedFollowUp.sourceEvidence.documentName} • P.{selectedFollowUp.sourceEvidence.pageNumber}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                  "{selectedFollowUp.sourceEvidence.extractedText}"
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setSelectedFollowUp(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
                {selectedFollowUp.status === 'needs-review' && (
                  <button
                    onClick={() => handleResolveReview(selectedFollowUp.id, selectedFollowUp.patientName)}
                    className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Approve & Clear Review Flag
                  </button>
                )}
                {selectedFollowUp.status !== 'completed' && (
                  <button
                    onClick={() => handleMarkCompleted(selectedFollowUp.id, selectedFollowUp.patientName)}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Verified & Completed
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Doctor Appointment Booking Modal */}
        {isBookingOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Book Patient Follow-up</h3>
                    <p className="text-[11px] text-slate-500">CareFlow AI • Instant MySQL Sync & Email Dispatch</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBookingOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleDoctorBookAppointment} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Patient <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bookingPatientId}
                    onChange={e => setBookingPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="MRN-RAVI-001">Ravi Kumar (MRN-RAVI-001 • ravi@example.com)</option>
                    <option value="P001">Arun Kumar (P001 • arun.kumar@gmail.com)</option>
                    <option value="P002">Priya Sharma (P002 • priya.sharma@example.com)</option>
                    <option value="P003">Rahul Kumar (P003 • rahul.kumar@gmail.com)</option>
                    <option value="P005">Lakshmi Venkatesh (P005 • lakshmi.v@example.com)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Appointment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={e => setBookingTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium text-slate-900 cursor-pointer"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:45 AM">11:45 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:30 PM">03:30 PM</option>
                      <option value="04:45 PM">04:45 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Specialty Department</label>
                  <select
                    value={bookingDept}
                    onChange={e => setBookingDept(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium text-slate-900 cursor-pointer"
                  >
                    <option value="Cardiology Outpatient Clinic">Cardiology Outpatient Clinic</option>
                    <option value="Endocrinology & Diabetic Care">Endocrinology & Diabetic Care</option>
                    <option value="General & Laparoscopic Surgery">General & Laparoscopic Surgery</option>
                    <option value="Nephrology & Renal Health">Nephrology & Renal Health</option>
                    <option value="Orthopedic Surgical Recovery">Orthopedic Surgical Recovery</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Attending Physician / Specialist</label>
                  <input
                    type="text"
                    value={bookingDoctor}
                    onChange={e => setBookingDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium text-slate-900"
                    placeholder="e.g. Dr. Rajesh Mehta"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Follow-up Notes</label>
                  <textarea
                    rows={2}
                    value={bookingNotes}
                    onChange={e => setBookingNotes(e.target.value)}
                    placeholder="e.g. Scheduled post-discharge clinical evaluation & lab review"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden font-medium text-slate-900"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-teal-700" />
                    <span className="font-semibold text-slate-800">Dispatch Multilingual Confirmation Email</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendConfirmationEmail}
                    onChange={e => setSendConfirmationEmail(e.target.checked)}
                    className="w-4 h-4 text-teal-800 rounded focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setIsBookingOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving & Dispatching Email...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Save in MySQL & Confirm</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DoctorLayout>
  );
}

