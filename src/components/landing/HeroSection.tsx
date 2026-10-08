import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Brain,
  ShieldAlert,
  ClipboardList,
  ListTodo,
  PhoneCall,
  UserCheck,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const workflowPipeline = [
  { icon: FileText, label: 'Discharge Summary', desc: 'Hospital EHR Document' },
  { icon: Brain, label: 'AI Understanding', desc: 'Clinical Data Extraction' },
  { icon: ShieldAlert, label: 'Validation', desc: 'Uncertainty & Safety Check' },
  { icon: ClipboardList, label: 'Follow-up Plan', desc: 'Prioritized Actions' },
  { icon: ListTodo, label: 'Tasks & Timeline', desc: 'Calendar & Patient Deadlines' },
  { icon: PhoneCall, label: 'Reminders', desc: 'Informational Follow-up Calls' },
  { icon: UserCheck, label: 'Human Review', desc: 'Doctor & Coordinator Loop' },
];

export function HeroSection() {
  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 bg-[#052429] text-white overflow-hidden border-b border-[#0a383f]">
      {/* Subtle deep glow accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#0e4851]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-[#00e575]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Clinical governance pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0a383f] text-[#00e575] border border-[#0e4851] mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse-soft" />
              Agentic Healthcare Post-Discharge Coordination
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]"
          >
            From Discharge Instructions <br className="hidden sm:inline" />
            to Follow-up —{' '}
            <span className="text-[#00e575]">
              Automatically Coordinated.
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal"
          >
            CareFlow AI turns complex hospital discharge summaries into a clear, trackable
            follow-up plan — while keeping human clinicians firmly in the loop whenever information is
            unclear, missing, or clinically sensitive.
          </motion.p>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Try the Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-200 bg-[#0a383f]/70 border border-[#0e4851] rounded-xl hover:bg-[#0e4851] hover:text-white transition-all"
            >
              Explore How It Works
              <ChevronRight className="w-4 h-4 text-[#00e575]" />
            </a>
          </motion.div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#00e575]" />
            <span>Strict human-in-the-loop safety • Synthetic demonstration environment</span>
          </div>
        </div>

        {/* Complete Visual Workflow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 sm:mt-20 max-w-5xl mx-auto"
        >
          <div className="bg-[#072d33] rounded-2xl border border-[#0e4851] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-5 border-b border-[#0e4851]/80 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00e575]">
                Complete Closed-Loop Pipeline
              </span>
              <span className="text-xs text-slate-400 font-mono">
                CareFlow Architecture
              </span>
            </div>

            {/* Steps connected pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {workflowPipeline.map((step, i) => (
                <div key={step.label} className="relative flex flex-col items-center text-center group">
                  <div className="w-12 h-12 rounded-xl bg-[#0a383f] border border-[#145e69] flex items-center justify-center text-[#00e575] group-hover:bg-[#00e575] group-hover:text-[#052429] transition-all mb-2.5">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-white leading-tight">
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 leading-normal hidden sm:block">
                    {step.desc}
                  </span>
                  {/* Subtle step numbering */}
                  <span className="text-[10px] text-[#00e575] font-mono mt-1 font-semibold">
                    0{i + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#0e4851]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575]" />
                Zero autonomous guessing: Unresolved instructions escalate to care coordinator.
              </span>
              <Link to="/doctor" className="text-[#00e575] hover:underline font-semibold flex items-center gap-1">
                View Doctor Triage Queue →
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
