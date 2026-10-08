import { motion } from 'framer-motion';
import {
  Users,
  ClockAlert,
  HelpCircle,
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

const doctorFeatures = [
  { icon: Users, label: 'Centralized Patient Queue', desc: 'Real-time overview of active discharged patients and risk tiers.' },
  { icon: ClockAlert, label: 'Upcoming Deadlines & Overdue Tasks', desc: 'Prioritize by critical timelines, test results, and missing visits.' },
  { icon: HelpCircle, label: '"Needs Review" Escalation Tray', desc: 'Direct access to items where AI detected ambiguous or missing discharge data.' },
  { icon: FileSearch, label: 'Source Document Provenance', desc: 'Inspect exact source quotes and page numbers from discharge records.' },
  { icon: CheckCircle2, label: 'Approve, Edit & Override', desc: 'One-click clinical approval or manual timeline correction.' },
  { icon: AlertOctagon, label: 'Care Team Escalation Routing', desc: 'Directly escalate critical non-responsive patients to assigned nurses or doctors.' },
];

export function DoctorExperienceSection() {
  return (
    <section id="for-care-teams" className="py-20 sm:py-28 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1 mt-10 lg:mt-0"
          >
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border-light">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                  <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">
                    Care Coordinator Live Stream
                  </span>
                </div>
                <span className="text-xs font-medium text-text-muted bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200">
                  3 Actions Pending Review
                </span>
              </div>

              {/* Synthetic preview card */}
              <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase rounded bg-amber-200 text-amber-800 mb-1.5">
                      Needs Review
                    </span>
                    <h4 className="text-sm font-semibold text-text-primary">
                      Priya Sharma — Follow-up Date Ambiguous
                    </h4>
                    <p className="text-xs text-text-secondary mt-1">
                      Summary specifies: "Dietitian consult recommended" without target timeframe.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1 text-xs font-medium bg-white text-text-primary border border-border rounded-lg shadow-2xs hover:bg-sage-50 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-sage-600" /> View
                    </button>
                    <button className="px-2.5 py-1 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-2xs">
                      Resolve
                    </button>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-amber-900">
                  <span>Source: Discharge Note (Pg 3)</span>
                  <span className="font-medium text-amber-700">Confidence: 68% (Below 80% Threshold)</span>
                </div>
              </div>

              {/* Second item */}
              <div className="mt-3 p-4 rounded-xl border border-border-light bg-surface-secondary">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-text-primary">Arun Kumar</h4>
                      <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        On Track
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">Cardiology Consult: Oct 15, 2026</p>
                  </div>
                  <SlidersHorizontal className="w-4 h-4 text-text-muted" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              For Care Teams & Doctors
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Triage With Confidence. Catch What Falls Through the Cracks.
            </h2>
            <p className="mt-4 text-text-secondary text-lg leading-relaxed">
              Care coordinators and attending physicians gain a command center that surfaces
              overdue check-ups, non-responsive reminders, and ambiguities that require clinical
              clarification.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {doctorFeatures.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 mt-0.5 border border-primary-100">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{f.label}</h3>
                    <p className="text-xs text-text-secondary mt-0.5 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
