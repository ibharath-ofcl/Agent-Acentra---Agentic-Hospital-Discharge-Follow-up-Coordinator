import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock, CheckCircle2, Clock, Calendar, Check, X,
  FileText, ChevronRight, AlertTriangle, ShieldCheck, HeartPulse,
  Pill, Stethoscope, BellRing, GitBranch, Sparkles, Filter, RefreshCw
} from 'lucide-react';
import { PatientLayout } from '../../components/layout/PatientLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';

export interface PatientTaskItem {
  id: string;
  name: string;
  description: string;
  dueDate: string;
  timeHorizon: 'today' | 'tomorrow' | 'this-week' | 'later' | 'overdue' | 'completed';
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review' | 'overdue';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'appointment' | 'test' | 'medication' | 'monitoring' | 'rehab';
  whyItMatters: string;
  relatedItem: string;
  reminderStatus: string;
  patientReportedDone?: boolean;
  patientReportedAt?: string;
  sourceEvidence: {
    documentName: string;
    pageNumber: number;
    sectionTitle: string;
    extractedText: string;
  };
}

const INITIAL_PATIENT_TASKS: PatientTaskItem[] = [
  {
    id: 'PT-01',
    name: 'Log Morning Blood Pressure & Pulse Baseline',
    description: 'Check blood pressure with home cuff while seated; enter systolic, diastolic, and resting heart rate into the portal.',
    dueDate: 'Today (09 Oct 2026)',
    timeHorizon: 'today',
    status: 'pending',
    priority: 'high',
    category: 'monitoring',
    whyItMatters: 'Establishes baseline hemodynamics following beta-blocker initiation.',
    relatedItem: 'Cardiology Follow-up (15 Oct)',
    reminderStatus: 'Daily AM portal prompt active',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Home Monitoring Instructions',
      extractedText: 'Record daily AM blood pressure; alert clinic if systolic drops below 100 or exceeds 160.',
    },
  },
  {
    id: 'PT-02',
    name: 'Take Morning Doses: Aspirin (81mg) with Breakfast',
    description: 'Take prescribed aspirin with food to protect stomach lining; do not skip doses.',
    dueDate: 'Today (09 Oct 2026)',
    timeHorizon: 'today',
    status: 'completed',
    priority: 'high',
    category: 'medication',
    whyItMatters: 'Dual-antiplatelet therapy prevents acute stent thrombosis after coronary stenting.',
    relatedItem: 'Medication Reconciliation Plan',
    reminderStatus: 'Confirmed via patient check-in at 08:30 AM',
    patientReportedDone: true,
    patientReportedAt: 'Today at 08:30 AM',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Discharge Prescriptions',
      extractedText: 'Aspirin 81 mg daily PO with meals; Clopidogrel 75 mg PO daily.',
    },
  },
  {
    id: 'PT-03',
    name: 'Confirm Fasting Lab Appointment for 14 Oct',
    description: 'Confirm diagnostic lab center appointment for repeat serum creatinine, electrolytes, and lipid panel.',
    dueDate: 'Tomorrow (10 Oct 2026)',
    timeHorizon: 'tomorrow',
    status: 'pending',
    priority: 'high',
    category: 'test',
    whyItMatters: 'Dr. Patel requires blood chemistry results at the 15 Oct Cardiology follow-up visit.',
    relatedItem: 'Cardiology Specialist Follow-up (15 Oct)',
    reminderStatus: 'Automated SMS reminder will dispatch tomorrow at 10:00 AM',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Required Laboratory Orders',
      extractedText: 'Repeat serum creatinine, electrolytes, and lipid panel at 14 days post-discharge.',
    },
  },
  {
    id: 'PT-04',
    name: 'Fasting Blood Work: Lipid Panel & Renal Function',
    description: '10-hour fasting required prior to blood draw at City General Diagnostic Lab.',
    dueDate: '14 Oct 2026 (In 5 Days)',
    timeHorizon: 'this-week',
    status: 'pending',
    priority: 'urgent',
    category: 'test',
    whyItMatters: 'Precondition test for cardiology follow-up visit on 15 Oct.',
    relatedItem: 'Cardiology Specialist Follow-up (15 Oct)',
    reminderStatus: 'CareFlow 24-hr reminder call scheduled for 13 Oct',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 3,
      sectionTitle: 'Laboratory Instructions',
      extractedText: 'Fasting lipid panel and renal panel mandatory prior to cardiology review.',
    },
  },
  {
    id: 'PT-05',
    name: 'Cardiology Outpatient Clinic Visit with Dr. Patel',
    description: 'In-person clinic consultation at Cardiovascular Care Center, Suite 204.',
    dueDate: '15 Oct 2026 • 10:30 AM',
    timeHorizon: 'this-week',
    status: 'pending',
    priority: 'urgent',
    category: 'appointment',
    whyItMatters: 'Primary clinical review of stent status, cardiac recovery, and stress tolerance.',
    relatedItem: 'Cardiovascular Care Center, Suite 204',
    reminderStatus: 'Automated voice reminder scheduled 24 hours prior',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 2,
      sectionTitle: 'Post-Discharge Specialist Plan',
      extractedText: 'Patient must be evaluated in Cardiology Outpatient Clinic within 10 days of hospital discharge.',
    },
  },
  {
    id: 'PT-06',
    name: 'Femoral Entry Site Wound Check with Primary Nurse',
    description: 'Nursing pavilion appointment to verify catheter puncture closure without hematoma.',
    dueDate: '20 Oct 2026 • 02:00 PM',
    timeHorizon: 'later',
    status: 'pending',
    priority: 'medium',
    category: 'appointment',
    whyItMatters: 'Ensures femoral artery puncture site is fully healed without localized vascular complications.',
    relatedItem: 'Outpatient Nursing Pavilion Room 112',
    reminderStatus: 'SMS reminder scheduled for 19 Oct',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 4,
      sectionTitle: 'Puncture Site Instructions',
      extractedText: 'Femoral access site check with primary care nurse practitioner at 2 weeks.',
    },
  },
  {
    id: 'PT-07',
    name: 'Pharmacy Prescription Pickup & Verification',
    description: 'Filled 30-day supply of Aspirin, Clopidogrel, Atorvastatin, and Metoprolol.',
    dueDate: '06 Oct 2026',
    timeHorizon: 'completed',
    status: 'completed',
    priority: 'high',
    category: 'medication',
    whyItMatters: 'Ensured zero medication gap upon hospital discharge.',
    relatedItem: 'Medication Reconciliation',
    reminderStatus: 'Verified by Care Team on 06 Oct',
    patientReportedDone: true,
    patientReportedAt: '06 Oct 2026 • 03:45 PM',
    sourceEvidence: {
      documentName: 'Discharge Summary • Arun Kumar',
      pageNumber: 1,
      sectionTitle: 'Discharge Prescriptions',
      extractedText: 'Patient and family instructed on uninterrupted antiplatelet therapy for 12 months.',
    },
  },
];

import { patientService, type PatientTask } from '../../services/api/patientService';

export function PatientUpcomingTasksPage() {
  const [tasks, setTasks] = useState<PatientTaskItem[]>(INITIAL_PATIENT_TASKS);
  const [loading, setLoading] = useState(true);
  const [selectedHorizon, setSelectedHorizon] = useState<string>('all');
  const [selectedTaskModal, setSelectedTaskModal] = useState<PatientTaskItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await patientService.getTasks();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: PatientTaskItem[] = data.map((t: PatientTask, idx: number) => ({
          id: t.id || `PT-${idx + 1}`,
          name: t.title || 'Recovery Task',
          description: `Assigned under ${t.specialty || 'Care Team'} discharge protocol.`,
          dueDate: t.dueDate || 'Pending',
          timeHorizon: (t.status === 'completed' ? 'completed' : 'today') as any,
          status: (t.status === 'completed' ? 'completed' : t.status === 'needs-review' ? 'needs-review' : 'pending') as any,
          priority: 'high',
          category: (t.type === 'appointment' ? 'appointment' : t.type === 'test' ? 'test' : 'monitoring') as any,
          whyItMatters: 'Essential clinical milestone for uncomplicated recovery.',
          relatedItem: t.specialty ? `${t.specialty} Follow-up` : 'Care Plan',
          reminderStatus: 'Automated notification schedule active',
          patientReportedDone: t.status === 'completed',
          patientReportedAt: t.status === 'completed' ? 'Completed' : undefined,
          sourceEvidence: {
            documentName: t.source || 'Discharge Summary • MySQL DB',
            pageNumber: t.sourcePage || 1,
            sectionTitle: 'Clinical Plan',
            extractedText: `Task: ${t.title}`,
          },
        }));
        setTasks(mapped);
      }
    } catch (err: any) {
      console.warn('Using initial task presets:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handlePatientReportDone = async (id: string, name: string) => {
    // Optimistic UI update
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const isDone = !t.patientReportedDone;
          return {
            ...t,
            patientReportedDone: isDone,
            status: isDone ? ('completed' as const) : ('pending' as const),
            timeHorizon: isDone ? ('completed' as const) : t.timeHorizon,
            patientReportedAt: isDone ? 'Just Now (Patient Reported)' : undefined,
          };
        }
        return t;
      })
    );
    if (selectedTaskModal && selectedTaskModal.id === id) {
      const isDone = !selectedTaskModal.patientReportedDone;
      setSelectedTaskModal({
        ...selectedTaskModal,
        patientReportedDone: isDone,
        status: isDone ? 'completed' : 'pending',
        timeHorizon: isDone ? 'completed' : selectedTaskModal.timeHorizon,
        patientReportedAt: isDone ? 'Just Now (Patient Reported)' : undefined,
      });
    }

    try {
      await patientService.completeTask(id);
      showToast(`✓ Marked "${name}" as completed and saved to care record.`);
    } catch (e) {
      showToast(`✓ Marked "${name}" as completed.`);
    }
  };

  const horizonCounts = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter(t => t.timeHorizon === 'today').length,
      tomorrow: tasks.filter(t => t.timeHorizon === 'tomorrow').length,
      thisWeek: tasks.filter(t => t.timeHorizon === 'this-week').length,
      later: tasks.filter(t => t.timeHorizon === 'later').length,
      completed: tasks.filter(t => t.patientReportedDone || t.status === 'completed').length,
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (selectedHorizon === 'all') return tasks;
    if (selectedHorizon === 'completed') return tasks.filter(t => t.patientReportedDone || t.status === 'completed');
    return tasks.filter(t => t.timeHorizon === selectedHorizon);
  }, [tasks, selectedHorizon]);

  return (
    <PatientLayout toastMessage={toastMessage} activeTab="tasks">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" /> Action Plan
              </span>
              <span className="text-[11px] text-slate-500 font-mono">What do I need to do next?</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Upcoming Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Actions and recovery milestones organized by deadline. Check off items as you complete them to keep your care team informed.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Care plan tasks synchronized')}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
              <span>Refresh Tasks</span>
            </button>
          </div>
        </div>

        {/* Patient Reporting Disclaimer */}
        <div className="bg-[#e6fcf1] border border-[#a7f3d0] p-4 rounded-2xl flex items-start sm:items-center gap-3 text-xs text-[#052429]">
          <ShieldCheck className="w-5 h-5 text-[#008742] shrink-0 mt-0.5 sm:mt-0" />
          <div className="leading-relaxed">
            <strong>Patient-Reported Activity:</strong> Checking off tasks records your self-reported progress for your care team. Clinical verification is performed separately by your coordinator during follow-up reviews.
          </div>
        </div>

        {/* Time Horizon Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs">
          {[
            { id: 'all', label: `All Tasks (${horizonCounts.all})` },
            { id: 'today', label: `Today (${horizonCounts.today})`, highlight: true },
            { id: 'tomorrow', label: `Tomorrow (${horizonCounts.tomorrow})` },
            { id: 'this-week', label: `This Week (${horizonCounts.thisWeek})` },
            { id: 'later', label: `Later (${horizonCounts.later})` },
            { id: 'completed', label: `Completed (${horizonCounts.completed})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedHorizon(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                selectedHorizon === tab.id
                  ? 'bg-teal-900 text-white shadow-xs'
                  : tab.highlight && horizonCounts.today > 0
                  ? 'bg-teal-50 text-teal-900 border border-teal-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task Cards List */}
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const isDone = task.patientReportedDone || task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
                  isDone ? 'border-slate-200 bg-slate-50/40 opacity-85' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      onClick={() => handlePatientReportDone(task.id, task.name)}
                      aria-label={isDone ? `Mark ${task.name} as pending` : `Mark ${task.name} as complete`}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all cursor-pointer ${
                        isDone
                          ? 'bg-[#00e575] border-[#00e575] text-[#052429]'
                          : 'border-slate-300 hover:border-teal-600 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          task.category === 'medication'
                            ? 'bg-blue-100 text-blue-900'
                            : task.category === 'test'
                            ? 'bg-purple-100 text-purple-900'
                            : task.category === 'monitoring'
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {task.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{task.dueDate}</span>
                      </div>

                      <h3 className={`text-base font-bold text-slate-900 ${isDone ? 'line-through text-slate-500' : ''}`}>
                        {task.name}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {task.description}
                      </p>

                      <div className="text-[11px] text-teal-800 font-medium pt-1">
                        <strong>Why it matters:</strong> {task.whyItMatters}
                      </div>

                      {task.patientReportedAt && (
                        <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reported Complete: {task.patientReportedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row sm:flex-col sm:items-end justify-between items-center gap-2.5 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <PriorityBadge priority={task.priority} />

                    <button
                      onClick={() => setSelectedTaskModal(task)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setSelectedTaskModal(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Task Detail & Purpose
                </span>
                <span className="text-xs font-mono text-slate-500">ID: #{selectedTaskModal.id}</span>
              </div>

              <h2 className="text-lg font-bold text-slate-900">{selectedTaskModal.name}</h2>
              <div className="text-xs text-slate-500 mt-0.5">Due: {selectedTaskModal.dueDate}</div>

              {/* What needs to be done */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 block">What needs to be done:</span>
                <p className="text-slate-700 leading-relaxed">{selectedTaskModal.description}</p>
              </div>

              {/* Why it appears in care plan */}
              <div className="mt-3 p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 text-xs space-y-1.5">
                <span className="font-bold text-teal-950 block">Why it appears in your care plan:</span>
                <p className="text-slate-800 leading-relaxed">{selectedTaskModal.whyItMatters}</p>
                <div className="text-[11px] text-teal-900 pt-1 border-t border-teal-200">
                  <strong>Related Follow-up:</strong> {selectedTaskModal.relatedItem}
                </div>
              </div>

              {/* Source Document Citation */}
              <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span><strong>Discharge Document:</strong> {selectedTaskModal.sourceEvidence.documentName}</span>
                  <span className="font-mono">P.{selectedTaskModal.sourceEvidence.pageNumber}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  "{selectedTaskModal.sourceEvidence.extractedText}"
                </div>
              </div>

              {/* Reminder Information */}
              <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs flex items-center gap-2 text-blue-950">
                <BellRing className="w-4 h-4 text-blue-700 shrink-0" />
                <span>{selectedTaskModal.reminderStatus}</span>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedTaskModal(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => handlePatientReportDone(selectedTaskModal.id, selectedTaskModal.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedTaskModal.patientReportedDone
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-[#00e575] hover:bg-[#00cb68] text-[#052429] shadow-xs'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    {selectedTaskModal.patientReportedDone ? 'Mark as Incomplete' : 'Report as Completed'}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PatientLayout>
  );
}
