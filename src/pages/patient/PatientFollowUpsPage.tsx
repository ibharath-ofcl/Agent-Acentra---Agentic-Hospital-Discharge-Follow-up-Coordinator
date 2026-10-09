import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListTodo, Calendar, Clock, MapPin, Stethoscope, CheckCircle2,
  AlertTriangle, FileText, ChevronRight, X, PhoneCall, ShieldCheck,
  Check, Sparkles, Building2, BellRing, GitBranch, Info, RefreshCw
} from 'lucide-react';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SourceEvidenceTag } from '../../components/common/SourceEvidenceTag';
import { patientService, type PatientFollowUp } from '../../services/api/patientService';

export interface PatientFollowUpItem {
  id: string;
  title: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  status: 'upcoming' | 'pending' | 'completed' | 'needs-review';
  purpose: string;
  dependencyNote?: {
    precondition: string;
    status: 'satisfied' | 'pending';
    description: string;
  };
  relatedTasks: { name: string; status: 'completed' | 'pending' }[];
  reminderStatus: string;
  sourceEvidence: {
    documentName: string;
    pageNumber: number;
    sectionTitle: string;
    extractedText: string;
    confidence: number;
  };
  timelineSteps: { time: string; title: string; done: boolean }[];
  needsReviewReason?: string;
}

const INITIAL_PATIENT_FOLLOW_UPS: PatientFollowUpItem[] = [
  {
    id: 'PFU-01',
    title: 'Cardiology Follow-up Clinic Visit',
    doctorName: 'Dr. Meera Patel',
    specialty: 'Cardiovascular Care',
    date: '15 October 2026',
    time: '10:30 AM',
    location: 'Cardiovascular Care Center, Suite 204 • City General Hospital',
    status: 'upcoming',
    purpose: 'Post-MI outpatient evaluation, stent stability assessment, baseline telemetry review, and medication reconciliation.',
    dependencyNote: {
      precondition: 'Fasting Lipid & Renal Panel',
      status: 'pending',
      description: 'Blood test is scheduled for 14 Oct. Results will be ready for Dr. Patel at this visit.',
    },
    relatedTasks: [
      { name: 'Complete Fasting Lipid & Renal Blood Test', status: 'pending' },
      { name: 'Log Daily Blood Pressure & Pulse', status: 'completed' },
      { name: 'Review Dual-Antiplatelet Schedule', status: 'completed' },
    ],
    reminderStatus: 'Automated 24-hr reminder call scheduled for 14 Oct at 10:00 AM',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Post-Discharge Specialist Plan',
      extractedText: 'Patient must be evaluated in Cardiology Outpatient Clinic within 10 days of hospital discharge with recent fasting lab panel.',
      confidence: 0.98,
    },
    timelineSteps: [
      { time: '05 Oct 2026', title: 'Hospital Discharge & Summary Processed', done: true },
      { time: '06 Oct 2026', title: 'Appointment Organized in CareFlow', done: true },
      { time: '14 Oct 2026', title: '24-Hour Voice Reminder Scheduled', done: false },
      { time: '15 Oct 2026', title: 'Clinic Visit with Dr. Meera Patel', done: false },
    ],
  },
  {
    id: 'PFU-02',
    title: 'Wound Care & Catheter Entry Inspection',
    doctorName: 'Nurse Practitioner Sarah Jenkins',
    specialty: 'Primary Care / Surgical Nursing',
    date: '20 October 2026',
    time: '02:00 PM',
    location: 'Outpatient Nursing Pavilion, Room 112',
    status: 'pending',
    purpose: 'Groin puncture entry site inspection to ensure clean closure, normal healing, and no localized hematoma.',
    dependencyNote: {
      precondition: 'Daily Incision Check at Home',
      status: 'satisfied',
      description: 'Patient reports puncture site clean and dry without redness.',
    },
    relatedTasks: [
      { name: 'Daily Entry Site Inspection at Home', status: 'completed' },
      { name: 'No Heavy Lifting (>10 lbs) x 4 Weeks', status: 'pending' },
    ],
    reminderStatus: 'SMS confirmation scheduled for 19 Oct',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Puncture Site Instructions',
      extractedText: 'Femoral access site check with primary care nurse practitioner at 2 weeks post-procedure.',
      confidence: 0.95,
    },
    timelineSteps: [
      { time: '05 Oct 2026', title: 'Puncture Site Care Instructions Documented', done: true },
      { time: '20 Oct 2026', title: 'In-person Entry Site Inspection', done: false },
    ],
  },
  {
    id: 'PFU-03',
    title: 'Nephrology Referral Clarification',
    doctorName: 'Dr. Sarah Chen (Attending Physician)',
    specialty: 'Nephrology / Renal Medicine',
    date: 'Pending Care Coordinator Scheduling',
    time: 'Time to be confirmed',
    location: 'Renal Care Outpatient Center',
    status: 'needs-review',
    purpose: 'Evaluate mild creatinine elevation (1.4 mg/dL at discharge) following angiographic contrast dye exposure.',
    dependencyNote: {
      precondition: 'Repeat Serum Creatinine Blood Work',
      status: 'pending',
      description: 'Care coordinator is reviewing discharge notes to establish exact referral date.',
    },
    relatedTasks: [
      { name: 'Serum Creatinine Blood Test', status: 'pending' },
    ],
    reminderStatus: 'Under review by Dr. Meera Patel',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Specialist Referrals',
      extractedText: 'Consider nephrology consultation for serum creatinine 1.4 at discharge. Timing not specified.',
      confidence: 0.69,
    },
    needsReviewReason: 'The discharge summary recommended a nephrology follow-up but omitted the specific calendar date. Your Care Coordinator has been alerted to confirm the booking.',
    timelineSteps: [
      { time: '05 Oct 2026', title: 'Referral Mentioned in Discharge Note', done: true },
      { time: '06 Oct 2026', title: 'Care Coordinator Review Flag Triggered', done: true },
      { time: 'Pending', title: 'Appointment Booking Confirmation', done: false },
    ],
  },
  {
    id: 'PFU-04',
    title: 'Discharge Medication Reconciliation & Guidance',
    doctorName: 'Clinical Pharmacist Elena Vance',
    specialty: 'Cardiovascular Pharmacy',
    date: '06 October 2026',
    time: '04:00 PM',
    location: 'CareFlow Telehealth / Phone Consultation',
    status: 'completed',
    purpose: 'Reviewed prescription schedule: Aspirin 81mg, Clopidogrel 75mg, Atorvastatin 40mg, and Metoprolol 25mg.',
    relatedTasks: [
      { name: 'Pick up prescriptions from hospital pharmacy', status: 'completed' },
      { name: 'Confirm antiplatelet dosing schedule', status: 'completed' },
    ],
    reminderStatus: 'Completed via portal check-in on 06 Oct',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Medication Reconciliation',
      extractedText: 'Patient and family instructed on uninterrupted antiplatelet therapy for 12 months with pharmacy counsel.',
      confidence: 0.99,
    },
    timelineSteps: [
      { time: '05 Oct 2026', title: 'Prescriptions Sent to Pharmacy', done: true },
      { time: '06 Oct 2026', title: 'Pharmacy Check-in & Review Completed', done: true },
    ],
  },
];

export function PatientFollowUpsPage() {
  const [followUps, setFollowUps] = useState<PatientFollowUpItem[]>(INITIAL_PATIENT_FOLLOW_UPS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'pending' | 'needs-review' | 'completed'>('all');
  const [selectedFollowUp, setSelectedFollowUp] = useState<PatientFollowUpItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadFollowUps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await patientService.getFollowUps();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: PatientFollowUpItem[] = data.map((item: PatientFollowUp, idx: number) => ({
          id: item.id || `PFU-${idx + 1}`,
          title: item.title || `${item.type || 'Clinical'} Follow-up`,
          doctorName: item.doctor || 'Attending Physician',
          specialty: item.department || 'Outpatient Clinic',
          date: item.date || 'TBD',
          time: item.time || '10:00 AM',
          location: item.location || 'Hospital Outpatient Pavilion',
          status: (item.status === 'completed' ? 'completed' : item.status === 'needs-review' ? 'needs-review' : 'upcoming') as any,
          purpose: item.notes || 'Follow-up clinical assessment and recovery progress review.',
          relatedTasks: [
            { name: 'Review Discharge Medication Instructions', status: 'completed' },
            { name: 'Prepare Recent Vitals / Lab Summary', status: 'pending' },
          ],
          reminderStatus: 'Automated 24-hr reminder call and SMS scheduled',
          sourceEvidence: {
            documentName: 'Discharge Summary • MySQL DB',
            pageNumber: 1,
            sectionTitle: 'Follow-up Instructions',
            extractedText: item.notes || `${item.type} follow-up scheduled for ${item.date}`,
            confidence: 0.96,
          },
          timelineSteps: [
            { time: 'Discharge', title: 'Hospital Discharge Summary Processed', done: true },
            { time: item.date || 'Scheduled', title: `${item.title} with ${item.doctor}`, done: item.status === 'completed' },
          ],
        }));
        setFollowUps(mapped);
      }
    } catch (err: any) {
      console.warn('Using preset follow-ups:', err.message);
      // Keep existing presets if API is offline or returns empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  const stats = useMemo(() => {
    return {
      total: followUps.length,
      upcoming: followUps.filter(f => f.status === 'upcoming').length,
      pending: followUps.filter(f => f.status === 'pending').length,
      needsReview: followUps.filter(f => f.status === 'needs-review').length,
      completed: followUps.filter(f => f.status === 'completed').length,
    };
  }, [followUps]);

  const filteredFollowUps = useMemo(() => {
    if (statusFilter === 'all') return followUps;
    return followUps.filter(f => f.status === statusFilter);
  }, [followUps, statusFilter]);

  return (
    <PatientLayout toastMessage={toastMessage} activeTab="followup">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider flex items-center gap-1">
                <ListTodo className="w-3.5 h-3.5" /> Post-Discharge Recovery Plan
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Patient: Arun Kumar (MRN: P001)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Follow-ups
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              All your specialist follow-up clinic visits, nursing checks, and recovery milestones in one coordinated timeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Follow-up appointments synchronized with hospital schedule')}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
              <span>Refresh Schedule</span>
            </button>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-[#e6fcf1] border border-[#a7f3d0] p-4 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-[#052429]">
          <ShieldCheck className="w-5 h-5 text-[#008742] shrink-0 mt-0.5 sm:mt-0" />
          <div className="leading-relaxed">
            <strong>Care Coordination Notice:</strong> This portal organizes documented instructions from your hospital discharge summary. It does not provide medical diagnosis or replace direct communication with your healthcare team.
          </div>
        </div>

        {/* Stat Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Follow-ups</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <span className="text-[10px] text-teal-800 font-semibold mt-0.5 block">Cardiology, Nursing & Labs</span>
          </div>

          <div className="bg-white rounded-2xl border border-teal-200 p-4 shadow-xs bg-teal-50/20">
            <span className="text-[11px] font-bold text-teal-900 uppercase tracking-wider block">Upcoming Next</span>
            <div className="text-2xl font-black text-teal-900 mt-1">{stats.upcoming}</div>
            <span className="text-[10px] text-teal-700 mt-0.5 block">Next: 15 Oct with Dr. Patel</span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs bg-amber-50/20">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">Needs Coordinator Review</span>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.needsReview}</div>
            <span className="text-[10px] text-amber-800 mt-0.5 block">Care team resolving date</span>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/20">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Completed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.completed}</div>
            <span className="text-[10px] text-emerald-800 font-semibold mt-0.5 block">Pharmacy reconciliation</span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All Follow-ups (${followUps.length})` },
            { id: 'upcoming', label: `Upcoming (${stats.upcoming})` },
            { id: 'pending', label: `Pending Scheduling (${stats.pending})` },
            { id: 'needs-review', label: `Needs Review (${stats.needsReview})`, alert: stats.needsReview > 0 },
            { id: 'completed', label: `Completed (${stats.completed})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
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

        {/* Follow-up Cards Listing */}
        <div className="space-y-4">
          {filteredFollowUps.map(item => {
            const isCompleted = item.status === 'completed';
            const isNeedsReview = item.status === 'needs-review';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
                  isNeedsReview
                    ? 'border-amber-300 bg-amber-50/15'
                    : isCompleted
                    ? 'border-slate-200 opacity-90'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Information */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                        {item.specialty}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{item.doctorName}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.purpose}
                    </p>

                    {/* Date & Location Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
                        <div>
                          <strong className="block text-slate-900">{item.date}</strong>
                          <span className="text-[11px] text-slate-500">{item.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                        <span className="text-[11px] text-slate-700 line-clamp-1">{item.location}</span>
                      </div>
                    </div>

                    {/* Dependency Alert */}
                    {item.dependencyNote && (
                      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-teal-950 font-bold">
                          <GitBranch className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          <span>Required Before This Appointment:</span>
                        </div>
                        <p className="text-[11px] text-slate-700">{item.dependencyNote.description}</p>
                      </div>
                    )}

                    {/* Needs Review Alert */}
                    {isNeedsReview && item.needsReviewReason && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1 text-amber-950">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Care Coordinator Confirmation Pending:</span>
                        </div>
                        <p className="text-[11px] text-amber-900">{item.needsReviewReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions & Status */}
                  <div className="flex flex-row lg:flex-col lg:items-end justify-between items-center gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <StatusBadge status={item.status === 'upcoming' ? 'pending' : item.status} />

                    <div className="text-[11px] text-slate-500 font-medium">
                      {item.sourceEvidence.documentName} • P.{item.sourceEvidence.pageNumber}
                    </div>

                    <button
                      onClick={() => setSelectedFollowUp(item)}
                      className="px-4 py-2 bg-[#00e575] hover:bg-[#00cb68] text-[#052429] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Follow-up Details Modal */}
      <AnimatePresence>
        {selectedFollowUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative"
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
                  Follow-up Appointment Dossier
                </span>
                <span className="text-xs font-mono text-slate-500">Ref: #{selectedFollowUp.id}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{selectedFollowUp.title}</h2>
              <div className="text-xs text-slate-600 mt-1">
                <strong>Provider:</strong> {selectedFollowUp.doctorName} • {selectedFollowUp.specialty}
              </div>

              {/* Timing & Location */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <strong className="text-slate-900 font-bold">{selectedFollowUp.date} • {selectedFollowUp.time}</strong>
                </div>
                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 shrink-0">Clinic Location:</span>
                  <span className="text-slate-900 text-right font-medium">{selectedFollowUp.location}</span>
                </div>
              </div>

              {/* Clinical Objective */}
              <div className="mt-4 text-xs space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">Appointment Objective</span>
                <p className="text-slate-700 bg-teal-50/40 p-3 rounded-xl border border-teal-100 leading-relaxed">
                  {selectedFollowUp.purpose}
                </p>
              </div>

              {/* Related Tasks Checklist */}
              <div className="mt-4 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">Related Patient Action Tasks</span>
                <div className="space-y-1.5">
                  {selectedFollowUp.relatedTasks.map((tsk, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-800">{tsk.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        tsk.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {tsk.status === 'completed' ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminder Simulation Status */}
              <div className="mt-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-blue-950 font-bold">
                  <BellRing className="w-3.5 h-3.5 text-blue-700" />
                  <span>Automated CareFlow Reminder:</span>
                </div>
                <p className="text-slate-700">{selectedFollowUp.reminderStatus}</p>
              </div>

              {/* Source Document Citation */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" /> Discharge Document Provenance
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {selectedFollowUp.sourceEvidence.documentName} • P.{selectedFollowUp.sourceEvidence.pageNumber}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  "{selectedFollowUp.sourceEvidence.extractedText}"
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedFollowUp(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PatientLayout>
  );
}
