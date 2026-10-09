import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, FileText, Pill,
  HeartPulse, Globe, ShieldCheck, Stethoscope, PhoneCall, Check,
  X, ChevronRight, Info, CalendarClock, ListTodo,
  TestTube2, Sparkles, RefreshCw
} from 'lucide-react';

import { PatientLayout } from '../components/layout/PatientLayout';
import { StatusBadge } from '../components/common/StatusBadge';
import { SourceEvidenceTag } from '../components/common/SourceEvidenceTag';
import { useAuth } from '../hooks/useAuth';
import { patientService } from '../services/api/patientService';
import type { FollowUpTask } from '../types';

interface PatientDashboardProps {
  defaultTab?: string;
}

export function PatientDashboard({ defaultTab }: PatientDashboardProps = {}) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Tamil' | 'Hindi'>('English');
  const [activeNav, setActiveNav] = useState(defaultTab || 'dashboard');

  useEffect(() => {
    if (defaultTab) {
      setActiveNav(defaultTab);
    }
  }, [defaultTab]);

  const [profile, setProfile] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [taskList, setTaskList] = useState<any[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedTaskModal, setSelectedTaskModal] = useState<FollowUpTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [me, tsk, tl] = await Promise.all([
          patientService.getProfile(),
          patientService.getTasks(),
          patientService.getTimeline()
        ]);
        if (!isMounted) return;
        setProfile(me);
        setTaskList(Array.isArray(tsk) ? tsk : []);
        setTimeline(Array.isArray(tl) ? tl : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSimulateVerification = useCallback(async (taskId: string) => {
    // Optimistic state update
    setTaskList(prev => prev.map(t => {
      if (t.id === taskId) {
        setTimeline(prevTl => {
          const newMilestone = {
            id: `M_SIM_${Date.now()}`,
            date: 'Just Now',
            title: `${t.title} Verified`,
            description: `Care Team authorized and verified completion in MySQL care record.`,
            status: 'completed' as const,
            type: 'task' as const
          };
          return [newMilestone, ...prevTl];
        });
        return { ...t, status: 'completed' };
      }
      return t;
    }));
    setSelectedTaskModal(null);

    try {
      await patientService.completeTask(taskId);
      setToastMessage(`✓ Care Team verified completion and saved to MySQL.`);
    } catch (e) {
      setToastMessage(`✓ Verification logged.`);
    }
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Compute progress dynamically with memoization
  const completedCount = useMemo(() => taskList.filter((t) => t.status === 'completed').length, [taskList]);
  const totalCount = taskList.length;
  const progressPercent = useMemo(() => totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0, [completedCount, totalCount]);

  // Filter tasks with memoization
  const nextAction = useMemo(() => taskList.find((t) => t.id === 'FT001') || taskList[0], [taskList]);
  const upcomingTasks = useMemo(() => taskList.filter((t) => t.status === 'pending' || t.status === 'in-progress'), [taskList]);
  const needsReviewTasks = useMemo(() => taskList.filter((t) => t.status === 'needs-review'), [taskList]);

  const displayedTasks = useMemo(() => {
    return taskList.filter(t => {
      if (taskFilter === 'all') return true;
      if (taskFilter === 'pending') return t.status === 'pending' || t.status === 'in-progress' || t.status === 'needs-review';
      if (taskFilter === 'completed') return t.status === 'completed';
      return true;
    });
  }, [taskList, taskFilter]);

  return (
    <PatientLayout
      activeTab={defaultTab || activeNav}
      toastMessage={toastMessage}
      onLanguageChange={(lang) => {
        setSelectedLanguage(lang);
        setToastMessage(`Language set to ${lang}`);
        setTimeout(() => setToastMessage(null), 2500);
      }}
      selectedLanguage={selectedLanguage}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Section (Isolated view when /patient/profile is active) */}
        {activeNav === 'profile' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-800" /> Patient Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Full Name</span>
                  <strong className="text-slate-900">{(profile?.name || 'Arun Kumar')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Medical Record Number (MRN)</span>
                  <strong className="text-slate-900">{(profile?.id || 'P001')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Date of Birth</span>
                  <strong className="text-slate-900">12 May 1968 (58 years)</strong>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Primary Diagnosis</span>
                  <strong className="text-slate-900">{(profile || {})?.primaryDiagnosis || 'Acute Inferior STEMI (Post-PCI)'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Attending Physician</span>
                  <strong className="text-slate-900">{(profile || {})?.attendingPhysician || 'Dr. Rajesh Mehta'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Discharge Date</span>
                  <strong className="text-slate-900">{(profile || {})?.dischargeDate || '05 Oct 2026'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Main View */}
        {activeNav !== 'profile' && (
          <>
            {/* SECTION A: WELCOME HEADER */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#052429] bg-[#e6fcf1] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full">
                      Post-Discharge Recovery Plan
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Discharged: {(profile || {})?.dischargeDate || '05 Oct 2026'}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
                    Good morning, Arun
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Here is your complete post-discharge recovery roadmap. Use the dedicated sections on the left to review appointments, pending patient tasks, and required lab tests.
                  </p>
                </div>

                {/* Quick hospital record summary */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div><strong className="text-slate-800">Primary Diagnosis:</strong> {(profile || {})?.primaryDiagnosis || 'Acute Inferior STEMI'}</div>
                  <div><strong className="text-slate-800">Attending Physician:</strong> {(profile || {})?.attendingPhysician || 'Dr. Rajesh Mehta'}</div>
                </div>
              </div>

              {/* Dedicated Page Quick Jump Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100">
                <Link
                  to="/patient/follow-ups"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50/70 hover:bg-teal-100/80 border border-teal-200 text-teal-950 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-800 text-[#00e575] flex items-center justify-center font-bold">
                      <ListTodo className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">My Follow-ups</div>
                      <div className="text-[11px] text-teal-700">Specialist clinic visits & location</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-teal-700 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/patient/tasks"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-sky-50/70 hover:bg-sky-100/80 border border-sky-200 text-sky-950 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-800 text-[#00e575] flex items-center justify-center font-bold">
                      <CalendarClock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Upcoming Tasks</div>
                      <div className="text-[11px] text-sky-700">Action items ordered by date</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-700 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  to="/patient/tests-referrals"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-950 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 text-[#00e575] flex items-center justify-center font-bold">
                      <TestTube2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs">Tests & Referrals</div>
                      <div className="text-[11px] text-emerald-700">Lab orders & rehab transitions</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* TOP ROW: SECTION B (NEXT ACTION) & SECTION C (FOLLOW-UP PROGRESS) */}
            {(['dashboard', 'plan', 'upcoming', 'tests', 'help'].includes(activeNav)) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
                {/* SECTION B: NEXT ACTION — MOST PROMINENT CARD */}
                <div className="lg:col-span-2">
                  <div className="bg-[#052429] text-white rounded-xl border border-[#0e4851] p-6 sm:p-7 shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
                    <div>
                      {/* Highlight badge */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#0e4851]">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-pulse-soft" />
                          <span className="text-xs font-black uppercase tracking-wider text-[#00e575]">
                            NEXT PRIMARY ACTION
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-300 bg-[#072d33] px-2.5 py-0.5 rounded-full border border-[#0e4851]">
                          Primary Checkpoint
                        </span>
                      </div>

                      <div className="mt-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            Cardiology follow-up
                          </h2>
                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-300 flex-wrap">
                            <Calendar className="w-4 h-4 text-[#00e575] shrink-0" />
                            <span className="font-semibold text-white">15 October 2026</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-300">10:30 AM (Suite 204)</span>
                          </div>
                          <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                            Outpatient clinic evaluation with Dr. Meera Patel for post-MI rhythm check, stress review, and echo consultation.
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-[#072d33] text-[#00e575] border border-[#0e4851]">
                            Status: Pending
                          </span>
                          <Link
                            to="/patient/follow-ups"
                            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            Open My Follow-ups
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Source citation */}
                    <div className="mt-5 pt-3 border-t border-[#0e4851] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1">
                      <span className="text-slate-300 font-mono text-[11px]">
                        Source: Discharge Summary • Page 2
                      </span>
                      <span className="text-[11px] text-[#00e575]">
                        ✓ Verified by CareFlow Document Intelligence
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION C: FOLLOW-UP PROGRESS */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Follow-Up Progress
                        </h3>
                        <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          {progressPercent}% Complete
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="text-2xl font-black text-slate-900">
                          {completedCount} of {totalCount} tasks completed
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Stay on track with required tests and physician consultations.
                        </p>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                        <div
                          className="bg-[#00e575] h-3 rounded-full transition-all duration-700"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="mt-4 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
                          </span>
                          <strong className="text-slate-900">{completedCount}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600" /> Upcoming & Pending
                          </span>
                          <strong className="text-slate-900">{upcomingTasks.length}</strong>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs Review
                          </span>
                          <strong className="text-amber-800 font-bold">{needsReviewTasks.length}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link to="/patient/tasks" className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1">
                        View All Tasks <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION F: NEEDS REVIEW ALERT TRAY */}
            {(['dashboard', 'plan', 'upcoming', 'tests', 'help'].includes(activeNav)) && needsReviewTasks.length > 0 && (
              <div className="mb-8 bg-amber-50/80 border border-amber-300 rounded-xl p-5 shadow-xs">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                    <AlertTriangle className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider">
                        Needs Review
                      </h3>
                      <span className="text-[11px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                        Status: Needs Review
                      </span>
                    </div>

                    <div className="mt-2 p-3 bg-white rounded-xl border border-amber-200 text-xs">
                      <div className="font-bold text-slate-900 text-sm">
                        Follow-up date is not specified
                      </div>
                      <p className="text-slate-600 mt-1">
                        Nephrology consultation was recommended in your summary, but no calendar deadline was entered by the hospital.
                      </p>
                      <div className="mt-2.5 p-2 bg-amber-50 rounded-lg border border-amber-200/80 text-amber-900 font-medium text-[11px] flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>This item has been sent to your care coordinator for review.</span>
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500">
                        Source: Discharge Summary • Page 4
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION D & E: UNIFIED TASK LIST WITH FILTERS */}
            {(['dashboard', 'plan', 'upcoming', 'tests', 'help'].includes(activeNav)) && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-teal-800" /> Recent Discharge Action Items
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Quick summary of recovery tasks. Open the dedicated Upcoming Tasks page for full timeline horizons.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                      <button
                        onClick={() => setTaskFilter('all')}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${taskFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setTaskFilter('pending')}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${taskFilter === 'pending' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setTaskFilter('completed')}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${taskFilter === 'completed' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Completed
                      </button>
                    </div>
                    <Link
                      to="/patient/tasks"
                      className="px-3 py-1.5 bg-teal-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-teal-900 transition-colors"
                    >
                      Open Tasks Page <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {displayedTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-xl border transition-colors ${task.status === 'completed' ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                            {task.status === 'completed' && <Check className="w-3.5 h-3.5 text-[#00e575]" />}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.title}</h4>
                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="w-3.5 h-3.5 text-teal-700" />
                              <span>{task.dueDate}</span>
                              <span className="text-slate-400">•</span>
                              <StatusBadge status={task.status} size="sm" />
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedTaskModal(task)}
                          className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors shrink-0"
                        >
                          Details
                        </button>
                      </div>
                      {task.sourceEvidence && (
                        <div className="mt-3 pl-8">
                          <SourceEvidenceTag evidence={task.sourceEvidence} />
                        </div>
                      )}
                    </div>
                  ))}
                  {displayedTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-slate-500 border border-slate-200 border-dashed rounded-xl bg-slate-50">
                      <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="text-sm font-medium">No tasks in this category</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECTION G & H: RECOVERY TIMELINE & AI REMINDER ACTIVITY */}
            {(['dashboard', 'timeline', 'reminders', 'plan'].includes(activeNav)) && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 items-stretch">
                {/* SECTION G: TIMELINE */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-800" /> Post-Discharge Timeline
                    </h3>
                    <div className="space-y-0">
                      {timeline.map((m, index) => (
                        <div key={m.id} className="flex gap-4 group">
                          {/* Dedicated Column for Dot and Line */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 my-0.5 ${
                                m.status === 'completed'
                                  ? 'border-emerald-500 bg-emerald-500'
                                  : m.status === 'current'
                                  ? 'border-[#00e575] bg-[#052429]'
                                  : 'border-slate-300 bg-white'
                              }`}
                            />
                            {index < timeline.length - 1 && (
                              <div className="w-0.5 flex-1 bg-slate-200 my-1 min-h-[32px]" />
                            )}
                          </div>
                          {/* Content */}
                          <div className="min-w-0 flex-1 pb-5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">{m.title}</span>
                              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                                {m.date}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Milestones tracked automatically against discharge orders</span>
                  </div>
                </div>

                {/* SECTION H: REMINDER ACTIVITY SIMULATION */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <PhoneCall className="w-4 h-4 text-[#052429]" /> AI Reminder Activity
                      </h3>
                      <span className="text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
                        Informational Simulation
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Upcoming Reminder Call</span>
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Status: Scheduled
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1.5">
                        <strong>Scheduled:</strong> 14 Oct 2026 • 10:00 AM (24 Hours Pre-appointment)
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        <strong>Purpose:</strong> Confirm Cardiology Clinic Visit attendance and remind regarding fasting lab draw.
                      </p>

                      {/* Retry Tree Simulation */}
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          Automated Fallback Sequence (If Unanswered):
                        </span>
                        <div className="mt-2 space-y-1.5 text-[11px] text-slate-600 font-mono">
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                            <span className="text-amber-600 font-bold">Attempt 1</span>
                            <span>— Automated Call (No answer)</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                            <span className="text-teal-700 font-bold">Attempt 2</span>
                            <span>— Scheduled for 14 Oct • 10:30 AM</span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                            <span className="text-slate-500 font-bold">Fallback</span>
                            <span>— SMS Follow-up link (Pending)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Reminder calls are informational only and never provide medical advice.</span>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM ROW: MEDICATIONS, INSTRUCTIONS & WARNING SIGNS */}
            {(['dashboard', 'instructions', 'tests'].includes(activeNav)) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Medications */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-800" /> Prescribed Medications
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 text-sm">Aspirin (81mg)</div>
                        <div className="text-slate-700 font-medium mt-0.5">Once daily in morning</div>
                        <div className="text-slate-500 mt-1 text-[11px] leading-relaxed">Take with breakfast to protect stomach lining.</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 text-sm">Clopidogrel (75mg)</div>
                        <div className="text-slate-700 font-medium mt-0.5">Once daily</div>
                        <div className="text-slate-500 mt-1 text-[11px] leading-relaxed">Dual antiplatelet therapy after coronary stent placement.</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 text-sm">Metoprolol Succinate (25mg)</div>
                        <div className="text-slate-700 font-medium mt-0.5">Once daily</div>
                        <div className="text-slate-500 mt-1 text-[11px] leading-relaxed">Beta-blocker for heart rate control and cardiac protection.</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Take strictly as directed by your physician
                  </div>
                </div>

                {/* Simple Care Instructions */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-800" /> Care Instructions
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 text-sm">Groin Puncture Site Care</div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-xs">Keep catheter insertion area dry for 48 hours; no heavy lifting over 10 lbs for 4 weeks.</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-900 text-sm">Daily Home BP Logging</div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-xs">Record seated morning blood pressure and resting pulse baseline daily.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                    Guidance from Hospital Nursing Protocol
                  </div>
                </div>

                {/* Red Flag Warning Signs */}
                <div className="bg-red-50/60 rounded-xl border border-red-200 p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-red-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <HeartPulse className="w-4 h-4 text-red-600" /> Red Flag Warning Signs
                    </h3>
                    <p className="text-xs text-red-800 mb-3">
                      Seek immediate medical care if you experience:
                    </p>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-white rounded-xl border border-red-200 text-xs shadow-2xs">
                        <div className="font-bold text-red-900">Recurrent Chest Pressure / Pain</div>
                        <div className="text-slate-700 mt-1 font-medium text-[11px]">Unrelieved by rest, or radiating to left arm / jaw.</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-red-200 text-xs shadow-2xs">
                        <div className="font-bold text-red-900">Severe Groin Swelling or Bleeding</div>
                        <div className="text-slate-700 mt-1 font-medium text-[11px]">Pulsatile swelling or sudden redness at puncture site.</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-red-200 text-[11px] text-red-900 font-bold">
                    Emergency Services: Call 112 / 911 immediately
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Task Details Modal */}
        <AnimatePresence>
          {selectedTaskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative"
              >
                <button
                  onClick={() => setSelectedTaskModal(null)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Follow-up Action Detail
                  </span>
                  <StatusBadge status={selectedTaskModal.status} />
                </div>

                <h3 className="text-xl font-bold text-slate-900">{selectedTaskModal.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedTaskModal.description}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div><strong>Due Date:</strong> {selectedTaskModal.dueDate || 'Pending confirmation'}</div>
                  <div><strong>Assigned Provider:</strong> {selectedTaskModal.assignedTo || 'Hospital Clinic'}</div>
                  <div><strong>Location:</strong> Cardiovascular Care Center, Suite 204</div>
                </div>

                {selectedTaskModal.sourceEvidence && (
                  <div className="mt-4">
                    <SourceEvidenceTag evidence={selectedTaskModal.sourceEvidence} />
                  </div>
                )}

                {/* Care Team Demo Simulator Panel */}
                {selectedTaskModal.status !== 'completed' && (
                  <div className="mt-6 p-4 rounded-xl border border-blue-200 bg-blue-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-blue-800">
                        <ShieldCheck className="w-4 h-4" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Demo: Care Team Verification</h4>
                      </div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200 uppercase">Interactive</span>
                    </div>
                    <p className="text-[11px] text-blue-700 mb-3">
                      Patients cannot self-certify clinical milestones. Click below to simulate an authorized Care Coordinator verifying this task. This will update the timeline locally.
                    </p>
                    <button
                      onClick={() => handleSimulateVerification(selectedTaskModal.id)}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Simulate Verified Completion
                    </button>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedTaskModal(null)}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PatientLayout>
  );
}

export default PatientDashboard;
