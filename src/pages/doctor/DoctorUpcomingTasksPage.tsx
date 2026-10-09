import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarClock, Search, Filter, AlertTriangle, CheckCircle2, Clock,
  Calendar, User, ArrowUpRight, Check, X, ShieldCheck,
  FileText, ChevronRight, Sparkles, RefreshCw, GitBranch,
  HeartPulse, Pill, Stethoscope, AlertOctagon, CheckSquare, PhoneCall, Building2
} from 'lucide-react';
import { DoctorLayout } from '../../components/layout/DoctorLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { doctorService } from '../../services/api/doctorService';
import { demoPatients } from '../../data/demoData';

export interface DoctorTaskItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  patientAge: number;
  title: string;
  description: string;
  category: 'appointment' | 'test' | 'medication' | 'monitoring' | 'review' | 'referral';
  timeHorizon: 'today' | 'tomorrow' | 'this-week' | 'next-7-days' | 'overdue';
  dueDate: string;
  dueTime?: string;
  priority: 'urgent' | 'high' | 'medium' | 'routine';
  status: 'pending' | 'in-progress' | 'completed' | 'needs-review' | 'overdue';
  assignedRole: string;
  assignedTo: string;
  relatedFollowUp: string;
  dependencyNote?: string;
  source: string;
  sourceText: string;
  notes?: string;
  completedAt?: string;
}

const INITIAL_DOCTOR_TASKS: DoctorTaskItem[] = [
  {
    id: 'TSK-101',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    patientAge: 58,
    title: 'Review discharge medication acknowledgement & aspirin adherence',
    description: 'Verify patient confirmed dual-antiplatelet schedule (Aspirin 81mg + Clopidogrel 75mg) without gastrointestinal complaints.',
    category: 'medication',
    timeHorizon: 'today',
    dueDate: 'Today (09 Oct 2026)',
    dueTime: '02:00 PM',
    priority: 'high',
    status: 'pending',
    assignedRole: 'Clinical Pharmacist / Coordinator',
    assignedTo: 'Dr. Meera Patel',
    relatedFollowUp: 'Cardiology Specialist Follow-up (15 Oct)',
    dependencyNote: 'Required baseline before cardiology stress test clearance.',
    source: 'Discharge Summary • Arun Kumar (Page 1)',
    sourceText: 'Patient and family instructed on uninterrupted antiplatelet therapy for 12 months.',
  },
  {
    id: 'TSK-102',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    mrn: 'MRN-7740L',
    patientAge: 73,
    title: 'Resolve conflicting weight-bearing physical therapy orders',
    description: 'Surgeon note specifies non-weight bearing 4w; rehab notes mention partial weight bearing. Clarify with Dr. Desai before home PT begins.',
    category: 'review',
    timeHorizon: 'today',
    dueDate: 'Today (09 Oct 2026)',
    dueTime: '04:30 PM',
    priority: 'urgent',
    status: 'needs-review',
    assignedRole: 'Care Coordinator',
    assignedTo: 'Dr. Ananya Desai',
    relatedFollowUp: 'Orthopedic Surgical Review (14 Oct)',
    dependencyNote: 'Home health PT agency on standby pending directive clarification.',
    source: 'Discharge Summary • Lakshmi Venkatesh (Page 3)',
    sourceText: 'Discharge order: strict non-weight bearing x 4 weeks. PT note: partial weight bearing with walker.',
  },
  {
    id: 'TSK-103',
    patientId: 'P004',
    patientName: 'Ravi Kumar',
    mrn: 'MRN-5512R',
    patientAge: 63,
    title: 'Outreach to patient for missed 7-day heart failure clinic appointment',
    description: 'Patient missed 07 Oct appointment slot; initiate priority phone call and dispatch SMS fallback coordinator schedule.',
    category: 'appointment',
    timeHorizon: 'overdue',
    dueDate: 'Overdue (07 Oct 2026)',
    priority: 'urgent',
    status: 'overdue',
    assignedRole: 'Outreach Coordinator',
    assignedTo: 'Dr. Meera Patel',
    relatedFollowUp: 'Heart Failure Outpatient Clinic',
    dependencyNote: 'Overdue follow-up creates care-gap alert in HMS.',
    source: 'Discharge Summary • Ravi Kumar (Page 2)',
    sourceText: 'Mandatory outpatient clinic visit within 7 days post-discharge due to congestive history.',
  },
  {
    id: 'TSK-104',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    patientAge: 58,
    title: 'Verify Fasting Lipid & Renal Panel lab booking',
    description: 'Ensure outpatient diagnostic laboratory has confirmed Arun Kumar appointment for venipuncture prior to cardiology visit.',
    category: 'test',
    timeHorizon: 'tomorrow',
    dueDate: 'Tomorrow (10 Oct 2026)',
    dueTime: '09:00 AM',
    priority: 'high',
    status: 'pending',
    assignedRole: 'Lab Coordinator',
    assignedTo: 'Dr. Meera Patel',
    relatedFollowUp: 'Cardiology Specialist Follow-up (15 Oct)',
    dependencyNote: 'Blood panel results are mandatory precondition for clinic appointment.',
    source: 'Discharge Summary • Arun Kumar (Page 3)',
    sourceText: 'Repeat serum creatinine, electrolytes, and lipid panel at 14 days post-discharge.',
  },
  {
    id: 'TSK-105',
    patientId: 'P002',
    patientName: 'Priya Sharma',
    mrn: 'MRN-3389P',
    patientAge: 42,
    title: 'Review 7-day home blood glucose curve telemetry',
    description: 'Assess morning fasting values to ensure no recurring readings under 70 mg/dL following insulin glargine down-titration.',
    category: 'monitoring',
    timeHorizon: 'this-week',
    dueDate: '12 Oct 2026',
    priority: 'medium',
    status: 'pending',
    assignedRole: 'Endocrinology Coordinator',
    assignedTo: 'Dr. Rajesh Iyer',
    relatedFollowUp: 'Endocrinology & Glycemic Management (18 Oct)',
    source: 'Discharge Summary • Priya Sharma (Page 2)',
    sourceText: 'Repeat blood glucose fasting curve by October 18 with outpatient endocrinologist.',
  },
  {
    id: 'TSK-106',
    patientId: 'P005',
    patientName: 'Lakshmi Venkatesh',
    mrn: 'MRN-7740L',
    patientAge: 73,
    title: 'Confirm Bilateral Hip & Pelvis X-Ray appointment slot',
    description: 'Radiology imaging booking verification at City General Imaging Center ahead of 14 Oct orthopedics evaluation.',
    category: 'test',
    timeHorizon: 'this-week',
    dueDate: '13 Oct 2026',
    priority: 'high',
    status: 'pending',
    assignedRole: 'Radiology Coordinator',
    assignedTo: 'Dr. Ananya Desai',
    relatedFollowUp: 'Orthopedic Surgical Review (14 Oct)',
    dependencyNote: 'Radiology imaging series required before hardware evaluation.',
    source: 'Discharge Summary • Lakshmi Venkatesh (Page 3)',
    sourceText: 'Repeat pelvis & hip AP/lateral view prior to post-op 2-week visit.',
  },
  {
    id: 'TSK-107',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    patientAge: 58,
    title: 'Trigger automated 24-hour pre-appointment reminder call',
    description: 'Dispatch CareFlow 30-sec conversational AI reminder for 15 Oct 10:30 AM Cardiology appointment at Suite 204.',
    category: 'appointment',
    timeHorizon: 'next-7-days',
    dueDate: '14 Oct 2026',
    dueTime: '10:00 AM',
    priority: 'medium',
    status: 'pending',
    assignedRole: 'AI Reminder Engine',
    assignedTo: 'CareFlow Automated System',
    relatedFollowUp: 'Cardiology Specialist Follow-up (15 Oct)',
    source: 'CareFlow Automated Coordination Schedule',
    sourceText: 'Automated notification scheduled 24 hours in advance of specialist visit.',
  },
  {
    id: 'TSK-108',
    patientId: 'P003',
    patientName: 'Rahul Kumar',
    mrn: 'MRN-8812R',
    patientAge: 49,
    title: 'Post-Surgical wound inspection reminder & symptom survey',
    description: 'Send electronic recovery check survey to verify no purulent drainage, fever, or worsening abdominal pain.',
    category: 'monitoring',
    timeHorizon: 'next-7-days',
    dueDate: '16 Oct 2026',
    priority: 'routine',
    status: 'pending',
    assignedRole: 'Surgical Care Nurse',
    assignedTo: 'Dr. Ananya Desai',
    relatedFollowUp: 'Post-Surgical Wound & Incision Review (22 Oct)',
    source: 'Discharge Summary • Rahul Kumar (Page 1)',
    sourceText: 'Monitor port incisions; report fever > 100.4 F or erythema immediately.',
  },
  {
    id: 'TSK-109',
    patientId: 'P001',
    patientName: 'Arun Kumar',
    mrn: 'MRN-9281C',
    patientAge: 58,
    title: 'Discharge baseline vitals verified (BP 122/78 mmHg, HR 68 bpm)',
    description: 'Logged and verified patient portal telemetry submission following first morning at home.',
    category: 'monitoring',
    timeHorizon: 'today',
    dueDate: '07 Oct 2026',
    priority: 'medium',
    status: 'completed',
    assignedRole: 'Care Coordinator',
    assignedTo: 'Dr. Meera Patel',
    relatedFollowUp: 'Cardiology Specialist Follow-up (15 Oct)',
    source: 'Discharge Summary • Arun Kumar (Page 3)',
    sourceText: 'Record daily AM blood pressure; alert clinic if systolic drops below 100.',
    completedAt: '07 Oct 2026 • 11:15 AM',
  },
];

export function DoctorUpcomingTasksPage() {
  const [tasks, setTasks] = useState<DoctorTaskItem[]>(INITIAL_DOCTOR_TASKS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [horizonFilter, setHorizonFilter] = useState<'all' | 'today' | 'tomorrow' | 'this-week' | 'next-7-days' | 'overdue'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'appointment' | 'test' | 'medication' | 'monitoring' | 'review'>('all');
  const [patientFilter, setPatientFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<DoctorTaskItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const dbTasks = await doctorService.getTasks();
        if (isMounted && Array.isArray(dbTasks) && dbTasks.length > 0) {
          const mapped: DoctorTaskItem[] = dbTasks.map((t: any) => ({
            id: t.id,
            patientId: t.patientId || 'P001',
            patientName: t.patientName || 'Patient',
            mrn: t.patientId || 'MRN-9281C',
            patientAge: 58,
            title: t.title,
            description: `Scheduled care action item: ${t.title}`,
            category: (t.taskType || 'appointment') as any,
            timeHorizon: t.daysOverdue > 0 ? 'overdue' : 'this-week',
            dueDate: t.dueDate,
            priority: 'high',
            status: t.status as any,
            assignedRole: 'Care Coordinator',
            assignedTo: t.attending || 'Dr. Meera Patel',
            relatedFollowUp: t.specialty || 'General Follow-up',
            source: t.source || 'Care Plan',
            sourceText: t.title
          }));
          setTasks(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch doctor tasks:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Compute horizon stats
  const horizonStats = useMemo(() => {
    return {
      all: tasks.length,
      today: tasks.filter(t => t.timeHorizon === 'today').length,
      tomorrow: tasks.filter(t => t.timeHorizon === 'tomorrow').length,
      thisWeek: tasks.filter(t => t.timeHorizon === 'this-week').length,
      next7Days: tasks.filter(t => t.timeHorizon === 'next-7-days').length,
      overdue: tasks.filter(t => t.timeHorizon === 'overdue' || t.status === 'overdue').length,
    };
  }, [tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return tasks.filter(t => {
      const matchSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.patientName.toLowerCase().includes(q) ||
        t.mrn.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.relatedFollowUp.toLowerCase().includes(q);

      const matchHorizon = horizonFilter === 'all' || t.timeHorizon === horizonFilter;
      const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchPatient = patientFilter === 'all' || t.patientId === patientFilter;

      return matchSearch && matchHorizon && matchCategory && matchPatient;
    });
  }, [tasks, searchQuery, horizonFilter, categoryFilter, patientFilter]);

  const handleCompleteTask = async (id: string, title: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: 'completed' as const, completedAt: 'Just Now' } : t
      )
    );
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(prev => prev ? { ...prev, status: 'completed' as const, completedAt: 'Just Now' } : null);
    }
    try {
      await doctorService.updateTaskStatus(id, 'completed');
      showToast(`✓ Task "${title}" verified and persisted in MySQL database`);
    } catch {
      showToast(`Task "${title}" marked as verified locally`);
    }
  };

  const handleResolveReview = async (id: string, title: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: 'pending' as const } : t
      )
    );
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask(prev => prev ? { ...prev, status: 'pending' as const } : null);
    }
    try {
      await doctorService.updateTaskStatus(id, 'pending');
      showToast(`✓ Discrepancy resolved in MySQL database for: "${title}"`);
    } catch {
      showToast(`Instruction discrepancy resolved for task: "${title}"`);
    }
  };

  return (
    <DoctorLayout toastMessage={toastMessage} activeTab="tasks">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase tracking-wider flex items-center gap-1">
                <CalendarClock className="w-3.5 h-3.5" /> Care Task Timelines & Scheduling
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Horizon: Next 14 Days</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Upcoming Tasks
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Operational tasks organized by execution deadlines, coordinator responsibilities, and care plan dependencies.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Care task timeline recalculated')}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-700" />
              <span>Refresh Schedule</span>
            </button>
          </div>
        </div>

        {/* Time Horizon Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {[
            { id: 'all', label: 'All Tasks', count: horizonStats.all, desc: 'Complete queue' },
            { id: 'today', label: 'Today', count: horizonStats.today, desc: 'Immediate action', highlight: 'teal' },
            { id: 'tomorrow', label: 'Tomorrow', count: horizonStats.tomorrow, desc: 'Prep required' },
            { id: 'this-week', label: 'This Week', count: horizonStats.thisWeek, desc: 'Days 3–7' },
            { id: 'next-7-days', label: 'Next 7 Days', count: horizonStats.next7Days, desc: 'Days 8–14' },
            { id: 'overdue', label: 'Overdue', count: horizonStats.overdue, desc: 'Action required', alert: horizonStats.overdue > 0 },
          ].map(tab => {
            const isSelected = horizonFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setHorizonFilter(tab.id as any)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-teal-900 text-white border-teal-950 shadow-md ring-2 ring-teal-600/30'
                    : tab.alert
                    ? 'bg-red-50/70 border-red-200 hover:bg-red-50'
                    : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-teal-200' : tab.alert ? 'text-red-800' : 'text-slate-500'}`}>
                    {tab.label}
                  </span>
                  <span className={`text-base font-black ${isSelected ? 'text-[#00e575]' : tab.alert ? 'text-red-600' : 'text-slate-900'}`}>
                    {tab.count}
                  </span>
                </div>
                <span className={`text-[10px] mt-1 ${isSelected ? 'text-teal-100/70' : 'text-slate-400'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Category Filter */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks, patient names, MRN, or clinical instructions..."
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
                value={patientFilter}
                onChange={e => setPatientFilter(e.target.value)}
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
                aria-label="Filter by task category"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-teal-600 cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="medication">Medication Adherence</option>
                <option value="test">Diagnostics / Labs</option>
                <option value="appointment">Appointments</option>
                <option value="monitoring">Home Monitoring</option>
                <option value="review">Clinical Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* Task Cards Listing */}
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center text-slate-500 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">No tasks in this time horizon</p>
              <p className="text-xs text-slate-400 mt-1">Try switching tabs or resetting the search filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setHorizonFilter('all');
                  setCategoryFilter('all');
                  setPatientFilter('all');
                }}
                className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Show All Tasks
              </button>
            </div>
          ) : (
            filteredTasks.map(task => {
              const isOverdue = task.status === 'overdue';
              const isNeedsReview = task.status === 'needs-review';
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md ${
                    isOverdue
                      ? 'border-red-300 bg-red-50/10'
                      : isNeedsReview
                      ? 'border-amber-300 bg-amber-50/10'
                      : isCompleted
                      ? 'border-slate-200 opacity-80'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          task.category === 'medication'
                            ? 'bg-blue-100 text-blue-900'
                            : task.category === 'test'
                            ? 'bg-purple-100 text-purple-900'
                            : task.category === 'review'
                            ? 'bg-amber-100 text-amber-900'
                            : task.category === 'monitoring'
                            ? 'bg-teal-100 text-teal-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {task.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{task.patientName}</span>
                        <span className="text-xs font-mono text-teal-800 font-semibold bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                          {task.mrn}
                        </span>
                        <span className="text-xs text-slate-400">• Role: {task.assignedRole}</span>
                      </div>

                      <h3 className={`text-base font-bold text-slate-900 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-teal-700" />
                          <span>Linked Follow-up: <strong>{task.relatedFollowUp}</strong></span>
                        </span>
                        {task.dependencyNote && (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-medium border border-amber-200 text-[11px] flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-amber-600" />
                            {task.dependencyNote}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Action & Timing */}
                    <div className="flex flex-row lg:flex-col lg:items-end justify-between items-center gap-3 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <div className="flex items-center gap-1.5 justify-start lg:justify-end">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-bold text-xs text-slate-900">{task.dueDate}</span>
                        </div>
                        {task.dueTime && (
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">{task.dueTime}</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority === 'routine' ? 'low' : task.priority} />
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                        {!isCompleted && task.status !== 'needs-review' && (
                          <button
                            onClick={() => handleCompleteTask(task.id, task.title)}
                            className="px-3 py-1.5 bg-[#00e575] hover:bg-[#00cb68] text-[#052429] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Verify</span>
                          </button>
                        )}
                        {task.status === 'needs-review' && (
                          <button
                            onClick={() => handleResolveReview(task.id, task.title)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Resolve Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setSelectedTask(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                aria-label="Close task details modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                  Task Execution Specification
                </span>
                <span className="text-xs font-mono text-slate-500">ID: #{selectedTask.id}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{selectedTask.title}</h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                <span className="font-bold text-slate-900">{selectedTask.patientName}</span>
                <span>• MRN: {selectedTask.mrn}</span>
                <span>• Role: {selectedTask.assignedRole}</span>
              </div>

              {/* Timing Banner */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Due Timeframe</span>
                  <strong className="text-slate-900">{selectedTask.dueDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Assigned Provider</span>
                  <strong className="text-slate-900">{selectedTask.assignedTo}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Status</span>
                  <StatusBadge status={selectedTask.status} />
                </div>
              </div>

              {/* Rationale & Description */}
              <div className="mt-4 text-xs space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider block text-[11px]">Task Description & Operational Rationale</span>
                <p className="text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedTask.description}
                </p>
              </div>

              {/* Linked Follow-up & Dependency */}
              <div className="mt-4 p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 text-xs space-y-1.5">
                <div className="font-bold text-teal-950 flex items-center gap-1.5">
                  <GitBranch className="w-4 h-4 text-teal-700" />
                  <span>Linked Care Coordination Goal</span>
                </div>
                <div className="text-slate-800">
                  <strong>Specialist Follow-up:</strong> {selectedTask.relatedFollowUp}
                </div>
                {selectedTask.dependencyNote && (
                  <div className="text-slate-600 text-[11px]">
                    <strong>Workflow Precondition:</strong> {selectedTask.dependencyNote}
                  </div>
                )}
              </div>

              {/* Source Document Excerpt */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-700" /> Document Citation
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{selectedTask.source}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded border border-slate-200">
                  "{selectedTask.sourceText}"
                </div>
              </div>

              {/* Modal CTA */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
                {selectedTask.status === 'needs-review' && (
                  <button
                    onClick={() => handleResolveReview(selectedTask.id, selectedTask.title)}
                    className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    Approve Clinical Directive
                  </button>
                )}
                {selectedTask.status !== 'completed' && selectedTask.status !== 'needs-review' && (
                  <button
                    onClick={() => handleCompleteTask(selectedTask.id, selectedTask.title)}
                    className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify Completion
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
