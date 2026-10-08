import { Link } from 'react-router-dom';
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
    <section className="relative pt-36 pb-20 sm:pt-44 sm:pb-28 bg-[#052429] text-white overflow-hidden border-b border-[#0a383f]">
      {/* Subtle deep glow accents */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#0e4851]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-[350px] h-[350px] bg-[#00e575]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Clinical governance pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0a383f] text-[#00e575] border border-[#0e4851] mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse-soft" />
            Agentic Healthcare Post-Discharge Coordination
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.14] text-center">
            From Discharge Instructions <br className="hidden sm:inline" />
            to Follow-up —{' '}
            <span className="text-[#00e575]">
              Automatically Coordinated.
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal text-center">
            CareFlow AI turns complex hospital discharge summaries into a clear, trackable
            follow-up plan — while keeping human clinicians firmly in the loop whenever information is
            unclear, missing, or clinically sensitive.
          </p>

          {/* Primary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
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
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#00e575] shrink-0" />
            <span>Strict human-in-the-loop safety • Synthetic demonstration environment</span>
          </div>
        </div>

        {/* Complete Visual Workflow Diagram */}
        <div className="mt-16 sm:mt-20 max-w-5xl mx-auto">
          <div className="bg-[#072d33] rounded-2xl border border-[#0e4851] p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-5 border-b border-[#0e4851]/80 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#00e575]">
                Complete Closed-Loop Pipeline
              </span>
              <span className="text-xs text-slate-400 font-mono">
                CareFlow Architecture
              </span>
            </div>

            {/* Steps connected pipeline - flex layout with clean wrapping and centered cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-stretch">
              {workflowPipeline.map((step, i) => (
                <div
                  key={step.label}
                  className="flex flex-col items-center justify-between text-center p-3 rounded-xl bg-[#0a383f]/40 border border-[#0e4851]/60 hover:border-[#00e575]/40 transition-all group"
                >
                  <div className="flex flex-col items-center w-full">
                    <div className="w-11 h-11 rounded-xl bg-[#0a383f] border border-[#145e69] flex items-center justify-center text-[#00e575] group-hover:bg-[#00e575] group-hover:text-[#052429] transition-all mb-2.5 shadow-xs">
                      <step.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white leading-tight min-h-[30px] flex items-center justify-center">
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-tight line-clamp-2">
                      {step.desc}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#00e575] font-mono mt-2 font-bold bg-[#052429] px-2 py-0.5 rounded border border-[#0e4851]">
                    0{i + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#0e4851]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-2">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] shrink-0" />
                Zero autonomous guessing: Unresolved instructions escalate to care coordinator.
              </span>
              <Link to="/doctor" className="text-[#00e575] hover:underline font-semibold flex items-center gap-1">
                View Doctor Triage Queue →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
