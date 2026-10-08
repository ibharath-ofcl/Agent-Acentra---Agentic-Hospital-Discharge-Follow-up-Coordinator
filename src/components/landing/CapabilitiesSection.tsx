import {
  Bot,
  FileSearch,
  Workflow,
  HeartPulse,
  Languages,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const capabilities = [
  {
    icon: Bot,
    title: 'Agentic AI',
    description:
      'Coordinates intake, clinical parsing, safety validation, task scheduling, reminders, and escalation through an autonomous, multi-step agentic workflow.',
    tag: 'Autonomous Coordination',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: FileSearch,
    title: 'Document Intelligence',
    description:
      'Converts unstructured hospital discharge summaries, clinical notes, and scanned PDFs into structured appointments, diagnostic tests, referrals, and medication regimens.',
    tag: 'EHR & PDF Parsing',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: Workflow,
    title: 'Task Orchestration',
    description:
      'Synthesizes prioritized, time-bound tasks and assigns them clearly to the patient, family caregivers, and hospital care team with verified calendar deadlines.',
    tag: 'Timeline Synthesis',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Workflow',
    description:
      'Purpose-built specifically for post-discharge recovery. Understands inpatient-to-outpatient transitions, clinical urgency levels, and hospital care team hierarchies.',
    tag: 'Clinical Alignment',
    color: 'text-rose-900 bg-rose-50 border-rose-200',
  },
  {
    icon: Languages,
    title: 'Multilingual AI',
    description:
      'Translates dense medical jargon into patient-friendly, 6th-grade reading level instructions across English, Hindi, Tamil, and Spanish to maximize adherence.',
    tag: 'Plain-Language AI',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: MapPin,
    title: 'Provider Matching',
    description:
      'Connects follow-up orders with attending specialists based on clinical discipline, hospital network affiliation, geographic proximity, and availability.',
    tag: 'In-Network Matching',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: 'Clinical Safety',
    description:
      'Strict human-in-the-loop guardrail that detects ambiguities, missing timeframes, and sensitive clinical inquiries, routing them directly to clinicians with exact source citations.',
    tag: 'Human-in-the-Loop',
    color: 'text-amber-900 bg-amber-50 border-amber-200',
  },
];

export function CapabilitiesSection() {
  return (
    <section id="product" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            Official Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Enterprise Post-Discharge Healthcare
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Seven core capabilities engineered to extract, orchestrate, and govern discharge recovery with clinical precision.
          </p>
        </div>

        {/* 7 Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              whileHover={{ y: -3 }}
              className={`p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md ${
                i === 6 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${cap.color} shadow-xs`}>
                    <cap.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {cap.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center gap-1.5 text-[11px] font-bold text-teal-900">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enterprise Grade Capability</span>
              </div>
            </motion.div>
          ))}

          {/* 8th Balancing Summary Card: Hospital Trust Standard */}
          <div className="p-6 rounded-2xl border border-teal-200 bg-teal-50/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-teal-300 bg-teal-100 text-teal-900 shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-teal-800" />
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Acentra Compliant
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                Non-Diagnostic Safety Architecture
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                CareFlow AI coordinates logistics and timelines. It never diagnoses medical conditions, alters prescriptions, or replaces physician authority.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-teal-200 flex items-center justify-between text-[11px] font-bold text-teal-950">
              <span>Strict Clinician Oversight</span>
              <span className="font-mono text-emerald-700">100% Traceable</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
