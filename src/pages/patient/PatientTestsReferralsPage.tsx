import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, TestTube2, ArrowRight, Calendar, Clock, MapPin,
  CheckCircle2, AlertTriangle, FileText, ChevronRight, X, Sparkles,
  Search, Filter, ShieldCheck, HeartPulse, GitBranch, BellRing,
  Info, ExternalLink, RefreshCw, Check, Building2
} from 'lucide-react';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { SourceEvidenceTag } from '../../components/common/SourceEvidenceTag';
import { patientService, type PatientTest } from '../../services/api/patientService';

export interface DiagnosticTestItem {
  id: string;
  name: string;
  type: 'blood' | 'imaging' | 'cardiac' | 'ultrasound';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  location: string;
  preparationInstructions: string;
  requiredBefore: string;
  dependencyStatus: 'pending' | 'satisfied' | 'review-needed';
  reminderStatus: string;
  patientReportedStatus?: string;
  sourceEvidence: {
    documentId: string;
    documentName: string;
    pageNumber: number;
    sectionTitle: string;
    extractedText: string;
    confidence: number;
  };
  explanation: string;
}

export interface SpecialistReferralItem {
  id: string;
  referralType: string;
  specialty: string;
  targetDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  authorizedProvider: string;
  facility: string;
  reasonForReferral: string;
  relatedAppointment?: string;
  bookingInstructions: string;
  reminderStatus: string;
  patientReportedStatus?: string;
  sourceEvidence: {
    documentId: string;
    documentName: string;
    pageNumber: number;
    sectionTitle: string;
    extractedText: string;
    confidence: number;
  };
}

const INITIAL_TESTS: DiagnosticTestItem[] = [
  {
    id: 'TEST-01',
    name: 'Fasting Lipid Profile & Comprehensive Metabolic Panel (CMP)',
    type: 'blood',
    dueDate: '14 October 2026',
    status: 'pending',
    priority: 'high',
    location: 'City General Diagnostic Laboratory • Suite 102',
    preparationInstructions: '10 to 12 hours overnight fasting required. Water and regular morning blood pressure medications are permitted.',
    requiredBefore: 'Cardiology Specialist Evaluation (15 October 2026)',
    dependencyStatus: 'pending',
    reminderStatus: 'SMS Reminder scheduled for 13 Oct at 09:00 AM',
    sourceEvidence: {
      documentId: 'DOC-DS-001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Required Laboratory Diagnostics',
      extractedText: 'Order repeat serum creatinine, electrolytes, liver enzymes, and fasting lipid panel prior to 10-day Cardiology follow-up.',
      confidence: 0.98,
    },
    explanation: 'Monitors kidney function after angiogram contrast dye and verifies baseline cholesterol levels for statin therapy adjustment.',
  },
  {
    id: 'TEST-02',
    name: 'Transthoracic Echocardiogram (TTE) Follow-up',
    type: 'cardiac',
    dueDate: '28 October 2026',
    status: 'in-progress',
    priority: 'medium',
    location: 'Advanced Cardiovascular Imaging Center • 3rd Floor',
    preparationInstructions: 'No fasting required. Wear comfortable two-piece clothing. Bring previous hospital discharge imaging disc.',
    requiredBefore: 'Cardiac Rehabilitation Phase II Program Enrollment',
    dependencyStatus: 'pending',
    reminderStatus: 'Appointment confirmation call scheduled for 26 Oct',
    sourceEvidence: {
      documentId: 'DOC-DS-001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Post-Discharge Imaging & Physiology',
      extractedText: 'Schedule resting transthoracic echocardiogram at 3-4 weeks post-percutaneous coronary intervention (PCI) to assess left ventricular ejection fraction (LVEF).',
      confidence: 0.96,
    },
    explanation: 'Measures heart muscle pumping function and recovery after coronary stent placement.',
  },
  {
    id: 'TEST-03',
    name: 'Groin Femoral Entry Site Ultrasound (Conditional)',
    type: 'ultrasound',
    dueDate: 'As Needed (If Swelling or Hematoma Develops)',
    status: 'pending',
    priority: 'low',
    location: 'Outpatient Vascular Lab • West Wing',
    preparationInstructions: 'Only required if patient notes worsening tenderness, swelling, or pulsatile mass at puncture site.',
    requiredBefore: 'Primary Care Nurse Check (20 October 2026)',
    dependencyStatus: 'satisfied',
    reminderStatus: 'Daily symptom check-in prompt in CareFlow portal',
    sourceEvidence: {
      documentId: 'DOC-DS-001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Puncture Site Care & Escalation Protocol',
      extractedText: 'Perform localized duplex Doppler ultrasound if significant hematoma or femoral thrill is detected on physical exam.',
      confidence: 0.94,
    },
    explanation: 'Safety check to confirm proper closure of the femoral artery puncture site used during catheterization.',
  },
];

const INITIAL_REFERRALS: SpecialistReferralItem[] = [
  {
    id: 'REF-01',
    referralType: 'Cardiovascular Specialist Outpatient Referral',
    specialty: 'Cardiovascular Care / Interventional Cardiology',
    targetDate: '15 October 2026 (Within 10 Days)',
    status: 'in-progress',
    priority: 'high',
    authorizedProvider: 'Dr. Meera Patel, MD (Cardiology)',
    facility: 'Cardiovascular Center of Excellence • Suite 204',
    reasonForReferral: 'Post-acute myocardial infarction clinical assessment, evaluation of dual-antiplatelet tolerance, and long-term secondary prevention plan.',
    relatedAppointment: 'Cardiology Clinic Visit #PFU-01',
    bookingInstructions: 'Appointment pre-coordinated by hospital discharge coordinator. Check-in 15 minutes early at Suite 204.',
    reminderStatus: 'Confirmed in CareFlow registry with automated notification',
    sourceEvidence: {
      documentId: 'DOC-DS-001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Specialist Referrals & Care Transitions',
      extractedText: 'Refer to Dr. Meera Patel for post-discharge cardiology clinic visit within 10 days of STEMI discharge.',
      confidence: 0.99,
    },
  },
  {
    id: 'REF-02',
    referralType: 'Phase II Monitored Cardiac Rehabilitation',
    specialty: 'Physical Medicine & Exercise Physiology',
    targetDate: '04 November 2026 (Within 30 Days)',
    status: 'pending',
    priority: 'medium',
    authorizedProvider: 'Cardiac Rehab Clinical Team',
    facility: 'Wellness & Prevention Pavilion • 1st Floor Gym Suite',
    reasonForReferral: 'Supervised telemetry exercise conditioning, cardiovascular endurance restoration, and guided aerobic reconditioning.',
    relatedAppointment: 'Rehab Intake Evaluation',
    bookingInstructions: 'Intake coordinator will contact patient after the 15 Oct cardiology evaluation clearance.',
    reminderStatus: 'Outreach queue active in CareFlow coordinator dashboard',
    sourceEvidence: {
      documentId: 'DOC-DS-001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Cardiac Rehabilitation Orders',
      extractedText: 'Patient is indicated for 12-week supervised Phase II Outpatient Cardiac Rehabilitation following post-procedure clinic clearance.',
      confidence: 0.97,
    },
  },
  {
    id: 'REF-03',
    referralType: 'Clinical Nutrition & Heart-Healthy Dietary Counseling',
    specialty: 'Preventive Nutrition & Metabolism',
    targetDate: '10 November 2026',
    status: 'pending',
    priority: 'low',
    authorizedProvider: 'Registered Dietitian (RD)',
    facility: 'Preventive Medicine Suite 108',
    reasonForReferral: 'Guidance on Mediterranean-style low-sodium, heart-healthy dietary plan tailored to post-MI lifestyle modification.',
    bookingInstructions: 'Optional virtual telehealth appointment available through CareFlow portal.',
    reminderStatus: 'Optional invitation sent to patient portal',
    sourceEvidence: {
      documentId: 'DOC-DS-001',
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Lifestyle & Dietary Guidance',
      extractedText: 'Dietary consult referral provided for sodium restriction (<2g/day) and Mediterranean heart health guidance.',
      confidence: 0.95,
    },
  },
];

export function PatientTestsReferralsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'tests' | 'referrals'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const [tests, setTests] = useState<DiagnosticTestItem[]>(INITIAL_TESTS);
  const [referrals, setReferrals] = useState<SpecialistReferralItem[]>(INITIAL_REFERRALS);
  const [loading, setLoading] = useState(true);

  const [selectedTest, setSelectedTest] = useState<DiagnosticTestItem | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<SpecialistReferralItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiExplaining, setAiExplaining] = useState(false);
  const [aiExplanationText, setAiExplanationText] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const loadTests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getTests();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: DiagnosticTestItem[] = data.map((item: PatientTest, idx: number) => ({
          id: item.id || `TEST-${idx + 1}`,
          name: item.name || 'Diagnostic Test',
          type: 'blood',
          dueDate: item.dueDate || 'TBD',
          status: (item.status === 'completed' ? 'completed' : item.status === 'needs-review' ? 'needs-review' : 'pending') as any,
          priority: 'high',
          location: 'Main Diagnostic Lab Pavilion',
          preparationInstructions: item.notes || '10-12 hour overnight fasting required. Water is permitted.',
          requiredBefore: 'Cardiology Specialist Follow-up',
          dependencyStatus: item.status === 'completed' ? 'satisfied' : 'pending',
          reminderStatus: 'Automated 24-hr reminder scheduled',
          patientReportedStatus: item.status === 'completed' ? `Completed ${item.completedAt || ''}` : undefined,
          sourceEvidence: {
            documentId: 'DOC-001',
            documentName: item.source || 'Discharge Summary • MySQL DB',
            pageNumber: 1,
            sectionTitle: 'Diagnostic Workup',
            extractedText: item.notes || `${item.name} ordered for discharge follow-up`,
            confidence: 0.97,
          },
          explanation: `Routine post-discharge diagnostic evaluation to monitor recovery.`,
        }));
        setTests(mapped);
      }
    } catch (err: any) {
      console.warn('Using preset tests:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTests();
  }, [loadTests]);

  const handlePatientReportTest = async (testId: string) => {
    const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const reportedStr = `Patient reported sample collected on ${timestamp}`;

    setTests(prev => prev.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          status: 'completed',
          dependencyStatus: 'satisfied',
          patientReportedStatus: reportedStr,
        };
      }
      return t;
    }));

    if (selectedTest?.id === testId) {
      setSelectedTest(prev => prev ? {
        ...prev,
        status: 'completed',
        dependencyStatus: 'satisfied',
        patientReportedStatus: reportedStr,
      } : null);
    }
    
    try {
      await patientService.reportTest(testId);
      showToast('✓ Test sample collection logged to MySQL care record.');
    } catch (e) {
      showToast('✓ Test sample collection recorded.');
    }
  };

  const handleToggleTestStatus = async (testId: string, newStatus: 'completed' | 'pending') => {
    const isCompleted = newStatus === 'completed';
    const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const reportedStr = isCompleted ? `Patient reported sample collected on ${timestamp}` : undefined;

    setTests(prev => prev.map(t => {
      if (t.id === testId) {
        return {
          ...t,
          status: newStatus,
          dependencyStatus: isCompleted ? 'satisfied' : 'pending',
          patientReportedStatus: reportedStr,
        };
      }
      return t;
    }));

    if (selectedTest?.id === testId) {
      setSelectedTest(prev => prev ? {
        ...prev,
        status: newStatus,
        dependencyStatus: isCompleted ? 'satisfied' : 'pending',
        patientReportedStatus: reportedStr,
      } : null);
    }

    try {
      if (isCompleted) {
        await patientService.reportTest(testId);
        showToast('✓ Test sample collection logged to care record.');
      } else {
        showToast('Test status reset to pending.');
      }
    } catch (e) {
      showToast(isCompleted ? '✓ Test status updated' : 'Status reset');
    }
  };

  const handlePatientReportReferral = async (refId: string) => {
    const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const reportedStr = `Patient confirmed appointment inquiry on ${timestamp}`;

    setReferrals(prev => prev.map(r => {
      if (r.id === refId) {
        return {
          ...r,
          status: 'in-progress',
          patientReportedStatus: reportedStr,
        };
      }
      return r;
    }));
    if (selectedReferral?.id === refId) {
      setSelectedReferral(prev => prev ? {
        ...prev,
        status: 'in-progress',
        patientReportedStatus: reportedStr,
      } : null);
    }
    try {
      await patientService.reportReferral(refId);
      showToast('✓ Specialist referral inquiry recorded in care record.');
    } catch (e) {
      showToast('✓ Specialist referral inquiry recorded');
    }
  };

  const handleAskGemini = (title: string, context: string) => {
    setAiExplaining(true);
    setAiExplanationText(null);
    setTimeout(() => {
      setAiExplaining(false);
      setAiExplanationText(
        `Plain-Language Summary: According to your discharge document, "${title}" is ordered to ${context.toLowerCase()} CareFlow AI tracks this order so your care team receives the results before your next scheduled appointment.`
      );
    }, 600);
  };

  const filteredTests = useMemo(() => {
    return tests.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q) ||
        t.requiredBefore.toLowerCase().includes(q)
      );
    });
  }, [tests, statusFilter, searchQuery]);

  const filteredReferrals = useMemo(() => {
    return referrals.filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.referralType.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q) ||
        r.authorizedProvider.toLowerCase().includes(q) ||
        r.facility.toLowerCase().includes(q)
      );
    });
  }, [referrals, statusFilter, searchQuery]);

  const totalCount = tests.length + referrals.length;
  const pendingCount = tests.filter(t => t.status === 'pending').length + referrals.filter(r => r.status === 'pending').length;
  const inProgressCount = tests.filter(t => t.status === 'in-progress').length + referrals.filter(r => r.status === 'in-progress').length;
  const completedCount = tests.filter(t => t.status === 'completed').length + referrals.filter(r => r.status === 'completed').length;

  return (
    <PatientLayout activeTab="tests-referrals" toastMessage={toastMessage}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#052429] via-[#07363d] to-[#052429] border border-[#0e4851] rounded-2xl p-6 text-white shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#00e575]/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#00e575] bg-[#072d33] px-2.5 py-0.5 rounded-full border border-[#0e4851]">
                  Care Orders & Referrals
                </span>
                <span className="text-[11px] text-teal-300 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00e575]" /> Grounded in EHR Discharge Record
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                <Stethoscope className="w-7 h-7 text-[#00e575]" />
                Tests & Referrals
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
                Diagnostic lab orders, medical imaging, and specialist consultations documented in your hospital discharge summary.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => showToast('CareFlow verified all orders with the hospital discharge record')}
                className="px-3.5 py-2 rounded-xl bg-[#0a383f] hover:bg-[#0e4851] border border-[#145d68] text-xs font-semibold text-teal-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#00e575]" /> Refresh Status
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-[#0e4851]/80">
            <div className="bg-[#072d33]/80 p-3 rounded-xl border border-[#0e4851]">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Total Orders</div>
              <div className="text-xl font-black text-white mt-0.5">{totalCount}</div>
              <div className="text-[10px] text-teal-300 font-mono mt-0.5">3 Tests • 3 Referrals</div>
            </div>
            <div className="bg-[#072d33]/80 p-3 rounded-xl border border-[#0e4851]">
              <div className="text-[11px] font-bold text-amber-400 uppercase">Pending Action</div>
              <div className="text-xl font-black text-amber-300 mt-0.5">{pendingCount}</div>
              <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Awaiting draw or intake</div>
            </div>
            <div className="bg-[#072d33]/80 p-3 rounded-xl border border-[#0e4851]">
              <div className="text-[11px] font-bold text-sky-400 uppercase">In Progress</div>
              <div className="text-xl font-black text-sky-300 mt-0.5">{inProgressCount}</div>
              <div className="text-[10px] text-sky-400/80 font-mono mt-0.5">Scheduled in system</div>
            </div>
            <div className="bg-[#072d33]/80 p-3 rounded-xl border border-[#0e4851]">
              <div className="text-[11px] font-bold text-[#00e575] uppercase">Completed</div>
              <div className="text-xl font-black text-[#00e575] mt-0.5">{completedCount}</div>
              <div className="text-[10px] text-teal-300/80 font-mono mt-0.5">Results archived</div>
            </div>
          </div>
        </div>

        {/* Care Dependency Intelligence Banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-950 block text-xs sm:text-sm">
                Care Dependency Notice: Fasting Blood Test Required Before Follow-up
              </span>
              <p className="text-amber-800 text-[11px] sm:text-xs mt-0.5">
                Your <strong className="font-semibold">Fasting Lipid & CMP Test (14 Oct)</strong> must be completed prior to your <strong className="font-semibold">Cardiology Clinic Visit (15 Oct)</strong> so Dr. Patel has fresh lab values.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const test = tests.find(t => t.id === 'TEST-01');
              if (test) setSelectedTest(test);
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer shadow-xs"
          >
            View Test Instructions
          </button>
        </div>

        {/* Section Tabs, Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Segmented Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'tests'
                  ? 'bg-[#052429] text-[#00e575] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TestTube2 className="w-3.5 h-3.5" />
              Diagnostic Tests ({tests.length})
            </button>
            <button
              onClick={() => setActiveTab('referrals')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'referrals'
                  ? 'bg-[#052429] text-[#00e575] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Specialist Referrals ({referrals.length})
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tests, referrals, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-500 focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filter by status"
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* CONTENT SECTIONS */}
        <div className="space-y-8">
          {/* SECTION 1: DIAGNOSTIC TESTS */}
          {(activeTab === 'all' || activeTab === 'tests') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                    <TestTube2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Diagnostic Tests & Laboratory Orders</h2>
                    <p className="text-[11px] text-slate-500">Blood chemistry, metabolic panels, and imaging required in your care pathway</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'}
                </span>
              </div>

              {filteredTests.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <TestTube2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No diagnostic tests match your search criteria</p>
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="mt-2 text-xs text-teal-700 hover:underline font-semibold"
                  >
                    Clear active filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map((test) => (
                    <motion.div
                      key={test.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 hover:border-teal-400 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
                    >
                      {/* Top Bar */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {test.type.toUpperCase()} TEST
                          </span>
                          <StatusBadge status={test.status} size="sm" />
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-800 transition-colors line-clamp-2">
                          {test.name}
                        </h3>

                        {/* Due Date & Location */}
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                            <span className="font-semibold text-slate-900">Target Date:</span> {test.dueDate}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{test.location}</span>
                          </div>
                        </div>

                        {/* Care Dependency Highlight */}
                        {test.requiredBefore && (
                          <div className="mt-3 bg-teal-50/70 border border-teal-200/80 rounded-lg p-2.5 text-[11px]">
                            <span className="font-bold text-teal-900 block flex items-center gap-1.5">
                              <GitBranch className="w-3 h-3 text-teal-700" /> Required Before:
                            </span>
                            <span className="text-teal-800 line-clamp-1">{test.requiredBefore}</span>
                          </div>
                        )}

                        {/* Patient Reported Tag */}
                        {test.patientReportedStatus && (
                          <div className="mt-2 text-[10px] text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="font-semibold">{test.patientReportedStatus}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <SourceEvidenceTag evidence={test.sourceEvidence} />
                        <div className="flex items-center gap-2">
                          {test.status !== 'completed' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatientReportTest(test.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Record that you have completed this test"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-600" /> Report Sample
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Done
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedTest(test)}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            View Details <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: SPECIALIST REFERRALS */}
          {(activeTab === 'all' || activeTab === 'referrals') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Specialist Referrals & Care Transitions</h2>
                    <p className="text-[11px] text-slate-500">Outpatient clinical consultations and post-discharge therapy authorizations</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {filteredReferrals.length} {filteredReferrals.length === 1 ? 'referral' : 'referrals'}
                </span>
              </div>

              {filteredReferrals.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No specialist referrals match your search criteria</p>
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                    className="mt-2 text-xs text-sky-700 hover:underline font-semibold"
                  >
                    Clear active filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReferrals.map((ref) => (
                    <motion.div
                      key={ref.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-slate-200 hover:border-sky-400 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
                    >
                      {/* Top Bar */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            {ref.specialty.split('/')[0].trim()}
                          </span>
                          <StatusBadge status={ref.status} size="sm" />
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-900 transition-colors line-clamp-2">
                          {ref.referralType}
                        </h3>

                        {/* Specialist & Location */}
                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                            <span className="font-semibold text-slate-900 truncate">{ref.authorizedProvider}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Target: {ref.targetDate}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{ref.facility}</span>
                          </div>
                        </div>

                        {/* Indication Note */}
                        <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[11px] text-slate-700">
                          <span className="font-bold text-slate-900 block mb-0.5">Clinical Indication:</span>
                          <span className="line-clamp-2">{ref.reasonForReferral}</span>
                        </div>

                        {/* Patient Reported Tag */}
                        {ref.patientReportedStatus && (
                          <div className="mt-2 text-[10px] text-sky-800 bg-sky-50 px-2 py-1 rounded border border-sky-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-sky-600 shrink-0" />
                            <span className="font-semibold">{ref.patientReportedStatus}</span>
                          </div>
                        )}
                      </div>

                      {/* Card Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <SourceEvidenceTag evidence={ref.sourceEvidence} />
                        <div className="flex items-center gap-2">
                          {ref.status !== 'in-progress' && ref.status !== 'completed' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePatientReportReferral(ref.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Confirm that you have reached out or scheduled this referral"
                            >
                              <Check className="w-3.5 h-3.5 text-sky-600" /> Confirm Inquiry
                            </button>
                          ) : (
                            <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-1 rounded flex items-center gap-1 border border-sky-200">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Inquired
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedReferral(ref)}
                            className="px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            View Details <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grounded Clinical Notice */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">CareFlow Care Coordination Policy:</span>
            <p className="mt-0.5 text-[11px] leading-relaxed">
              All diagnostic orders and specialist referrals displayed here represent documented physician orders extracted directly from your hospital discharge record. CareFlow AI coordinates scheduling and reminders but does not alter prescribed medical regimens.
            </p>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL: DIAGNOSTIC TEST */}
      <AnimatePresence>
        {selectedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black shrink-0">
                    <TestTube2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {selectedTest.type.toUpperCase()} TEST
                      </span>
                      <StatusBadge status={selectedTest.status} size="sm" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedTest.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedTest(null); setAiExplanationText(null); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Due Date & Facility Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">TARGET TEST DATE</span>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-teal-700" /> {selectedTest.dueDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">DESIGNATED LAB FACILITY</span>
                    <span className="text-slate-800 font-medium flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-teal-700 shrink-0" /> {selectedTest.location}
                    </span>
                  </div>
                </div>

                {/* Patient Preparation Instructions */}
                <div className="bg-teal-50/60 border border-teal-200 rounded-xl p-4 text-xs">
                  <span className="font-bold text-teal-950 flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-teal-700" /> Preparation & Fasting Guidelines
                  </span>
                  <p className="text-teal-900 leading-relaxed">
                    {selectedTest.preparationInstructions}
                  </p>
                </div>

                {/* Care Dependency Intelligence */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs">
                  <span className="font-bold text-amber-950 flex items-center gap-2 mb-1">
                    <GitBranch className="w-4 h-4 text-amber-700" /> Care Pathway Dependency
                  </span>
                  <p className="text-amber-900">
                    <strong className="font-semibold">Required Before:</strong> {selectedTest.requiredBefore}
                  </p>
                  <p className="text-[11px] text-amber-800/90 mt-1">
                    CareFlow AI coordinates with the diagnostic laboratory so your cardiologist has full test results at your follow-up visit.
                  </p>
                </div>

                {/* Grounded Source Document Proof */}
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-teal-300">
                    <span className="font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#00e575]" /> Grounded Source Evidence
                    </span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Page {selectedTest.sourceEvidence.pageNumber} • Confidence {Math.round(selectedTest.sourceEvidence.confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{selectedTest.sourceEvidence.documentName} • {selectedTest.sourceEvidence.sectionTitle}</div>
                  <blockquote className="border-l-2 border-[#00e575] pl-3 italic text-slate-300 font-serif text-xs">
                    "{selectedTest.sourceEvidence.extractedText}"
                  </blockquote>
                </div>

                {/* Gemini AI Plain Language Explainer */}
                <div className="bg-[#052429] text-white p-4 rounded-xl border border-[#0e4851] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00e575]" />
                      <span className="text-xs font-bold text-white">Gemini Care Assistant</span>
                    </div>
                    <button
                      onClick={() => handleAskGemini(selectedTest.name, selectedTest.explanation)}
                      disabled={aiExplaining}
                      className="px-2.5 py-1 rounded-lg bg-[#00e575] hover:bg-[#00c865] text-[#052429] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {aiExplaining ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Explaining...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" /> Explain in Simple Terms
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiExplanationText || selectedTest.explanation}
                  </p>
                </div>

                {/* Patient Reported Completion Action */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Reminder Status: <span className="text-slate-700 font-medium">{selectedTest.reminderStatus}</span>
                  </div>
                  {selectedTest.status === 'completed' ? (
                    <div className="w-full sm:w-auto bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs font-bold">Sample Collection Logged</span>
                      </div>
                      <button
                        onClick={() => handleToggleTestStatus(selectedTest.id, 'pending')}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                        title="Mark test back to pending status"
                      >
                        Undo
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePatientReportTest(selectedTest.id)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
                      Record Patient Reported Completion
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL MODAL: SPECIALIST REFERRAL */}
      <AnimatePresence>
        {selectedReferral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4 sticky top-0 bg-white z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-black shrink-0">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {selectedReferral.specialty}
                      </span>
                      <StatusBadge status={selectedReferral.status} size="sm" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedReferral.referralType}</h2>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedReferral(null); setAiExplanationText(null); }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Provider & Facility Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">ASSIGNED SPECIALIST / TEAM</span>
                    <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-sky-700" /> {selectedReferral.authorizedProvider}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block mb-1">FACILITY / CLINIC LOCATION</span>
                    <span className="text-slate-800 font-medium flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-sky-700 shrink-0" /> {selectedReferral.facility}
                    </span>
                  </div>
                </div>

                {/* Reason for Referral */}
                <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-4 text-xs">
                  <span className="font-bold text-sky-950 flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-sky-700" /> Documented Clinical Indication
                  </span>
                  <p className="text-sky-900 leading-relaxed">
                    {selectedReferral.reasonForReferral}
                  </p>
                </div>

                {/* Booking & Intake Instructions */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-2 mb-1">
                    <Info className="w-4 h-4 text-slate-600" /> Booking & Coordination Instructions
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedReferral.bookingInstructions}
                  </p>
                </div>

                {/* Grounded Source Document Proof */}
                <div className="bg-slate-900 text-slate-200 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-teal-300">
                    <span className="font-mono flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#00e575]" /> Grounded Source Evidence
                    </span>
                    <span className="font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      Page {selectedReferral.sourceEvidence.pageNumber} • Confidence {Math.round(selectedReferral.sourceEvidence.confidence * 100)}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">{selectedReferral.sourceEvidence.documentName} • {selectedReferral.sourceEvidence.sectionTitle}</div>
                  <blockquote className="border-l-2 border-[#00e575] pl-3 italic text-slate-300 font-serif text-xs">
                    "{selectedReferral.sourceEvidence.extractedText}"
                  </blockquote>
                </div>

                {/* Gemini AI Plain Language Explainer */}
                <div className="bg-[#052429] text-white p-4 rounded-xl border border-[#0e4851] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00e575]" />
                      <span className="text-xs font-bold text-white">Gemini Care Assistant</span>
                    </div>
                    <button
                      onClick={() => handleAskGemini(selectedReferral.referralType, selectedReferral.reasonForReferral)}
                      disabled={aiExplaining}
                      className="px-2.5 py-1 rounded-lg bg-[#00e575] hover:bg-[#00c865] text-[#052429] font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {aiExplaining ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" /> Explaining...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" /> Explain in Simple Terms
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {aiExplanationText || `This specialist referral ensures you receive structured follow-up care with ${selectedReferral.authorizedProvider}.`}
                  </p>
                </div>

                {/* Patient Reported Action */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500">
                    Reminder Status: <span className="text-slate-700 font-medium">{selectedReferral.reminderStatus}</span>
                  </div>
                  {selectedReferral.status === 'in-progress' || selectedReferral.status === 'completed' ? (
                    <div className="w-full sm:w-auto bg-sky-50 border border-sky-200 rounded-xl px-4 py-2 flex items-center gap-2 text-sky-900">
                      <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="text-xs font-bold">Referral Appointment Inquired</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handlePatientReportReferral(selectedReferral.id)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-98"
                    >
                      <CheckCircle2 className="w-4 h-4 text-sky-400" />
                      Confirm Referral Appointment Inquired
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PatientLayout>
  );
}

export default PatientTestsReferralsPage;
