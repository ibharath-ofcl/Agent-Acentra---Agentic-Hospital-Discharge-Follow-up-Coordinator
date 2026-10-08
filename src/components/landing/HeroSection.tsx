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

const workflowSteps = [
  {
    step: '01',
    icon: FileText,
    label: 'Discharge Summary',
    desc: 'Hospital EHR & clinical discharge record intake',
    highlight: 'Input Record',
  },
  {
    step: '02',
    icon: Brain,
    label: 'AI Understanding',
    desc: 'Entity extraction of labs, appointments & medications',
    highlight: 'Entity Parsing',
  },
  {
    step: '03',
    icon: ShieldAlert,
    label: 'Validation',
    desc: 'Uncertainty detection & missing timeframe flags',
    highlight: 'Safety Check',
  },
  {
    step: '04',
    icon: ClipboardList,
    label: 'Follow-up Plan',
    desc: 'Clinical urgency ranking & provider matching',
    highlight: 'Care Plan',
  },
  {
    step: '05',
    icon: ListTodo,
    label: 'Tasks & Timeline',
    desc: 'Calendar milestones & plain-language instructions',
    highlight: 'Timeline',
  },
  {
    step: '06',
    icon: PhoneCall,
    label: 'Reminders',
    desc: 'Multimodal informational calls & SMS reminders',
    highlight: 'Informational',
  },
  {
    step: '07',
    icon: UserCheck,
    label: 'Human Review',
    desc: 'Doctor & care coordinator sign-off on exceptions',
    highlight: 'Clinician Loop',
  },
];

export function HeroSection() {
  return (
    <section className="relative pt-32 sm:pt-36 lg:pt-40 pb-16 lg:pb-24 bg-[#052429] text-white overflow-hidden border-b border-[#0a383f]">
      {/* Background glow accents */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#0e4851]/50 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-[#00e575]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Header & Mission */}
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Clinical governance tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0a383f] text-[#00e575] border border-[#0e4851] mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#00e575] animate-pulse" />
            Agentic Healthcare Post-Discharge Coordination
          </div>

          {/* User's Exact Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white leading-[1.14] text-center">
            From Discharge Instructions <br className="hidden sm:inline" />
            to Follow-up —{' '}
            <span className="text-[#00e575]">
              Automatically Coordinated.
            </span>
          </h1>

          {/* User's Exact Supporting Message */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal text-center">
            CareFlow AI turns hospital discharge instructions into a clear, trackable
            follow-up plan while keeping humans in the loop whenever information is
            unclear or clinically sensitive.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
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

        {/* STRONG VISUAL WORKFLOW: 7-Step Discharge-to-Resolution Pipeline */}
        <div className="mt-16 lg:mt-20 max-w-6xl mx-auto">
          <div className="bg-[#072d33] rounded-2xl border border-[#0e4851] p-6 sm:p-8 shadow-2xl">
            {/* Visual Workflow Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#0e4851]/80 gap-3 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#00e575] block">
                  Closed-Loop Care Architecture
                </span>
                <h3 className="text-sm font-extrabold text-white mt-0.5">
                  End-to-End Post-Discharge Coordination Pipeline
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-[#00e575]" />
                HL7 / FHIR Intake → Verified Resolution
              </div>
            </div>

            {/* Step Cards Connected Visual Flow */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 items-stretch">
              {workflowSteps.map((step) => (
                <motion.div
                  key={step.label}
                  whileHover={{ y: -3 }}
                  className="flex flex-col justify-between text-center p-3.5 rounded-xl bg-[#0a383f]/50 border border-[#0e4851] hover:border-[#00e575]/60 transition-all group relative"
                >
                  <div>
                    {/* Step Icon & Badge */}
                    <div className="w-11 h-11 rounded-xl bg-[#072d33] border border-[#145e69] flex items-center justify-center text-[#00e575] group-hover:bg-[#00e575] group-hover:text-[#052429] transition-all mx-auto mb-3 shadow-xs">
                      <step.icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-mono font-bold text-[#00e575] bg-[#052429] px-2 py-0.5 rounded border border-[#0e4851] inline-block mb-1.5">
                      STEP {step.step}
                    </span>

                    <h4 className="text-xs font-bold text-white leading-tight min-h-[32px] flex items-center justify-center">
                      {step.label}
                    </h4>

                    <p className="text-[11px] text-slate-300 mt-1 leading-snug line-clamp-3">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#0e4851]/80 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {step.highlight}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pipeline Assurance Footer */}
            <div className="mt-6 pt-4 border-t border-[#0e4851]/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-3">
              <span className="flex items-center gap-2 text-slate-300 text-center sm:text-left">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] shrink-0" />
                Zero autonomous guessing: Unresolved instructions escalate directly to care coordinator tray.
              </span>
              <div className="flex items-center gap-4 shrink-0 font-medium">
                <Link to="/patient" className="text-slate-300 hover:text-[#00e575] transition-colors">
                  Patient View →
                </Link>
                <Link to="/doctor" className="text-[#00e575] hover:text-white font-bold transition-colors">
                  Doctor Command Center →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Metric Ribbon */}
        <div className="mt-12 pt-6 border-t border-[#0e4851]/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-[#072d33]/40 border border-[#0e4851]/60">
            <div className="text-xl sm:text-2xl font-black text-[#00e575]">-28.4%</div>
            <div className="text-xs text-slate-300 mt-0.5">30-Day Readmission Risk</div>
          </div>
          <div className="p-3 rounded-xl bg-[#072d33]/40 border border-[#0e4851]/60">
            <div className="text-xl sm:text-2xl font-black text-white">94.8%</div>
            <div className="text-xs text-slate-300 mt-0.5">Follow-up Adherence</div>
          </div>
          <div className="p-3 rounded-xl bg-[#072d33]/40 border border-[#0e4851]/60">
            <div className="text-xl sm:text-2xl font-black text-[#00e575]">100%</div>
            <div className="text-xs text-slate-300 mt-0.5">EHR Audit Provenance</div>
          </div>
          <div className="p-3 rounded-xl bg-[#072d33]/40 border border-[#0e4851]/60">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">0%</div>
            <div className="text-xs text-slate-300 mt-0.5">Autonomous Guessing</div>
          </div>
        </div>
      </div>
    </section>
  );
}
