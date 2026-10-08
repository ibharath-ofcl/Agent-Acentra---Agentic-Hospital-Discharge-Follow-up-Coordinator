import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Pill,
  HeartPulse,
  Globe,
  LogOut,
  ShieldCheck,
  Stethoscope,
  PhoneCall,
  Check,
  X,
  ChevronRight,
  Info,
} from 'lucide-react';
import {
  currentPatient,
  demoFollowUpTasks,
  demoMedications,
  demoCareInstructions,
  demoWarnings,
  demoTimelineMilestones,
  demoReminderSimulation,
} from '../data/demoData';
import { StatusBadge } from '../components/common/StatusBadge';
import { SourceEvidenceTag } from '../components/common/SourceEvidenceTag';
import { useAuth } from '../hooks/useAuth';
import type { FollowUpTask } from '../types';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Local state for interactive patient experience
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Tamil' | 'Hindi'>('English');
  const [activeNav, setActiveNav] = useState<'dashboard' | 'plan' | 'timeline' | 'reminders' | 'profile'>('dashboard');
  const [taskList, setTaskList] = useState<FollowUpTask[]>(demoFollowUpTasks);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [timeline, setTimeline] = useState(demoTimelineMilestones);
  const [selectedTaskModal, setSelectedTaskModal] = useState<FollowUpTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSimulateVerification = (taskId: string) => {
    setTaskList(prev => prev.map(t => {
      if (t.id === taskId) {
        setTimeline(prevTl => {
          const newMilestone = {
            id: `M_SIM_${Date.now()}`,
            date: 'Just Now',
            title: `${t.title} Verified`,
            description: `Care Team authorized and verified completion.`,
            status: 'completed' as const,
            type: 'task' as const
          };
          return [newMilestone, ...prevTl];
        });
        setToastMessage(`Care Team simulation verified "${t.title}". Timeline updated.`);
        setTimeout(() => setToastMessage(null), 4000);
        return { ...t, status: 'completed' };
      }
      return t;
    }));
    setSelectedTaskModal(null);
  };

  // Compute progress dynamically
  const completedCount = taskList.filter((t) => t.status === 'completed').length;
  const totalCount = taskList.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Filter tasks
  const nextAction = taskList.find((t) => t.id === 'FT001') || taskList[0];
  const upcomingTasks = taskList.filter((t) => t.status === 'pending' || t.status === 'in-progress');
  const needsReviewTasks = taskList.filter((t) => t.status === 'needs-review');
  
  const displayedTasks = taskList.filter(t => {
    if (taskFilter === 'all') return true;
    if (taskFilter === 'pending') return t.status === 'pending' || t.status === 'in-progress' || t.status === 'needs-review';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-4 z-50 bg-[#052429] border border-[#00e575] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Dark Teal Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#052429] text-white border-b border-[#0e4851] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
                  <Activity className="w-4.5 h-4.5 stroke-[2.5]" />
                </div>
                <span className="font-bold text-base tracking-tight hidden sm:inline text-white">
                  CareFlow <span className="text-[#00e575]">AI</span>
                </span>
              </Link>
              <span className="text-[11px] bg-[#0a383f] text-[#00e575] font-bold px-2.5 py-0.5 rounded-full border border-[#0e4851]">
                Patient Portal
              </span>
            </div>

            {/* Top Navigation Items */}
            <nav className="hidden md:flex items-center gap-1 text-xs">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'plan', label: 'My Follow-up Plan' },
                { id: 'timeline', label: 'Timeline' },
                { id: 'reminders', label: 'Reminders' },
                { id: 'profile', label: 'Profile' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeNav === item.id
                      ? 'bg-[#00e575] text-[#052429]'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Right Header Tools: Language & Profile */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-[#072d33] border border-[#0e4851] px-2.5 py-1.5 rounded-xl text-xs">
                <Globe className="w-3.5 h-3.5 text-[#00e575]" />
                <select
                  value={selectedLanguage}
                  aria-label="Select language"
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value as any);
                    setToastMessage(`Language updated to ${e.target.value}`);
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                  className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer font-medium"
                >
                  <option value="English" className="bg-[#052429] text-white">English</option>
                  <option value="Tamil" className="bg-[#052429] text-white">தமிழ் (Tamil)</option>
                  <option value="Hindi" className="bg-[#052429] text-white">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Patient Avatar */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#0e4851] text-xs">
                <div className="w-8 h-8 rounded-full bg-[#00e575] text-[#052429] font-black flex items-center justify-center text-xs">
                  AK
                </div>
                <div className="text-left text-white leading-tight">
                  <div className="font-bold text-xs">{currentPatient.name}</div>
                  <div className="text-[10px] text-slate-400">MRN: {currentPatient.id}</div>
                </div>
              </div>

              {/* Doctor view switch */}
              <Link
                to="/doctor"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors"
                title="Switch to Doctor Dashboard"
              >
                <Stethoscope className="w-3.5 h-3.5" /> Doctor View
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-[#072d33] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation (Scrollable) */}
      <div className="md:hidden bg-[#052429] border-b border-[#0e4851] overflow-x-auto hide-scrollbar sticky top-16 z-30">
        <div className="flex items-center px-4 py-2 gap-2 w-max">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'plan', label: 'My Follow-up Plan' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'reminders', label: 'Reminders' },
            { id: 'profile', label: 'Profile' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id as any)}
              className={`px-3 py-1.5 text-xs rounded-full font-semibold transition-colors ${
                activeNav === item.id
                  ? 'bg-[#00e575] text-[#052429]'
                  : 'text-slate-300 bg-[#0a383f] border border-[#0e4851]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Profile Section (Isolated) */}
        {activeNav === 'profile' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-800" /> Patient Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Full Name</span>
                  <strong className="text-slate-900">{currentPatient.name}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Medical Record Number (MRN)</span>
                  <strong className="text-slate-900">{currentPatient.id}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Date of Birth</span>
                  <strong className="text-slate-900">12 May 1968 (58 years)</strong>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-slate-500 block mb-1">Primary Diagnosis</span>
                  <strong className="text-slate-900">{currentPatient.primaryDiagnosis}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Attending Physician</span>
                  <strong className="text-slate-900">{currentPatient.attendingPhysician}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Discharge Date</span>
                  <strong className="text-slate-900">{currentPatient.dischargeDate}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeNav !== 'profile') && (
          <>
            {/* SECTION A: WELCOME HEADER */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#052429] bg-[#e6fcf1] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full">
                      Post-Discharge Recovery Plan
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Discharged: {currentPatient.dischargeDate}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
                    Good morning, Arun
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Here is your follow-up plan after discharge.
                  </p>
                </div>

                {/* Quick hospital record summary */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div><strong className="text-slate-800">Primary Diagnosis:</strong> {currentPatient.primaryDiagnosis}</div>
                  <div><strong className="text-slate-800">Attending Physician:</strong> {currentPatient.attendingPhysician}</div>
                </div>
              </div>
            </div>

            {/* TOP ROW: SECTION B (NEXT ACTION) & SECTION C (FOLLOW-UP PROGRESS) */}
            {(activeNav === 'dashboard' || activeNav === 'plan') && (
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
                            NEXT ACTION
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
                          <button
                            onClick={() => setSelectedTaskModal(nextAction)}
                            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </button>
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

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Synchronized with Hospital Discharge Instructions</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION F: NEEDS REVIEW ALERT TRAY */}
            {(activeNav === 'dashboard' || activeNav === 'plan') && needsReviewTasks.length > 0 && (
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
            {(activeNav === 'dashboard' || activeNav === 'plan') && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 mb-4 gap-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-800" /> My Follow-up Tasks
                  </h3>
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
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {displayedTasks.map((task) => (
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
            {(activeNav === 'dashboard' || activeNav === 'timeline' || activeNav === 'reminders') && (
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
                        <strong>Scheduled:</strong> {demoReminderSimulation.scheduledTime}
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        <strong>Purpose:</strong> {demoReminderSimulation.purpose}
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
            {(activeNav === 'dashboard') && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* Medications */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Pill className="w-4 h-4 text-teal-800" /> Prescribed Medications
                    </h3>
                    <div className="space-y-3">
                      {demoMedications.map((m) => (
                        <div key={m.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900 text-sm">{m.medicationName} ({m.dosage})</div>
                          <div className="text-slate-700 font-medium mt-0.5">{m.frequency}</div>
                          <div className="text-slate-500 mt-1 text-[11px] leading-relaxed">{m.instructions}</div>
                        </div>
                      ))}
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
                      {demoCareInstructions.map((ci) => (
                        <div key={ci.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900 text-sm">{ci.title}</div>
                          <p className="text-slate-600 mt-1 leading-relaxed text-xs">{ci.description}</p>
                        </div>
                      ))}
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
                      {demoWarnings.map((w) => (
                        <div key={w.id} className="p-3 bg-white rounded-xl border border-red-200 text-xs shadow-2xs">
                          <div className="font-bold text-red-900">{w.symptom}</div>
                          <div className="text-slate-700 mt-1 font-medium text-[11px]">{w.action}</div>
                        </div>
                      ))}
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
      </main>

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
  );
}
