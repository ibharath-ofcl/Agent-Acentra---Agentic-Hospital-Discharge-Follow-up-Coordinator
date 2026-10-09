import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, Filter, AlertTriangle, CheckCircle2, Clock,
  FileText, Check, X, ShieldCheck, Pill, HeartPulse, Activity,
  AlertOctagon, Info, Sparkles, ExternalLink, ChevronRight, Eye, RefreshCw
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { doctorService } from '../../services/api/doctorService';
import { demoPatients } from '../../data/demoData';

export interface CareInstructionItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  category: 'Medication Instructions' | 'Wound Care' | 'Diet & Nutrition' | 'Activity & Mobility' | 'Physiotherapy' | 'Diagnostic Tests' | 'Follow-up Instructions' | 'Warning Signs';
  title: string;
  instructionText: string;
  sourceDocument: string;
  sourcePage: number;
  sourceSection: string;
  extractedSnippet: string;
  confidence: number;
  status: 'active' | 'verified' | 'needs-review';
  needsReviewReason?: string;
  lastUpdated: string;
  actionRequired?: string;
}

const INITIAL_CARE_INSTRUCTIONS: CareInstructionItem[] = [
  {
    id: 'CI-101',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    category: 'Medication Instructions',
    title: 'Dual-Antiplatelet Therapy Schedule',
    instructionText: 'Take Aspirin 81 mg once daily with food and Clopidogrel 75 mg once daily with lunch. Do not discontinue without direct cardiologist consultation.',
    sourceDocument: 'Discharge Summary • Arun Kumar',
    sourcePage: 1,
    sourceSection: 'Discharge Prescriptions',
    extractedSnippet: 'Aspirin 81 mg PO daily with meals; Clopidogrel 75 mg PO daily for minimum 12 months.',
    confidence: 0.99,
    status: 'active',
    lastUpdated: '05 Oct 2026',
  },
  {
    id: 'CI-102',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    category: 'Activity & Mobility',
    title: 'Gradual Recovery & Heavy Lifting Restriction',
    instructionText: 'Walk on flat surfaces 10–15 minutes daily. Do not lift, push, or pull anything heavier than 10 lbs (4.5 kg) for 4 weeks.',
    sourceDocument: 'Discharge Summary • Arun Kumar',
    sourcePage: 2,
    sourceSection: 'Physical Activity Protocol',
    extractedSnippet: 'Light walking permitted on flat level ground; strict 10 lb lifting restriction x 4 weeks.',
    confidence: 0.97,
    status: 'active',
    lastUpdated: '05 Oct 2026',
  },
  {
    id: 'CI-103',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    mrn: 'MRN-7740L',
    category: 'Physiotherapy',
    title: 'Post-Surgical Weight-Bearing Protocol',
    instructionText: 'Begin prescribed physical therapy with walker support according to rehabilitation protocol.',
    sourceDocument: 'Discharge Summary • Lakshmi Venkatesh',
    sourcePage: 3,
    sourceSection: 'Rehab Mobility Orders',
    extractedSnippet: 'Discharge order says non-weight bearing x 4 weeks; PT discharge note says partial weight bearing with walker.',
    confidence: 0.74,
    status: 'needs-review',
    needsReviewReason: 'Contradiction identified between Attending Surgeon non-weight bearing directive and Rehab notes partial weight-bearing order.',
    lastUpdated: '05 Oct 2026',
    actionRequired: 'Clarify weight-bearing percentage (0% vs 30%) with Dr. Desai.',
  },
  {
    id: 'CI-104',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    category: 'Wound Care',
    title: 'Femoral Catheter Puncture Site Care',
    instructionText: 'Keep right groin entry site clean and dry. Gently cleanse with mild soap and water after 48 hours; do not soak in a bath.',
    sourceDocument: 'Discharge Summary • Arun Kumar',
    sourcePage: 4,
    sourceSection: 'Puncture Site Instructions',
    extractedSnippet: 'Femoral sheath puncture site: shower permitted after 48h; no tub immersion or swimming for 14 days.',
    confidence: 0.95,
    status: 'active',
    lastUpdated: '05 Oct 2026',
  },
  {
    id: 'CI-105',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    category: 'Diet & Nutrition',
    title: 'Low-Sodium Cardiovascular Diet',
    instructionText: 'Maintain dietary sodium intake strictly under 2,000 mg/day. Prioritize leafy greens, legumes, and lean protein.',
    sourceDocument: 'Discharge Summary • Arun Kumar',
    sourcePage: 3,
    sourceSection: 'Nutritional Recommendations',
    extractedSnippet: 'Cardiac prudent diet: sodium restricted to < 2.0 g/day; fluid unrestricted unless peripheral edema develops.',
    confidence: 0.98,
    status: 'verified',
    lastUpdated: '06 Oct 2026',
  },
  {
    id: 'CI-106',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    mrn: 'MRN-3389P',
    category: 'Medication Instructions',
    title: 'Basal Insulin Dosage Titration',
    instructionText: 'Administer Insulin Glargine (Lantus) 16 units subcutaneously once daily at bedtime. Check fasting glucose every morning.',
    sourceDocument: 'Discharge Summary • Priya Sharma',
    sourcePage: 1,
    sourceSection: 'Endocrine Medication Orders',
    extractedSnippet: 'Lantus dosage reduced from 22 units to 16 units QHS; hold if bedtime glucose < 100 mg/dL.',
    confidence: 0.99,
    status: 'verified',
    lastUpdated: '06 Oct 2026',
  },
  {
    id: 'CI-107',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    category: 'Warning Signs',
    title: 'Emergency Cardiovascular Red Flags',
    instructionText: 'If you experience sudden chest pressure, radiating arm/jaw pain, or severe shortness of breath, call emergency services (911/112) immediately.',
    sourceDocument: 'Discharge Summary • Arun Kumar',
    sourcePage: 5,
    sourceSection: 'Emergency Warning Signs',
    extractedSnippet: 'Emergency symptoms: acute anginal chest pain, diaphoresis, syncope, or severe dyspnea — activate EMS.',
    confidence: 0.99,
    status: 'verified',
    lastUpdated: '05 Oct 2026',
  },
  {
    id: 'CI-108',
    patientId: 'P003',
    patientName: 'Rahul Kumar',
    mrn: 'MRN-8812R',
    category: 'Wound Care',
    title: 'Laparoscopic Port Site Incision Monitoring',
    instructionText: 'Leave Steri-Strips in place until they curl and fall off naturally (approx 7–10 days). Inspect daily for erythema or discharge.',
    sourceDocument: 'Discharge Summary • Rahul Kumar',
    sourcePage: 1,
    sourceSection: 'Surgical Wound Guidelines',
    extractedSnippet: 'Steri-strips intact on 4 port sites; keep dry 48h then light pat dry.',
    confidence: 0.96,
    status: 'active',
    lastUpdated: '07 Oct 2026',
  },
  {
    id: 'CI-109',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    category: 'Follow-up Instructions',
    title: 'Nephrology Consultation Timeframe Clarification',
    instructionText: 'Nephrology evaluation recommended for post-admission creatinine monitoring.',
    sourceDocument: 'Discharge Summary • Arun Kumar',
    sourcePage: 4,
    sourceSection: 'Specialist Referrals',
    extractedSnippet: 'Consider nephrology consultation for serum creatinine 1.4 at discharge. Timing not specified.',
    confidence: 0.69,
    status: 'needs-review',
    needsReviewReason: 'Discharge summary omitted recommended timeframe and urgency window for nephrology appointment.',
    lastUpdated: '05 Oct 2026',
    actionRequired: 'Contact Attending Dr. Patel to define nephrology consultation schedule.',
  },
];

export function DoctorCareInstructionsPage() {
  const [instructions, setInstructions] = useState<CareInstructionItem[]>(INITIAL_CARE_INSTRUCTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'verified' | 'needs-review'>('all');
  const [evidenceModalItem, setEvidenceModalItem] = useState<CareInstructionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const categories = useMemo(() => [
    'Medication Instructions',
    'Wound Care',
    'Diet & Nutrition',
    'Activity & Mobility',
    'Physiotherapy',
    'Diagnostic Tests',
    'Follow-up Instructions',
    'Warning Signs',
  ], []);

  // Compute stat counts
  const stats = useMemo(() => {
    return {
      total: instructions.length,
      active: instructions.filter(i => i.status === 'active').length,
      verified: instructions.filter(i => i.status === 'verified').length,
      needsReview: instructions.filter(i => i.status === 'needs-review').length,
      groundedPct: 100,
    };
  }, [instructions]);

  // Filtered instructions
  const filteredInstructions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return instructions.filter(item => {
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.instructionText.toLowerCase().includes(q) ||
        item.patientName.toLowerCase().includes(q) ||
        item.mrn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchPatient = selectedPatient === 'all' || item.patientId === selectedPatient;
      const matchStatus = selectedStatus === 'all' || item.status === selectedStatus;

      return matchSearch && matchCat && matchPatient && matchStatus;
    });
  }, [instructions, searchQuery, selectedCategory, selectedPatient, selectedStatus]);

  const handleResolveReview = (id: string, title: string) => {
    setInstructions(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status: 'verified' as const, needsReviewReason: undefined } : item
      )
    );
    if (evidenceModalItem && evidenceModalItem.id === id) {
      setEvidenceModalItem(prev => prev ? { ...prev, status: 'verified' as const, needsReviewReason: undefined } : null);
    }
    showToast(`Instruction review resolved & verified for "${title}"`);
  };

  return (
    <DoctorLayout toastMessage={toastMessage} activeTab="instructions">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider flex items-center gap-1">
                <ClipboardList className="w-3.5 h-3.5" /> Discharge Documentation Intelligence
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Safety Boundary: Grounded Extraction Only</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Care Instructions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review and verify clinical instructions extracted from hospital discharge records communicated to the patient.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Care instructions verified against EHR document repository')}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
              <span>Verify Provenance</span>
            </button>
          </div>
        </div>

        {/* Safety Boundary Banner */}
        <div className="bg-gradient-to-r from-[#0a2e35] via-[#0d3b44] to-[#0a2e35] text-white rounded-2xl p-4.5 shadow-lg border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00e575] flex items-center justify-center text-[#052429] font-black shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                <span>Clinical Grounding & Safety Guardrail Active</span>
                <span className="text-[10px] bg-[#00e575]/20 text-[#00e575] px-2 py-0.2 rounded-full font-mono border border-[#00e575]/30">
                  Zero Hallucination
                </span>
              </div>
              <p className="text-[11px] text-teal-100/80 mt-0.5">
                CareFlow AI organizes only documented discharge instructions. Ambiguous or conflicting notes are routed to <strong>Needs Human Review</strong>.
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right font-mono text-[11px] text-[#00e575]">
            100% EHR Citations
          </div>
        </div>

        {/* KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Documented</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total}</div>
            <span className="text-[10px] text-teal-800 font-semibold mt-0.5 block">Across 8 Categories</span>
          </div>

          <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs bg-emerald-50/20">
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">Active Instructions</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">{stats.active}</div>
            <span className="text-[10px] text-emerald-800 font-medium mt-0.5 block">Delivered to portal</span>
          </div>

          <div className="bg-white rounded-2xl border border-blue-200 p-4 shadow-xs bg-blue-50/20">
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">Coordinator Verified</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{stats.verified}</div>
            <span className="text-[10px] text-blue-800 font-medium mt-0.5 block">Clinician signed off</span>
          </div>

          <div className="bg-white rounded-2xl border border-amber-300 p-4 shadow-xs bg-amber-50/40">
            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider block">Needs Human Review</span>
            <div className="text-2xl font-black text-amber-900 mt-1">{stats.needsReview}</div>
            <span className="text-[10px] text-amber-800 font-bold mt-0.5 block">Ambiguous / Contradictory</span>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search instructions, medication names, dietary restrictions, wound care..."
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
                value={selectedPatient}
                onChange={e => setSelectedPatient(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All Patients</option>
                {demoPatients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                aria-label="Filter by review status"
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="verified">Verified</option>
                <option value="needs-review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Category Pills Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-teal-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Categories ({instructions.length})
            </button>
            {categories.map(cat => {
              const count = instructions.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-teal-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInstructions.length === 0 ? (
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center text-slate-500 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">No care instructions match current filters</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting a different category or clearing search</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedPatient('all');
                  setSelectedStatus('all');
                }}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredInstructions.map(item => {
              const isNeedsReview = item.status === 'needs-review';

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                    isNeedsReview
                      ? 'border-amber-300 bg-amber-50/15'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            item.category === 'Medication Instructions'
                              ? 'bg-blue-100 text-blue-900'
                              : item.category === 'Wound Care'
                              ? 'bg-emerald-100 text-emerald-900'
                              : item.category === 'Warning Signs'
                              ? 'bg-red-100 text-red-900'
                              : item.category === 'Physiotherapy'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-teal-100 text-teal-900'
                          }`}>
                            {item.category}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{item.patientName}</span>
                          <span className="text-[11px] font-mono text-teal-800 font-semibold bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                            {item.mrn}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">{item.title}</h3>
                      </div>

                      <div className="shrink-0">
                        {isNeedsReview ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            Needs Review
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                            {item.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Instruction Body */}
                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-800 leading-relaxed font-normal">
                      "{item.instructionText}"
                    </div>

                    {/* Needs Review Alert Box */}
                    {isNeedsReview && item.needsReviewReason && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1 text-amber-950">
                        <div className="flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Safety Gate Flag:</span>
                        </div>
                        <p className="text-[11px] text-amber-900">{item.needsReviewReason}</p>
                        {item.actionRequired && (
                          <div className="text-[11px] font-semibold text-amber-950 pt-1 border-t border-amber-200">
                            <strong>Action:</strong> {item.actionRequired}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer Citation & Evidence Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500 font-mono text-[11px] truncate max-w-[240px]">
                      {item.sourceDocument} • P.{item.sourcePage}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEvidenceModalItem(item)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-teal-700" />
                        <span>Source Evidence</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Source Evidence & Review Modal */}
      <AnimatePresence>
        {evidenceModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setEvidenceModalItem(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Grounded Document Provenance
                </span>
                <span className="text-xs font-mono text-slate-500">Ref: #{evidenceModalItem.id}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{evidenceModalItem.title}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient: <strong>{evidenceModalItem.patientName}</strong> ({evidenceModalItem.mrn}) • {evidenceModalItem.category}
              </p>

              {/* Exact Document Snippet */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span><strong>Source:</strong> {evidenceModalItem.sourceDocument}</span>
                  <span className="font-mono">Page {evidenceModalItem.sourcePage} • {evidenceModalItem.sourceSection}</span>
                </div>
                <div className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                  "{evidenceModalItem.extractedSnippet}"
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Extraction Confidence: <strong>{Math.round(evidenceModalItem.confidence * 100)}%</strong></span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Document Verified
                  </span>
                </div>
              </div>

              {/* Instruction as Delivered */}
              <div className="mt-4 text-xs space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">Delivered Care Directive</span>
                <p className="text-slate-700 bg-teal-50/50 p-3 rounded-xl border border-teal-100 leading-relaxed">
                  {evidenceModalItem.instructionText}
                </p>
              </div>

              {/* Review Resolution */}
              {evidenceModalItem.status === 'needs-review' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-1.5 text-amber-950">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Review Reason:</span>
                  </div>
                  <p className="text-xs">{evidenceModalItem.needsReviewReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setEvidenceModalItem(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
                {evidenceModalItem.status === 'needs-review' && (
                  <button
                    onClick={() => handleResolveReview(evidenceModalItem.id, evidenceModalItem.title)}
                    className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Approve Clinical Directive
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DoctorLayout>
  );
}
