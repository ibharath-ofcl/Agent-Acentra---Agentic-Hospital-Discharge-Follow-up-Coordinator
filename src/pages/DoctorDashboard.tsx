import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Users,
  ClockAlert,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Search,
  Eye,
  Check,
  LogOut,
  ShieldCheck,
  User,
  PhoneCall,
  X,
} from 'lucide-react';
import {
  demoPatients,
  demoDashboardStats,
  demoFollowUpTasks,
  demoEscalations,
  demoReminders,
} from '../data/demoData';
import { StatusBadge, EscalationBadge } from '../components/common/StatusBadge';
import { SourceEvidenceTag } from '../components/common/SourceEvidenceTag';
import { useAuth } from '../hooks/useAuth';
import type { Escalation, FollowUpTask, Patient } from '../types';

export function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'review' | 'escalations'>('overview');

  // Interactive UI state for demo actions (Approve, Resolve, Escalate)
  const [escalationList, setEscalationList] = useState<Escalation[]>(demoEscalations);
  const [taskList, setTaskList] = useState<FollowUpTask[]>(demoFollowUpTasks);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modal inspection state
  const [inspectedPatient, setInspectedPatient] = useState<Patient | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleApprove = (taskId: string, title: string) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed' as const } : t))
    );
    setActionNotice(`Approved & verified task: "${title}"`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleResolveEscalation = (escId: string) => {
    setEscalationList((prev) =>
      prev.map((e) => (e.id === escId ? { ...e, status: 'resolved' as const } : e))
    );
    setActionNotice(`Escalation #${escId} resolved by clinical coordinator`);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const filteredPatients = demoPatients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.primaryDiagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const needsReviewTasks = taskList.filter((t) => t.status === 'needs-review');
  const overdueTasks = taskList.filter((t) => t.status === 'overdue');

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary pb-20">
      {/* Coordinator Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <span className="font-bold text-base text-text-primary hidden sm:inline">
                CareFlow <span className="text-primary-600">AI</span>
              </span>
            </Link>
            <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
              Doctor & Coordinator Portal
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/patient"
              className="text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-xl transition-colors hidden sm:flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" /> Switch to Patient View
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-border-light text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">
                MP
              </div>
              <div className="text-left hidden md:block">
                <div className="font-semibold text-text-primary leading-tight">Dr. Meera Patel</div>
                <div className="text-[11px] text-text-muted">Chief Cardiology Follow-up</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-text-muted hover:text-coral-600 rounded-lg hover:bg-coral-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Banner notification for interactive feedback */}
        <AnimatePresence>
          {actionNotice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl bg-emerald-600 text-white font-medium text-xs flex items-center justify-between shadow-md"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-100" />
                <span>{actionNotice}</span>
              </div>
              <button onClick={() => setActionNotice(null)} className="text-emerald-100 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Title & Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Care Coordination Command Center
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              “Which patients or follow-ups need my attention today?”
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-surface-secondary border border-border px-3 py-1.5 rounded-xl text-text-secondary flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Autonomous Verification Active
            </span>
          </div>
        </div>

        {/* Stat Cards Overview */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary-500" /> Total Patients
            </div>
            <div className="mt-2 text-2xl font-bold text-text-primary">{demoDashboardStats.totalPatients}</div>
            <div className="mt-1 text-[11px] text-text-muted">Active cohort</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-amber-500" /> Pending Follow-ups
            </div>
            <div className="mt-2 text-2xl font-bold text-text-primary">{demoDashboardStats.pendingFollowUps}</div>
            <div className="mt-1 text-[11px] text-amber-600 font-medium">In scheduled progress</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-primary-500" /> Upcoming
            </div>
            <div className="mt-2 text-2xl font-bold text-text-primary">{demoDashboardStats.upcomingDeadlines}</div>
            <div className="mt-1 text-[11px] text-text-muted">Due within 48h</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-coral-200 bg-coral-50/30 shadow-2xs">
            <div className="text-xs font-semibold text-coral-800 uppercase tracking-wider flex items-center gap-1.5">
              <ClockAlert className="w-3.5 h-3.5 text-coral-600" /> Overdue Items
            </div>
            <div className="mt-2 text-2xl font-bold text-coral-600">{overdueTasks.length}</div>
            <div className="mt-1 text-[11px] text-coral-700 font-medium">Requires follow-up</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-2xs">
            <div className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Needs Review
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-600">{needsReviewTasks.length}</div>
            <div className="mt-1 text-[11px] text-amber-700 font-medium">AI detected uncertainty</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-border shadow-2xs">
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5 text-coral-500" /> Escalations
            </div>
            <div className="mt-2 text-2xl font-bold text-text-primary">
              {escalationList.filter((e) => e.status !== 'resolved').length}
            </div>
            <div className="mt-1 text-[11px] text-coral-600 font-medium">Open care tickets</div>
          </div>
        </div>

        {/* Navigation Tabs & Search */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-light pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Priority Tray' },
              { id: 'queue', label: `Patient Queue (${filteredPatients.length})` },
              { id: 'review', label: `Needs Review (${needsReviewTasks.length})` },
              { id: 'escalations', label: `Escalations (${escalationList.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-2xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients or diagnosis..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-border rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6 space-y-6">
          {/* TAB 1: OVERVIEW & PRIORITY TRAY */}
          {(activeTab === 'overview' || activeTab === 'review') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Needs Review Queue Column */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                        <AlertTriangle className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                          Needs Review Queue
                        </h2>
                        <p className="text-xs text-text-secondary">
                          AI flagged missing dates, ambiguous clinical text, or low confidence
                        </p>
                      </div>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                      {needsReviewTasks.length} Pending
                    </span>
                  </div>

                  <div className="space-y-4">
                    {needsReviewTasks.map((item) => (
                      <div key={item.id} className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-text-primary">
                                {item.patientId === 'P001' ? 'Arun Kumar' : 'Priya Sharma'}
                              </span>
                              <StatusBadge status="needs-review" size="sm" />
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary mt-1">{item.title}</h4>
                            <p className="text-xs text-text-secondary mt-0.5">{item.description}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApprove(item.id, item.title)}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => {
                                const pt = demoPatients.find((p) => p.id === item.patientId);
                                if (pt) setInspectedPatient(pt);
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-white border border-border text-text-primary rounded-xl hover:bg-surface-secondary transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> Source
                            </button>
                          </div>
                        </div>

                        {item.sourceEvidence && (
                          <SourceEvidenceTag evidence={item.sourceEvidence} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overdue Items Alert */}
                {overdueTasks.length > 0 && (
                  <div className="bg-white rounded-2xl border border-coral-200 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-coral-50 text-coral-700 flex items-center justify-center border border-coral-200">
                        <ClockAlert className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-coral-900 uppercase tracking-wider">
                          Overdue Follow-Up Actions
                        </h2>
                        <p className="text-xs text-coral-700">Immediate coordinator outreach recommended</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {overdueTasks.map((ot) => (
                        <div key={ot.id} className="p-3.5 rounded-xl bg-coral-50/50 border border-coral-200 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-coral-900">Mohammed Faiz (P003)</span>
                              <StatusBadge status="overdue" size="sm" />
                            </div>
                            <p className="text-xs text-coral-800 font-medium mt-1">{ot.title}</p>
                            <p className="text-[11px] text-coral-600 mt-0.5">Missed deadline: {ot.dueDate}</p>
                          </div>
                          <button
                            onClick={() => handleApprove(ot.id, ot.title)}
                            className="px-3 py-1 text-xs font-semibold bg-coral-600 text-white rounded-xl hover:bg-coral-700 shadow-2xs"
                          >
                            Mark Handled
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Open Escalations & Recent Activity */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center justify-between">
                    <span>Active Escalation Tickets</span>
                    <span className="text-xs text-coral-600 font-semibold">{escalationList.length} Total</span>
                  </h3>
                  <div className="space-y-3">
                    {escalationList.map((esc) => (
                      <div
                        key={esc.id}
                        className={`p-3 rounded-xl border text-xs ${
                          esc.status === 'resolved'
                            ? 'bg-sage-50 border-sage-200 opacity-60'
                            : 'bg-surface-secondary border-border-light'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-text-primary">{esc.patientName}</span>
                          <EscalationBadge level={esc.level} />
                        </div>
                        <p className="text-text-secondary mt-1 text-[11px] leading-relaxed">{esc.reason}</p>
                        <div className="mt-2 flex items-center justify-between pt-2 border-t border-border-light text-[10px]">
                          <span className="text-text-muted">Status: {esc.status}</span>
                          {esc.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveEscalation(esc.id)}
                              className="text-primary-600 font-bold hover:underline"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reminder History Log */}
                <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-primary-500" /> Automated Reminder Logs
                  </h3>
                  <div className="space-y-2.5">
                    {demoReminders.map((rem) => (
                      <div key={rem.id} className="p-2.5 rounded-xl bg-surface-secondary border border-border-light text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-primary">{rem.taskTitle}</span>
                          <span className="capitalize text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-border text-text-muted">
                            {rem.channel}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-secondary mt-1 flex items-center justify-between">
                          <span>Status: <strong>{rem.status}</strong></span>
                          <span>Retries: {rem.retryCount}/{rem.maxRetries}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT QUEUE TABLE */}
          {(activeTab === 'queue' || activeTab === 'overview') && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-600" /> Discharged Patient Cohort Queue
                </h3>
                <span className="text-xs text-text-muted">{filteredPatients.length} Active Patients</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-secondary text-text-muted uppercase text-[10px] tracking-wider border-y border-border-light">
                    <tr>
                      <th className="py-3 px-4">Patient Name & ID</th>
                      <th className="py-3 px-4">Primary Diagnosis</th>
                      <th className="py-3 px-4">Discharge Date</th>
                      <th className="py-3 px-4">Attending Physician</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-light">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-primary-50/20 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-text-primary">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-[10px]">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div>{p.name}</div>
                              <div className="text-[10px] text-text-muted font-normal">MRN: {p.id} • {p.age}y / {p.gender}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary">{p.primaryDiagnosis}</td>
                        <td className="py-3.5 px-4 text-text-secondary">{p.dischargeDate}</td>
                        <td className="py-3.5 px-4 text-text-secondary">{p.attendingPhysician}</td>
                        <td className="py-3.5 px-4">
                          <span className="bg-surface-secondary px-2 py-0.5 rounded text-[10px] font-medium border border-border-light">
                            {p.preferredLanguage}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setInspectedPatient(p)}
                            className="px-2.5 py-1 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ESCALATIONS FULL VIEW */}
          {activeTab === 'escalations' && (
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-coral-600" /> All Clinical & Coordinator Escalations
              </h3>
              <div className="space-y-4">
                {escalationList.map((esc) => (
                  <div key={esc.id} className="p-4 rounded-xl border border-border bg-surface-secondary">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-text-primary">{esc.patientName}</h4>
                          <EscalationBadge level={esc.level} />
                          <span className="text-[11px] text-text-muted capitalize">({esc.category})</span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{esc.reason}</p>
                      </div>
                      {esc.status !== 'resolved' ? (
                        <button
                          onClick={() => handleResolveEscalation(esc.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-2xs"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-bold">✓ Resolved</span>
                      )}
                    </div>
                    {esc.sourceEvidence && (
                      <SourceEvidenceTag evidence={esc.sourceEvidence} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Patient Record Modal Inspection */}
      <AnimatePresence>
        {inspectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-border relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setInspectedPatient(null)}
                className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-sm">
                  {inspectedPatient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">{inspectedPatient.name}</h3>
                  <p className="text-xs text-text-muted">MRN: {inspectedPatient.id} • {inspectedPatient.gender}, {inspectedPatient.age} yo</p>
                </div>
              </div>

              <div className="space-y-3 text-xs border-t border-border-light pt-4">
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Primary Diagnosis</span>
                  <span className="text-text-primary font-medium">{inspectedPatient.primaryDiagnosis}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Admitted</span>
                    <span className="text-text-primary">{inspectedPatient.admissionDate}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Discharged</span>
                    <span className="text-text-primary">{inspectedPatient.dischargeDate}</span>
                  </div>
                </div>
                <div>
                  <span className="text-text-muted block text-[10px] uppercase font-bold">Attending Physician</span>
                  <span className="text-text-primary">{inspectedPatient.attendingPhysician}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Phone</span>
                    <span className="text-text-primary">{inspectedPatient.contactPhone}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px] uppercase font-bold">Preferred Language</span>
                    <span className="text-text-primary">{inspectedPatient.preferredLanguage}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border-light flex justify-end gap-2">
                <button
                  onClick={() => setInspectedPatient(null)}
                  className="px-4 py-2 text-xs font-semibold bg-surface-secondary text-text-primary rounded-xl border border-border hover:bg-sage-100"
                >
                  Close
                </button>
                <Link
                  to="/patient"
                  className="px-4 py-2 text-xs font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 shadow-2xs"
                >
                  Open Patient Portal View
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
