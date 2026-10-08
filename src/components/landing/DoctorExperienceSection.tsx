import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  ClockAlert,
  HelpCircle,
  FileSearch,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';

const doctorFeatures = [
  { icon: Users, label: 'Centralized Patient Queue', desc: 'Real-time overview of active discharged patients and documented urgency.' },
  { icon: ClockAlert, label: 'Upcoming Deadlines & Overdue Tasks', desc: 'Prioritize by critical time windows, test results, and missed visits.' },
  { icon: HelpCircle, label: '"Needs Review" Escalation Tray', desc: 'Direct access to items where AI detected ambiguous or missing discharge data.' },
  { icon: FileSearch, label: 'Source Document Provenance', desc: 'Inspect exact source quotes and page numbers from discharge records.' },
  { icon: CheckCircle2, label: 'Approve, Edit & Override', desc: 'One-click clinical approval or manual follow-up timeline correction.' },
  { icon: AlertOctagon, label: 'Care Coordination Priority', desc: 'Three-tier ranking: 🔴 Immediate Review, 🟠 High Priority, 🟢 Routine.' },
];

export function DoctorExperienceSection() {
  return (
    <section id="for-care-teams" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#008742] animate-pulse-soft" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Care Coordinator Live Stream
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  4 Actions Pending Review
                </span>
              </div>

              {/* Synthetic preview card */}
              <div className="mt-4 p-4 rounded-xl border border-amber-300 bg-amber-50/40">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-amber-200 text-amber-900 mb-1.5 border border-amber-300">
                      Needs Human Review
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">
                      Priya Sharma — Follow-up Date Ambiguous
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      Summary specifies: "Dietitian consult recommended" without target timeframe.
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <Link
                      to="/doctor"
                      className="px-2.5 py-1 text-xs font-bold bg-[#052429] text-[#00e575] hover:bg-[#072d33] rounded-lg transition-colors shadow-2xs"
                    >
                      Triage
                    </Link>
                  </div>
                </div>
                <div className="mt-3 pt-2.5 border-t border-amber-200 flex items-center justify-between text-[11px] text-amber-950 font-mono">
                  <span>Source: Discharge Note • Page 3</span>
                  <span className="font-semibold text-amber-900">OCR Confidence: 68%</span>
                </div>
              </div>

              {/* Second item: Routine On-Track */}
              <div className="mt-3 p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">Arun Kumar</h4>
                      <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                        Priority #1: Immediate Review
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Cardiology Follow-up: 15 Oct 2026</p>
                  </div>
                  <Link to="/doctor" className="text-xs text-teal-800 hover:underline font-bold">
                    Open Queue →
                  </Link>
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
            <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
              For Care Teams & Doctors
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Triage With Confidence. Catch What Falls Through the Cracks.
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              Care coordinators and attending physicians gain a command center that surfaces
              overdue check-ups, non-responsive reminders, and ambiguities that require clinical
              clarification.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              {doctorFeatures.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 mt-0.5 border border-teal-200">
                    <f.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">{f.label}</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                to="/doctor"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#052429] hover:bg-[#072d33] rounded-xl shadow-xs transition-colors"
              >
                Launch Doctor Command Center
                <ArrowRight className="w-4 h-4 text-[#00e575]" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
