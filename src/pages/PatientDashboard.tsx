import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Info,
  PhoneCall,
  Download,
} from 'lucide-react';
import {
  currentPatient,
  demoFollowUpTasks,
  demoTests,
  demoMedications,
  demoCareInstructions,
  demoWarnings,
  demoDocuments,
  demoPatientProgress,
} from '../data/demoData';
import { StatusBadge, PriorityBadge } from '../components/common/StatusBadge';
import { SourceEvidenceTag } from '../components/common/SourceEvidenceTag';
import { useAuth } from '../hooks/useAuth';

const languages = [
  { code: 'en', name: 'English (US)' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'es', name: 'Español' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
];

export function PatientDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState<'all' | 'appointments' | 'tests' | 'meds' | 'safety'>('all');
  const [acknowledgedReminder, setAcknowledgedReminder] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find next action
  const nextAction = demoFollowUpTasks.find((t) => t.status === 'pending') || demoFollowUpTasks[0];
  const needsReviewTasks = demoFollowUpTasks.filter((t) => t.status === 'needs-review');

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary pb-16">
      {/* Patient Header */}
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
            <span className="text-xs bg-primary-50 text-primary-700 font-semibold px-2.5 py-1 rounded-full border border-primary-200">
              Patient Portal
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 bg-surface-secondary border border-border px-2.5 py-1.5 rounded-xl text-xs font-medium">
              <Globe className="w-3.5 h-3.5 text-text-muted" />
              <select
                value={selectedLanguage}
                aria-label="Language selector"
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient quick badge */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border-light text-xs">
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                AK
              </div>
              <div className="text-left">
                <div className="font-semibold text-text-primary leading-tight">{currentPatient.name}</div>
                <div className="text-[11px] text-text-muted">MRN: {currentPatient.id}</div>
              </div>
            </div>

            {/* Logout button */}
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
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-light">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
              Welcome home, {currentPatient.name}
            </h1>
            <p className="mt-1 text-sm text-text-secondary flex items-center gap-2 flex-wrap">
              <span>Discharged from City General Hospital on {currentPatient.dischargeDate}</span>
              <span className="text-text-muted">•</span>
              <span className="text-primary-700 font-medium">Attending: {currentPatient.attendingPhysician}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/doctor"
              className="px-3 py-2 text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5" /> Switch to Doctor View
            </Link>
          </div>
        </div>

        {/* Primary Action Hero: "What do I need to do next?" */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border-2 border-primary-500/30 p-6 sm:p-7 shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-primary-600 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Next Important Action
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase text-primary-600 tracking-wider">
                      Priority Step
                    </span>
                    <StatusBadge status={nextAction.status} />
                    <PriorityBadge priority={nextAction.priority} />
                  </div>

                  <h2 className="mt-1 text-xl font-bold text-text-primary">
                    {nextAction.title}
                  </h2>
                  <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                    {nextAction.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-text-secondary bg-surface-secondary p-3 rounded-xl border border-border-light">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary-600" />
                      <span>Target Date: <strong className="text-text-primary">{nextAction.dueDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-teal-600" />
                      <span>Specialist: <strong>Dr. Meera Patel (Cardiology)</strong></span>
                    </div>
                  </div>

                  {nextAction.sourceEvidence && (
                    <SourceEvidenceTag evidence={nextAction.sourceEvidence} />
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Follow-up Progress Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">
                    Discharge Plan Progress
                  </h3>
                  <span className="text-xs font-semibold text-primary-600">
                    {demoPatientProgress.percentage}% Done
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 w-full bg-surface-secondary rounded-full h-2.5 overflow-hidden border border-border-light">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700"
                    style={{ width: `${demoPatientProgress.percentage}%` }}
                  />
                </div>

                <div className="mt-5 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border-light">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Completed Tasks
                    </span>
                    <span className="font-bold text-emerald-600">{demoPatientProgress.completed}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border-light">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Follow-ups
                    </span>
                    <span className="font-bold text-text-primary">{demoPatientProgress.pending}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Needs Care Team Review
                    </span>
                    <span className="font-bold text-amber-600">{demoPatientProgress.needsReview}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border-light text-[11px] text-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Synchronized with Hospital EHR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Call Reminder Notification Banner */}
        <div className="mt-6 p-4 rounded-2xl bg-primary-50 border border-primary-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0">
              <PhoneCall className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-primary-900 uppercase">Follow-up Call Scheduled</span>
                <span className="text-[10px] bg-primary-200/70 text-primary-800 font-semibold px-2 py-0.5 rounded-full">
                  Automated Reminder
                </span>
              </div>
              <p className="text-xs text-primary-800 mt-0.5">
                Our care coordinator AI will place a 30-second reminder call on <strong>Oct 14 at 10:00 AM</strong> regarding your Cardiology check-up.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAcknowledgedReminder(true)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-primary-700 border border-primary-300 hover:bg-primary-100 transition-colors shrink-0 shadow-2xs"
          >
            {acknowledgedReminder ? '✓ Confirmed' : 'Acknowledge Reminder'}
          </button>
        </div>

        {/* Tab Navigation Filter */}
        <div className="mt-8 flex items-center gap-2 border-b border-border-light overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Tasks & Timeline' },
            { id: 'appointments', label: 'Doctor Appointments' },
            { id: 'tests', label: 'Tests & Labs' },
            { id: 'meds', label: 'Medications' },
            { id: 'safety', label: 'Warning Signs' },
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

        {/* Dynamic Content Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main List Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Needs Review Alert Tray (If any items need care team attention) */}
            {needsReviewTasks.length > 0 && (activeTab === 'all' || activeTab === 'appointments') && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Attention: Items Pending Care Coordinator Review
                  </h3>
                </div>
                <div className="space-y-3">
                  {needsReviewTasks.map((task) => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-text-primary">{task.title}</h4>
                            <StatusBadge status="needs-review" size="sm" />
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                        </div>
                      </div>
                      {task.sourceEvidence && (
                        <SourceEvidenceTag evidence={task.sourceEvidence} />
                      )}
                      <div className="mt-2 text-[11px] text-amber-800 bg-amber-100/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>The AI flagged this because the date was not clearly specified in your discharge notes. Dr. Patel's coordinator has been notified to schedule this for you.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up Tasks List */}
            {(activeTab === 'all' || activeTab === 'appointments') && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-600" /> Upcoming Follow-up Tasks
                  </h3>
                  <span className="text-xs text-text-muted">{demoFollowUpTasks.length} items extracted</span>
                </div>

                <div className="divide-y divide-border-light">
                  {demoFollowUpTasks.map((task) => (
                    <div key={task.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-text-primary">{task.title}</h4>
                            <StatusBadge status={task.status} size="sm" />
                            <PriorityBadge priority={task.priority} />
                          </div>
                          <p className="text-xs text-text-secondary mt-1">{task.description}</p>
                          <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-primary-500" /> Due: {task.dueDate}
                              </span>
                            )}
                            <span className="capitalize bg-surface-secondary px-2 py-0.5 rounded text-[11px] font-medium border border-border-light">
                              {task.category}
                            </span>
                          </div>
                        </div>
                      </div>

                      {task.sourceEvidence && (
                        <SourceEvidenceTag evidence={task.sourceEvidence} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tests & Diagnostic Timeline */}
            {(activeTab === 'all' || activeTab === 'tests') && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" /> Required Tests & Diagnostics
                </h3>
                <div className="space-y-3">
                  {demoTests.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-xl border border-border-light bg-surface-secondary">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">{t.testName}</span>
                        <StatusBadge status={t.status} size="sm" />
                      </div>
                      <div className="mt-1 text-xs text-text-secondary flex items-center gap-3">
                        <span>Category: {t.category}</span>
                        {t.scheduledDate && <span>Target: {t.scheduledDate}</span>}
                      </div>
                      {t.results && (
                        <div className="mt-2 text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg border border-emerald-200">
                          <strong>Recorded Result:</strong> {t.results}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {(activeTab === 'all' || activeTab === 'meds') && (
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-coral-600" /> Prescribed Discharge Medications
                </h3>
                <div className="space-y-3">
                  {demoMedications.map((med) => (
                    <div key={med.id} className="p-4 rounded-xl border border-border-light bg-surface-secondary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-primary">{med.medicationName}</span>
                          <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded font-medium border border-primary-200">
                            {med.dosage}
                          </span>
                        </div>
                        <span className="text-xs text-text-muted">{med.frequency}</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5">{med.instructions}</p>
                      {med.warnings && (
                        <div className="mt-2 text-[11px] text-coral-700 bg-coral-50 p-2 rounded border border-coral-200">
                          ⚠️ {med.warnings[0]}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Warning Signs & Emergency Protocols */}
            <div className="bg-coral-50/60 rounded-2xl border border-coral-200 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <HeartPulse className="w-5 h-5 text-coral-600" />
                <h3 className="text-sm font-bold text-coral-900 uppercase tracking-wider">
                  Red Flag Warning Signs
                </h3>
              </div>
              <p className="text-xs text-coral-800 leading-relaxed mb-4">
                If you experience any of these symptoms post-discharge, seek immediate medical attention:
              </p>
              <div className="space-y-2.5">
                {demoWarnings.map((w) => (
                  <div key={w.id} className="p-3 bg-white rounded-xl border border-coral-200 text-xs">
                    <div className="font-bold text-coral-900 flex items-center justify-between">
                      <span>{w.symptom}</span>
                      <span className="text-[10px] uppercase font-black text-coral-600 tracking-wider">
                        {w.severity}
                      </span>
                    </div>
                    <div className="text-text-secondary mt-1 font-medium">{w.action}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simple Care Instructions */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" /> Patient-Friendly Instructions
              </h3>
              <div className="space-y-3">
                {demoCareInstructions.map((ci) => (
                  <div key={ci.id} className="p-3 rounded-xl bg-surface-secondary border border-border-light text-xs">
                    <div className="font-semibold text-text-primary">{ci.title}</div>
                    <div className="text-text-secondary mt-1 leading-normal">{ci.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Discharge Document */}
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sage-600" /> Source Discharge Document
              </h3>
              {demoDocuments.map((doc) => (
                <div key={doc.id} className="p-3 rounded-xl border border-border-light bg-surface-secondary flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-text-primary truncate">{doc.fileName}</p>
                    <p className="text-[11px] text-text-muted mt-0.5">{doc.pageCount} pages • Processed</p>
                  </div>
                  <button className="p-2 text-text-muted hover:text-primary-600 rounded-lg hover:bg-white transition-colors" title="Download Document (Simulated)">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="mt-3 text-[11px] text-text-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Extracted and verified by CareFlow AI Document Intelligence</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
