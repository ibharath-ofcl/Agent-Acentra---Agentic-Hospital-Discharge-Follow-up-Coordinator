import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, ClockAlert, AlertTriangle, CheckCircle2, Search, Check, LogOut,
  ShieldCheck, User, PhoneCall, X, Calendar, ArrowRight, Clock, UserCheck, Menu,
  UploadCloud, LayoutDashboard, ListTodo, CalendarClock, ClipboardList, History,
  BellRing, HelpCircle, Sparkles, Brain, Stethoscope, Pill, AlertOctagon,
  CheckSquare, Eye, Send, ChevronRight, CheckCheck, Info, FileSearch,
  HeartPulse, FileCheck, Layers, ClipboardCheck, ArrowUpRight, Copy, UserPlus
} from 'lucide-react';
import {
  StatusBadge,
  CareCoordinationPriorityBadge,
} from '../components/common/StatusBadge';
import { DischargeIntelligenceView } from '../components/ai/DischargeIntelligenceView';
import { PatientRegistrationModal } from '../components/common/PatientRegistrationModal';
import { CentralizedPatientProfileModal } from '../components/common/CentralizedPatientProfileModal';
import { useAuth } from '../hooks/useAuth';
import { doctorService } from '../services/api/doctorService';
import { geminiService } from '../services/ai/geminiService';
import { useSearchParams } from 'react-router-dom';
import type {
  CareCoordinationPriorityItem,
  NeedsReviewItem,
  Patient,
  CareCoordinationPriorityLevel
} from '../types';

interface DoctorDashboardProps {
  defaultTab?: string;
}

export function DoctorDashboard({ defaultTab }: DoctorDashboardProps = {}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  // Navigation tab state
  const [activeNav, setActiveNav] = useState(defaultTab || tabParam || 'dashboard');

  useEffect(() => {
    if (defaultTab) {
      setActiveNav(defaultTab);
    } else if (tabParam) {
      setActiveNav(tabParam);
    }
  }, [defaultTab, tabParam]);

  const sidebarNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/doctor' },
    { id: 'followup', label: 'My Follow-ups', icon: ListTodo, path: '/doctor/follow-ups', badge: '7' },
    { id: 'tasks', label: 'Upcoming Tasks', icon: CalendarClock, path: '/doctor/tasks', badge: '4' },
    { id: 'instructions', label: 'Care Instructions', icon: ClipboardList, path: '/doctor/care-instructions' },
    { id: 'upload', label: 'Discharge Intelligence', icon: Sparkles, tab: 'upload' },
    { id: 'patients', label: 'Patients', icon: Users, tab: 'patients' },
    { id: 'review', label: 'Needs Human Review', icon: AlertTriangle, tab: 'review', badge: '4' },
    { id: 'priority', label: 'Priority Queue', icon: ClockAlert, tab: 'priority' },
    { id: 'reminders', label: 'Reminders & Calls', icon: PhoneCall, tab: 'reminders' },
    { id: 'timeline', label: 'Timeline / Audit', icon: Clock, tab: 'timeline' },
  ];

  const handleNavClick = (item: typeof sidebarNav[0]) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.tab) {
      setActiveNav(item.tab);
      setSearchParams({ tab: item.tab });
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({ totalPatients: 0, pendingFollowUps: 0, highPriority: 0, needsReview: 0, overdue: 0 });
  const [priorityList, setPriorityList] = useState<any[]>([]);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [overdueItems, setOverdueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<any>(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [s, p, r, o, ai] = await Promise.all([
        doctorService.getStats(),
        doctorService.getPatients(),
        doctorService.getNeedsReview(),
        doctorService.getOverdue(),
        geminiService.getAiStatus()
      ]);
      if (s && typeof s === 'object') setStats(s);
      setPriorityList(Array.isArray(p) ? p : []);
      setReviewQueue(Array.isArray(r) ? r : []);
      setOverdueItems(Array.isArray(o) ? o : []);
      if (ai) setAiStatus(ai);
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, activeNav]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | CareCoordinationPriorityLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'needs-review' | 'overdue'>('all');

  // Interactive local states for demo actions
  const [inspectedPatient, setInspectedPatient] = useState<Patient | null>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<NeedsReviewItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Patient Registration & Centralized Profile Modal States
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedProfilePatientId, setSelectedProfilePatientId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenPatientProfile = useCallback((patientId: string) => {
    setSelectedProfilePatientId(patientId);
    setIsProfileModalOpen(true);
  }, []);

  const handlePatientRegistered = useCallback((newPatientId: string) => {
    loadDashboardData();
    showToast(`Patient successfully registered in MySQL (${newPatientId})`);
    handleOpenPatientProfile(newPatientId);
  }, [loadDashboardData, showToast, handleOpenPatientProfile]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Memoized filter for patient priority table
  const filteredPriorityList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return priorityList.filter((item) => {
      if (!item) return false;
      const pName = (item.patientName || item.name || '').toLowerCase();
      const pId = (item.patientId || item.id || '').toLowerCase();
      const fUp = (item.followUp || '').toLowerCase();
      const rsn = (item.primaryDiagnosis || item.reason || '').toLowerCase();
      const dept = (item.department || '').toLowerCase();

      const matchesSearch = !query || pName.includes(query) || pId.includes(query) || fUp.includes(query) || rsn.includes(query) || dept.includes(query);
      const matchesPriority = priorityFilter === 'all' || item.level === priorityFilter;
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [priorityList, searchQuery, priorityFilter, statusFilter]);

  // Interactive handler for "Review Now" or "Approve"
  const handleResolveReviewItem = useCallback((id: string, issue: string) => {
    setReviewQueue((prev) => prev.filter((item) => item.id !== id));
    setSelectedReviewItem(null);
    showToast(`Clinician approved: "${issue}" resolved & updated`);
  }, [showToast]);

  const handlePriorityAction = useCallback((item: CareCoordinationPriorityItem) => {
    if (item.level === 'immediate-review') {
      const match = reviewQueue.find((r) => r.patientId === item.patientId);
      if (match) {
        setSelectedReviewItem(match);
      } else {
        const pt = priorityList.find((p) => p.id === item.patientId);
        if (pt) setInspectedPatient(pt);
      }
    } else {
      const pt = priorityList.find((p) => p.id === item.patientId);
      if (pt) setInspectedPatient(pt);
    }
  }, [reviewQueue, priorityList]);


  return (
        <div className="flex bg-[#f8fafc] text-slate-900 min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] bg-[#052429] border border-[#00e575] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#052429] border-r border-[#0e4851] flex-shrink-0 fixed inset-y-0 z-40">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#0e4851]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
              <Activity className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight text-white line-clamp-1">
              CareFlow <span className="text-[#00e575]">AI</span>
            </span>
          </Link>
        </div>
        
        <div className="px-5 py-3 border-b border-[#0e4851]">
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Role</div>
          <div className="text-xs font-bold text-[#00e575]">Coordinator Command</div>
        </div>

        <nav className="flex-1 overflow-y-auto hide-scrollbar py-4 px-3 space-y-1">
          {sidebarNav.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                activeNav === item.id
                  ? 'bg-[#00e575] text-[#052429] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeNav === item.id
                    ? 'bg-[#052429] text-[#00e575]'
                    : 'bg-[#0e4851] text-teal-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#0e4851] space-y-2">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-8 h-8 rounded-full bg-[#0a383f] text-[#00e575] border border-[#145e69] font-black flex items-center justify-center text-xs shrink-0">
              MP
            </div>
            <div className="text-left text-white overflow-hidden">
              <div className="font-bold text-xs truncate">Dr. Meera Patel</div>
              <div className="text-[10px] text-slate-400 truncate">Coordinator</div>
            </div>
          </div>
          <Link
            to="/patient"
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors"
          >
            <User className="w-3.5 h-3.5" /> Patient View
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-slate-300 bg-transparent hover:bg-red-950/40 hover:text-red-400 border border-transparent rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#052429] text-white border-b border-[#0e4851] h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-slate-300 hover:text-white rounded-lg focus:outline-none"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                CareFlow <span className="text-[#00e575]">AI</span>
              </span>
            </Link>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-300 hover:text-red-400" aria-label="Sign out">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Sidebar Off-canvas */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#052429] border-r border-[#0e4851] flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-[#0e4851]">
                  <span className="font-bold text-base tracking-tight text-white">Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-300 hover:text-white" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {sidebarNav.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { handleNavClick(item); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                        activeNav === item.id
                          ? 'bg-[#00e575] text-[#052429] font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#0e4851] text-teal-300">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20">
        {/* Top Header & Core Question (Section 5) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Discharge Coordination Command Center
            </h1>
            <p className="mt-1 text-sm font-semibold text-teal-900">
              “Which patients need my attention?”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Register New Patient Button */}
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer font-mono"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              Register New Patient
            </button>

            {/* Safety Rule Banner */}
            <div className="bg-[#e6fcf1] border border-[#a7f3d0] px-3.5 py-2 rounded-xl text-xs text-[#052429] flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#008742] shrink-0" />
              <span className="hidden sm:inline">Zero autonomous clinical diagnosis.</span>
            </div>
          </div>
        </div>

        {/* SECTION 5: TOP STATISTICS (5 Required Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8 items-stretch">
          {/* 1. Total Patients */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-800" /> Total Patients
            </div>
            <div className="my-2 text-2xl font-black text-slate-900">{stats.totalPatients}</div>
            <div className="text-[11px] text-slate-500">Active discharged cohort</div>
          </div>

          {/* 2. Pending Follow-ups */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Follow-ups
            </div>
            <div className="my-2 text-2xl font-black text-slate-900">{stats.pendingFollowUps}</div>
            <div className="text-[11px] text-amber-700 font-medium">Scheduled / In Progress</div>
          </div>

          {/* 3. High Priority */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-amber-600" /> High Priority
            </div>
            <div className="my-2 text-2xl font-black text-slate-900">{stats.highPriority}</div>
            <div className="text-[11px] text-amber-700 font-medium">Approaching deadline</div>
          </div>

          {/* 4. Needs Review */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Needs Review
            </div>
            <div className="my-2 text-2xl font-black text-amber-900">{stats.needsReview || reviewQueue.length}</div>
            <div className="text-[11px] text-amber-800 font-medium">Flagged for clinician check</div>
          </div>

          {/* 5. Overdue */}
          <div className="bg-red-50/70 p-4 rounded-xl border border-red-300 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-red-600" /> Overdue
            </div>
            <div className="my-2 text-2xl font-black text-red-700">{stats.overdue || overdueItems.length}</div>
            <div className="text-[11px] text-red-700 font-medium">Deadline lapsed</div>
          </div>
        </div>

        {/* ========================================================
            SECTION 6: CARE COORDINATION PRIORITY (PROMINENT FEATURE)
            ======================================================== */}
        {(activeNav === 'dashboard' || activeNav === 'priority' || activeNav === 'followup') && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-7 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-pulse-soft" />
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 uppercase tracking-wider">
                  Care Coordination Priority
                </h2>
                <span className="text-xs font-bold bg-[#052429] text-[#00e575] px-2.5 py-0.5 rounded-full">
                  Autonomous Triage Index
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Patients ranked strictly by documented follow-up deadlines, overdue tasks, and flagged instructions.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-500 font-medium">Rank Criteria:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">🔴 Immediate Review</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">🟠 High Priority</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">🟢 Routine</span>
            </div>
          </div>

          {/* Cards for each priority tier */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* 🔴 IMMEDIATE REVIEW TIER */}
            {(() => {
              const item = priorityList.find((p) => p.level === 'immediate-review') || priorityList[0];
              return (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <CareCoordinationPriorityBadge level="immediate-review" size="sm" />
                      <span className="text-[11px] font-mono text-red-700 font-bold">Priority #1</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{item?.patientName || item?.name || 'Arun Kumar'}</h3>
                    <p className="text-xs text-red-900 font-medium mt-1 leading-snug">
                      "{item?.primaryDiagnosis || 'Documented urgent follow-up / unresolved clinical instruction'}"
                    </p>
                    <div className="mt-2 text-[11px] text-slate-600">
                      Target: <strong>{item?.followUp || 'Cardiology Specialist Evaluation'}</strong> • Due {item?.dueDate || '15 Oct'}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      MRN: {item?.patientId || item?.id || 'MRN-1003'} • Dept: {item?.department || 'Cardiology'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item) handlePriorityAction(item);
                    }}
                    className="mt-4 w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Review Now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* 🟠 HIGH FOLLOW-UP PRIORITY TIER */}
            {(() => {
              const item = priorityList.find((p) => p.level === 'high-priority') || priorityList[1] || priorityList[0];
              return (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <CareCoordinationPriorityBadge level="high-priority" size="sm" />
                      <span className="text-[11px] font-mono text-amber-800 font-bold">Priority #2</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{item?.patientName || item?.name || 'Priya Sharma'}</h3>
                    <p className="text-xs text-amber-950 font-medium mt-1 leading-snug">
                      "{item?.primaryDiagnosis || 'Follow-up deadline approaching'}"
                    </p>
                    <div className="mt-2 text-[11px] text-slate-600">
                      Target: <strong>{item?.followUp || 'Diagnostic Lab Follow-up'}</strong> • Due {item?.dueDate || '18 Oct'}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      MRN: {item?.patientId || item?.id || 'MRN-1001'} • Dept: {item?.department || 'Cardiology'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item) handlePriorityAction(item);
                    }}
                    className="mt-4 w-full py-2.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Review
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}

            {/* 🟢 ROUTINE TIER */}
            {(() => {
              const item = priorityList.find((p) => p.level === 'routine') || priorityList[2] || priorityList[0];
              return (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <CareCoordinationPriorityBadge level="routine" size="sm" />
                      <span className="text-[11px] font-mono text-emerald-800 font-bold">Priority #3</span>
                    </div>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{item?.patientName || item?.name || 'Rahul Kumar'}</h3>
                    <p className="text-xs text-emerald-950 font-medium mt-1 leading-snug">
                      "{item?.primaryDiagnosis || 'Upcoming routine follow-up'}"
                    </p>
                    <div className="mt-2 text-[11px] text-slate-600">
                      Target: <strong>{item?.followUp || 'Routine Surgical Inspection'}</strong> • Due {item?.dueDate || '22 Oct'}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-500 font-mono">
                      MRN: {item?.patientId || item?.id || 'MRN-1006'} • Dept: {item?.department || 'Orthopedics'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item) handlePriorityAction(item);
                    }}
                    className="mt-4 w-full py-2.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors border border-emerald-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
        )}

        {/* ========================================================
            SECTION 8: NEEDS HUMAN REVIEW QUEUE
            ======================================================== */}
        {(activeNav === 'dashboard' || activeNav === 'review' || activeNav === 'followup') && (
          <div className="bg-white rounded-xl border border-amber-300 shadow-xs p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Needs Human Review
                </h3>
                <p className="text-xs text-slate-500">
                  AI does not resolve these clinically — Human care coordinator or doctor reviews them
                </p>
              </div>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              {reviewQueue.length} Active Items
            </span>
          </div>

          <div className="space-y-3">
            {reviewQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{item.patientName}</span>
                    <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                      {item.category.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-[11px] text-slate-600 font-mono">
                      Source: {item.source} • Page {item.page}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 mt-1">{item.issue}</p>
                  <p className="text-[11px] text-amber-900 font-medium mt-0.5">
                    Flag: {item.flagReason}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setSelectedReviewItem(item)}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    Review
                  </button>
                  <button
                    onClick={() => handleResolveReviewItem(item.id, item.issue)}
                    className="px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ========================================================
            SECTION 7: DOCTOR PATIENT QUEUE TABLE
            ======================================================== */}
        {(activeNav === 'dashboard' || activeNav === 'patients') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-800" /> Discharged Patient Cohort Queue
                </h3>
                <span className="text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-full">
                  {filteredPriorityList.length} Active Cohort Patients
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized registry with explicit Care Coordination Priority indicators & post-discharge tracking
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Register New Patient Action */}
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-3 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Register Patient</span>
              </button>

              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter name, MRN, phone, dept..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575]"
                />
              </div>

              {/* Priority Filter */}
              <select
                value={priorityFilter}
                aria-label="Filter by priority"
                onChange={(e) => setPriorityFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="immediate-review">🔴 Immediate Review</option>
                <option value="high-priority">🟠 High Priority</option>
                <option value="routine">🟢 Routine</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                aria-label="Filter by status"
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="needs-review">Needs Review</option>
                <option value="overdue">Overdue</option>
                <option value="stable">Stable / Up to date</option>
              </select>
            </div>
          </div>

          {/* Patient Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Patient & Department</th>
                  <th className="py-3 px-4 font-bold">Primary Diagnosis & Discharge</th>
                  <th className="py-3 px-4 font-bold">Next Follow-up & Due</th>
                  <th className="py-3 px-4 font-bold">Priority</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPriorityList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <UserCheck className="w-8 h-8 text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-900">No patients found</p>
                        <p className="text-xs mt-1 text-slate-500">Try adjusting your filters or search query.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPriorityList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      {/* Patient & Department */}
                      <td className="py-3.5 px-4 align-middle">
                        <button
                          onClick={() => handleOpenPatientProfile(item.patientId || item.id)}
                          className="text-left group cursor-pointer"
                        >
                          <div className="font-bold text-slate-900 group-hover:text-teal-700 transition-colors flex items-center gap-1">
                            <span>{item.patientName || item.name}</span>
                            <ArrowUpRight className="w-3 h-3 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: <span className="font-semibold text-slate-700">{item.patientId || item.id}</span> • Dept: <span className="text-teal-700 font-medium">{item.department || 'Cardiology'}</span>
                          </div>
                        </button>
                      </td>

                      {/* Primary Diagnosis & Discharge */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-semibold text-slate-900 truncate max-w-xs">{item.primaryDiagnosis || item.reason || 'Post-Discharge Recovery'}</div>
                        <div className="text-[10px] text-slate-500">Discharged: {item.dischargeDate || '-'}</div>
                      </td>

                      {/* Follow-up & Due Date */}
                      <td className="py-3.5 px-4 align-middle text-slate-700 font-medium">
                        <div className="font-semibold text-slate-900 truncate max-w-xs">{item.followUp}</div>
                        <span className="flex items-center gap-1.5 text-[10px] text-teal-700 font-semibold mt-0.5">
                          <Calendar className="w-3 h-3 text-teal-700 shrink-0" />
                          Due: {item.dueDate || item.followUpDate || '-'}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <CareCoordinationPriorityBadge level={item.level} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenPatientProfile(item.patientId || item.id)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer"
                          >
                            360° Profile
                          </button>
                          <button
                            onClick={() => handlePriorityAction(item)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                              item.level === 'immediate-review'
                                ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {item.actionLabel || 'Triage'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* ========================================================
            SECTION 9 & 11: UPCOMING, OVERDUE & AI REMINDER ACTIVITY
            ======================================================== */}
        {/* ========================================================
            DASHBOARD VIEW: OVERDUE, DEADLINES & AI REMINDER SUMMARY
            ======================================================== */}
        {(activeNav === 'dashboard' || activeNav === 'followup') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch mb-8">
            {/* SECTION 9: OVERDUE FOLLOW-UPS */}
            <div className="bg-red-50/60 rounded-xl border border-red-200 p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-red-200 mb-4">
                  <h3 className="text-xs font-extrabold text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ClockAlert className="w-4 h-4 text-red-600" /> OVERDUE FOLLOW-UPS
                  </h3>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full border border-red-300">
                    Lapsed Deadline
                  </span>
                </div>

                <div className="space-y-3">
                  {overdueItems.map((od) => (
                    <div key={od.id} className="p-4 bg-white rounded-xl border border-red-200 text-xs shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900 text-sm">{od.patientName}</span>
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          {od.daysOverdue} day overdue
                        </span>
                      </div>
                      <div className="mt-1 text-slate-800 font-semibold">{od.taskTitle}</div>
                      <div className="text-slate-600 mt-0.5">Due: <strong className="text-red-700">{od.dueDate}</strong></div>
                      <div className="text-[11px] text-slate-500 mt-1">Attending: {od.attending} • {od.contactPhone}</div>

                      <button
                        onClick={() => {
                          setToastMessage(`Coordinator task opened for ${od.patientName}`);
                          setTimeout(() => setToastMessage(null), 3000);
                        }}
                        className="mt-3 w-full py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                      >
                        Initiate Care Outreach
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-red-200 text-[11px] text-red-800">
                Immediate coordination required for high-risk patients
              </div>
            </div>

            {/* SECTION 9: UPCOMING DEADLINES */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-teal-800" /> Upcoming Deadlines
                </h3>

                <div className="space-y-3">
                  {overdueItems.map((ud) => (
                    <div key={ud.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ud.patientName}</span>
                        <span className="text-[11px] text-slate-600 font-mono">{ud.dueDate}</span>
                      </div>
                      <div className="text-slate-700 font-medium mt-0.5">{ud.taskTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Specialty: {ud.specialty}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                Timeline monitored continuously against hospital protocol
              </div>
            </div>

            {/* SECTION 11: AI REMINDER ACTIVITY PANEL */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-teal-800" /> AI Reminder Simulation
                  </h3>
                  <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
                    Informational
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{(priorityList[0]?.patientName || 'Loading...')}</span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {('Upcoming')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    <strong>Scheduled:</strong> {('Today, 2:00 PM')}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    <strong>Purpose:</strong> {('Post-discharge routine check')}
                  </p>

                  {/* Simulation Sequence */}
                  <div className="mt-3 pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600 font-mono">
                    <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                      <span>Attempt 1 — No answer</span>
                      <span className="text-amber-600 font-bold">Recorded</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                      <span>Attempt 2 — Scheduled</span>
                      <span className="text-teal-700 font-bold">In 30m</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 bg-white rounded border border-slate-200">
                      <span>SMS fallback — Pending</span>
                      <span className="text-slate-400">Queued</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Safety Boundary: Never provides clinical advice.</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            DEDICATED VIEW 1: TIMELINE & CLINICAL AUDIT LOG
            ======================================================== */}
        {activeNav === 'timeline' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 mb-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Hospital Care Coordination Timeline & Audit Log
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Chronological trail of hospital discharge orders, clinical reviews, lab completions, and automated patient touchpoints.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Immutable Audit Trail
                </span>
              </div>
            </div>

            {/* Audit Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tracked Milestones</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">100% In Compliance</div>
                <span className="text-[11px] text-emerald-700 font-medium">0 Missed Critical Milestones</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Verification Engine</span>
                <div className="text-xl font-extrabold text-teal-800 mt-1">CareFlow Deterministic</div>
                <span className="text-[11px] text-slate-600 font-medium">Synced with Hospital MySQL DB</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Cohort Horizon</span>
                <div className="text-xl font-extrabold text-slate-900 mt-1">T+0 to T+30 Days</div>
                <span className="text-[11px] text-teal-700 font-medium">{priorityList.length} Active Monitored Patients</span>
              </div>
            </div>

            {/* Audit Log Stream Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">Event & Horizon</th>
                    <th className="py-3 px-4">Patient / MRN</th>
                    <th className="py-3 px-4">Clinical Milestone & Action</th>
                    <th className="py-3 px-4">Verification Entity</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">Today • 10:15 AM (T+48h)</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Arun Patel <span className="text-[10px] font-mono text-slate-400 block">MRN-2024-001</span></td>
                    <td className="py-3 px-4 text-slate-700">Telephone Nurse Follow-up & Vitals Verification completed</td>
                    <td className="py-3 px-4 text-slate-600">Nurse Coordinator Sarah Jenkins</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Verified Complete</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">Today • 09:30 AM (T+24h)</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Ravi Kumar <span className="text-[10px] font-mono text-slate-400 block">MRN-RAVI-001</span></td>
                    <td className="py-3 px-4 text-slate-700">Pre-appointment Email Confirmation dispatched to patient email</td>
                    <td className="py-3 px-4 text-slate-600">CareFlow Automated Service</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">Email Dispatched</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">Yesterday • 04:00 PM (T+0)</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Priya Sharma <span className="text-[10px] font-mono text-slate-400 block">MRN-1001</span></td>
                    <td className="py-3 px-4 text-slate-700">Hospital Discharge Summary approved & medications reconciled</td>
                    <td className="py-3 px-4 text-slate-600">Dr. Rajesh Mehta (Cardiology)</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Discharge Cleared</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-700">07 Oct 2026 • 11:00 AM</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">Anita Desai <span className="text-[10px] font-mono text-slate-400 block">MRN-1004</span></td>
                    <td className="py-3 px-4 text-slate-700">Post-Op Wound Inspection scheduled in Orthopedics Clinic</td>
                    <td className="py-3 px-4 text-slate-600">Dr. Sunita Rao</td>
                    <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Scheduled</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            DEDICATED VIEW 2: MULTI-CHANNEL REMINDERS & CALLS HUB
            ======================================================== */}
        {activeNav === 'reminders' && (
          <div className="space-y-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#052429] text-[#00e575] flex items-center justify-center font-bold">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
                    Automated Multi-Channel Outreach & Reminder Operations Hub
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage AI-driven conversational phone calls, multilingual SMS alerts, dynamic patient email confirmations, and retry fallback trees.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/doctor/notifications"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  Open Notification Automation Engine
                </Link>
              </div>
            </div>

            {/* Outreach Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Voice Call Queue</span>
                <div className="text-xl font-bold text-slate-900 mt-1">4 Scheduled</div>
                <span className="text-[11px] text-teal-700">T-24h Pre-appointment</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Dynamic Emails Sent</span>
                <div className="text-xl font-bold text-slate-900 mt-1">12 Delivered</div>
                <span className="text-[11px] text-emerald-700">Individual Recipient Routing</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">SMS Fallbacks Triggered</span>
                <div className="text-xl font-bold text-slate-900 mt-1">2 Dispatched</div>
                <span className="text-[11px] text-amber-700">After Unanswered Calls</span>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Nurse Escalations</span>
                <div className="text-xl font-bold text-slate-900 mt-1">1 Overdue Alert</div>
                <span className="text-[11px] text-red-700">Requires Staff Outreach</span>
              </div>
            </div>

            {/* Multi-channel Operations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Voice AI Retry Protocol */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-teal-800" /> Conversational Voice Outreach Protocol
                  </h3>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Ravi Kumar (MRN-RAVI-001)</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        In Retry Tree
                      </span>
                    </div>
                    <p className="text-slate-600">
                      <strong>Scheduled Call:</strong> 14 Oct 2026 • 10:00 AM IST (Cardiology Clinic Visit)
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                        <span className="font-bold text-amber-700">Attempt 1 (10:00 AM):</span>
                        <span className="text-slate-600">Automated Call — Unanswered (No answer)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                        <span className="font-bold text-teal-700">Attempt 2 (10:30 AM):</span>
                        <span className="text-slate-600">Second Voice Attempt — Queued</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]">
                        <span className="font-bold text-indigo-700">Fallback (10:45 AM):</span>
                        <span className="text-slate-600">Dispatches SMS + Portal Confirmation Link</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Compliant with Hospital Communication Guidelines & Quiet Hours</span>
                </div>
              </div>

              {/* Dynamic Email & SMS Dispatch Engine */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100 flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-teal-800" /> Patient Dynamic Email & SMS Delivery
                  </h3>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Arun Patel</span>
                        <span className="text-[10px] font-mono text-teal-800 font-bold">arun.patel@example.com</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">Cardiology follow-up booking confirmation & fasting instructions sent.</p>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">✓ Sent directly to individual patient email</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">Priya Sharma</span>
                        <span className="text-[10px] font-mono text-teal-800 font-bold">priya.sharma@example.com</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1">Lab requisition notice for Serum Creatinine & Potassium panel sent.</p>
                      <span className="text-[10px] text-emerald-700 font-semibold block mt-1">✓ Sent directly to individual patient email</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Emails dispatched using patient individual profiles</span>
                  <button
                    onClick={() => {
                      setToastMessage('Live email & reminder pipeline synchronized with MySQL database');
                      setTimeout(() => setToastMessage(null), 3000);
                    }}
                    className="px-3 py-1 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 cursor-pointer"
                  >
                    Refresh Pipeline
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      
        {activeNav === 'upload' && (
          <DischargeIntelligenceView
            onShowToast={showToast}
            aiStatus={aiStatus}
            onApproved={loadDashboardData}
            onNavigateTab={(tab) => {
              setActiveNav(tab);
              setSearchParams({ tab });
            }}
          />
        )}


        </main>
{/* Review Modal (for resolving Needs Human Review queue items) */}
      <AnimatePresence>
        {selectedReviewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setSelectedReviewItem(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
                  Clinical Review Tray
                </span>
                <span className="text-xs font-mono text-slate-500">Ref: #{selectedReviewItem.id}</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900">{selectedReviewItem.patientName}</h3>
              <p className="text-sm font-semibold text-amber-950 mt-1">{selectedReviewItem.issue}</p>

              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div>
                  <strong className="text-slate-700 block">Extracted Sentence from EHR Document:</strong>
                  <div className="mt-1 font-mono text-slate-800 bg-white p-2 rounded border border-slate-200">
                    "{selectedReviewItem.extractedText}"
                  </div>
                </div>
                <div>
                  <strong className="text-slate-700">Flag Reason:</strong>{' '}
                  <span className="text-slate-600">{selectedReviewItem.flagReason}</span>
                </div>
                <div>
                  <strong className="text-slate-700">Citation:</strong>{' '}
                  <span className="font-mono text-teal-800 font-semibold">{selectedReviewItem.source} • Page {selectedReviewItem.page}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedReviewItem(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleResolveReviewItem(selectedReviewItem.id, selectedReviewItem.issue)}
                  className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  Approve Clinical Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Record Inspection Modal */}
      <AnimatePresence>
        {inspectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <button
                onClick={() => setInspectedPatient(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-800 text-white font-bold flex items-center justify-center text-sm">
                  {inspectedPatient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{inspectedPatient.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    MRN: {inspectedPatient.id} • {inspectedPatient.gender}, {inspectedPatient.age} yo
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs border-t border-slate-100 pt-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Primary Diagnosis</span>
                  <span className="text-slate-900 font-semibold">{inspectedPatient.primaryDiagnosis}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Admitted</span>
                    <span className="text-slate-800">{inspectedPatient.admissionDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Discharged</span>
                    <span className="text-slate-800">{inspectedPatient.dischargeDate}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Attending Physician</span>
                  <span className="text-slate-800">{inspectedPatient.attendingPhysician}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                    <span className="text-slate-800 font-mono">{inspectedPatient.contactPhone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Language</span>
                    <span className="text-slate-800">{inspectedPatient.preferredLanguage}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => setInspectedPatient(null)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const pid = inspectedPatient.id;
                    setInspectedPatient(null);
                    handleOpenPatientProfile(pid);
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs cursor-pointer"
                >
                  Open 360° Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Registration Modal */}
      <PatientRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onPatientRegistered={handlePatientRegistered}
      />

      {/* Centralized Patient Profile 360 Modal */}
      <CentralizedPatientProfileModal
        isOpen={isProfileModalOpen}
        patientId={selectedProfilePatientId}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfilePatientId(null);
        }}
        onRefreshParent={loadDashboardData}
        onShowToast={showToast}
      />
    
      </div>
    </div>
  );
}
