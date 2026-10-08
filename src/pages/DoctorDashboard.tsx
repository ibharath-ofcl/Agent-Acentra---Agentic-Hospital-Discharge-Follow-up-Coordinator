import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  ClockAlert,
  AlertTriangle,
  CheckCircle2,
  Search,
  Check,
  LogOut,
  ShieldCheck,
  User,
  PhoneCall,
  X,
  Calendar,
  ArrowRight,
  Clock,
  UserCheck,
} from 'lucide-react';
import {
  demoPatients,
  demoCareCoordinationPriorities,
  demoNeedsReviewQueue,
  demoOverdueItems,
  demoUpcomingDeadlines,
  demoReminderSimulation,
  demoDashboardStats,
} from '../data/demoData';
import {
  StatusBadge,
  CareCoordinationPriorityBadge,
} from '../components/common/StatusBadge';
import { useAuth } from '../hooks/useAuth';
import type {
  CareCoordinationPriorityItem,
  NeedsReviewItem,
  Patient,
  CareCoordinationPriorityLevel,
} from '../types';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Navigation tab state
  const [activeNav, setActiveNav] = useState<'dashboard' | 'patients' | 'priority' | 'review' | 'escalations' | 'activity'>('dashboard');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | CareCoordinationPriorityLevel>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'needs-review' | 'overdue'>('all');

  // Interactive local states for demo actions
  const [priorityList] = useState<CareCoordinationPriorityItem[]>(demoCareCoordinationPriorities);
  const [reviewQueue, setReviewQueue] = useState<NeedsReviewItem[]>(demoNeedsReviewQueue);
  const [inspectedPatient, setInspectedPatient] = useState<Patient | null>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<NeedsReviewItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Interactive handler for "Review Now" or "Approve"
  const handleResolveReviewItem = (id: string, issue: string) => {
    setReviewQueue((prev) => prev.filter((item) => item.id !== id));
    setSelectedReviewItem(null);
    setToastMessage(`Clinician approved: "${issue}" resolved & updated`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePriorityAction = (item: CareCoordinationPriorityItem) => {
    if (item.level === 'immediate-review') {
      const match = reviewQueue.find((r) => r.patientId === item.patientId);
      if (match) {
        setSelectedReviewItem(match);
      } else {
        const pt = demoPatients.find((p) => p.id === item.patientId);
        if (pt) setInspectedPatient(pt);
      }
    } else {
      const pt = demoPatients.find((p) => p.id === item.patientId);
      if (pt) setInspectedPatient(pt);
    }
  };

  // Filtered priority list for Patient Queue Table
  const filteredPriorityList = priorityList.filter((item) => {
    const matchesSearch =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.followUp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.reason.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || item.level === priorityFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
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

      {/* Enterprise Deep Dark Teal Header */}
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
                Doctor & Care Coordinator Command Center
              </span>
            </div>

            {/* Navigation links (Section 12) */}
            <nav className="hidden lg:flex items-center gap-1 text-xs">
              {[
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'patients', label: 'Patients' },
                { id: 'priority', label: 'Priority Queue' },
                { id: 'review', label: 'Needs Review' },
                { id: 'escalations', label: 'Overdue & Deadlines' },
                { id: 'activity', label: 'Activity' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveNav(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    activeNav === tab.id
                      ? 'bg-[#00e575] text-[#052429]'
                      : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Clinician Profile */}
            <div className="flex items-center gap-3">
              <Link
                to="/patient"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors"
                title="Switch to Patient Portal"
              >
                <User className="w-3.5 h-3.5" /> Patient View
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-[#0e4851] text-xs">
                <div className="w-8 h-8 rounded-full bg-[#0a383f] text-[#00e575] border border-[#145e69] font-black flex items-center justify-center text-xs">
                  MP
                </div>
                <div className="hidden md:block text-left text-white leading-tight">
                  <div className="font-bold text-xs">Dr. Meera Patel</div>
                  <div className="text-[10px] text-slate-400">Chief Coordinator • Cardiology</div>
                </div>
              </div>

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
      <div className="lg:hidden bg-[#052429] border-b border-[#0e4851] overflow-x-auto hide-scrollbar sticky top-16 z-30">
        <div className="flex items-center px-4 py-2 gap-2 w-max">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'patients', label: 'Patients' },
            { id: 'priority', label: 'Priority Queue' },
            { id: 'review', label: 'Needs Review' },
            { id: 'escalations', label: 'Overdue & Deadlines' },
            { id: 'activity', label: 'Activity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id as any)}
              className={`px-3 py-1.5 text-xs rounded-full font-semibold transition-colors ${
                activeNav === tab.id
                  ? 'bg-[#00e575] text-[#052429]'
                  : 'text-slate-300 bg-[#0a383f] border border-[#0e4851]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
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

          {/* Safety Rule Banner */}
          <div className="bg-[#e6fcf1] border border-[#a7f3d0] px-3.5 py-2 rounded-xl text-xs text-[#052429] flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#008742] shrink-0" />
            <span>Care Coordination Priority based on documented timelines — Zero autonomous clinical diagnosis.</span>
          </div>
        </div>

        {/* SECTION 5: TOP STATISTICS (5 Required Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8 items-stretch">
          {/* 1. Total Patients */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-teal-800" /> Total Patients
            </div>
            <div className="my-2 text-2xl font-black text-slate-900">{demoDashboardStats.totalPatients}</div>
            <div className="text-[11px] text-slate-500">Active discharged cohort</div>
          </div>

          {/* 2. Pending Follow-ups */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Follow-ups
            </div>
            <div className="my-2 text-2xl font-black text-slate-900">{demoDashboardStats.pendingFollowUps}</div>
            <div className="text-[11px] text-amber-700 font-medium">Scheduled / In Progress</div>
          </div>

          {/* 3. High Priority */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-amber-600" /> High Priority
            </div>
            <div className="my-2 text-2xl font-black text-slate-900">2</div>
            <div className="text-[11px] text-amber-700 font-medium">Approaching deadline</div>
          </div>

          {/* 4. Needs Review */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-300 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Needs Review
            </div>
            <div className="my-2 text-2xl font-black text-amber-900">{reviewQueue.length}</div>
            <div className="text-[11px] text-amber-800 font-medium">Flagged for clinician check</div>
          </div>

          {/* 5. Overdue */}
          <div className="bg-red-50/70 p-4 rounded-xl border border-red-300 shadow-xs h-full flex flex-col justify-between">
            <div className="text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-red-600" /> Overdue
            </div>
            <div className="my-2 text-2xl font-black text-red-700">{demoOverdueItems.length}</div>
            <div className="text-[11px] text-red-700 font-medium">Deadline lapsed</div>
          </div>
        </div>

        {/* ========================================================
            SECTION 6: CARE COORDINATION PRIORITY (PROMINENT FEATURE)
            ======================================================== */}
        {(activeNav === 'dashboard' || activeNav === 'priority') && (
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
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <CareCoordinationPriorityBadge level="immediate-review" size="sm" />
                  <span className="text-[11px] font-mono text-red-700 font-bold">Priority #1</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Arun Kumar</h3>
                <p className="text-xs text-red-900 font-medium mt-1 leading-snug">
                  "Documented urgent follow-up / unresolved clinical instruction"
                </p>
                <div className="mt-2 text-[11px] text-slate-600">
                  Target: <strong>Cardiology & Nephrology Date</strong> • Due 15 Oct
                </div>
                {/* Source cite */}
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Source: Discharge Summary • Page 2 & 4
                </div>
              </div>

              <button
                onClick={() => {
                  const item = priorityList.find((p) => p.id === 'CCP001');
                  if (item) handlePriorityAction(item);
                }}
                className="mt-4 w-full py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Review Now
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 🟠 HIGH FOLLOW-UP PRIORITY TIER */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <CareCoordinationPriorityBadge level="high-priority" size="sm" />
                  <span className="text-[11px] font-mono text-amber-800 font-bold">Priority #2</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Priya Sharma</h3>
                <p className="text-xs text-amber-950 font-medium mt-1 leading-snug">
                  "Follow-up deadline approaching"
                </p>
                <div className="mt-2 text-[11px] text-slate-600">
                  Target: <strong>Fasting Blood Glucose & HbA1c</strong> • Due 18 Oct
                </div>
                {/* Source cite */}
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Source: Discharge Summary • Page 2
                </div>
              </div>

              <button
                onClick={() => {
                  const item = priorityList.find((p) => p.id === 'CCP003');
                  if (item) handlePriorityAction(item);
                }}
                className="mt-4 w-full py-2.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-xl transition-colors border border-amber-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Review
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 🟢 ROUTINE TIER */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between">
                  <CareCoordinationPriorityBadge level="routine" size="sm" />
                  <span className="text-[11px] font-mono text-emerald-800 font-bold">Priority #3</span>
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900">Rahul Kumar</h3>
                <p className="text-xs text-emerald-950 font-medium mt-1 leading-snug">
                  "Upcoming routine follow-up"
                </p>
                <div className="mt-2 text-[11px] text-slate-600">
                  Target: <strong>Surgical site wound inspection</strong> • Due 22 Oct
                </div>
                {/* Source cite */}
                <div className="mt-2 text-[10px] text-slate-500 font-mono">
                  Source: Discharge Summary • Page 1
                </div>
              </div>

              <button
                onClick={() => {
                  const item = priorityList.find((p) => p.id === 'CCP005');
                  if (item) handlePriorityAction(item);
                }}
                className="mt-4 w-full py-2.5 text-xs font-bold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors border border-emerald-300 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                View
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        )}

        {/* ========================================================
            SECTION 8: NEEDS HUMAN REVIEW QUEUE
            ======================================================== */}
        {(activeNav === 'dashboard' || activeNav === 'review') && (
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
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-800" /> Discharged Patient Cohort Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized registry with explicit Care Coordination Priority indicators
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter patient name..."
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
              </select>
            </div>
          </div>

          {/* Patient Queue Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold">Patient</th>
                  <th className="py-3 px-4 font-bold">Follow-up</th>
                  <th className="py-3 px-4 font-bold">Due Date</th>
                  <th className="py-3 px-4 font-bold">Priority</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
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
                      {/* Patient */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="font-bold text-slate-900">{item.patientName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {item.patientId}</div>
                      </td>

                      {/* Follow-up */}
                      <td className="py-3.5 px-4 align-middle text-slate-700 font-medium">
                        <div className="font-semibold text-slate-900">{item.followUp}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{item.reason}</div>
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 align-middle text-slate-600 font-medium whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                          {item.dueDate}
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

                      {/* Action */}
                      <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                        <button
                          onClick={() => handlePriorityAction(item)}
                          className={`min-w-[110px] inline-flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center ${
                            item.level === 'immediate-review'
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200'
                          }`}
                        >
                          {item.actionLabel}
                        </button>
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
        {(activeNav === 'dashboard' || activeNav === 'escalations' || activeNav === 'activity') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
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
                {demoOverdueItems.map((od) => (
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
                {demoUpcomingDeadlines.map((ud) => (
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
                  <span>{demoReminderSimulation.patientName}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {demoReminderSimulation.currentStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  <strong>Scheduled:</strong> {demoReminderSimulation.scheduledTime}
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  <strong>Purpose:</strong> {demoReminderSimulation.purpose}
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
                <Link
                  to="/patient"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-xl shadow-xs"
                >
                  View Patient Portal
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
