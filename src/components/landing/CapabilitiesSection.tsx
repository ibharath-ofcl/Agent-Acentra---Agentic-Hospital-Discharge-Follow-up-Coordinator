import {
  Bot,
  FileSearch,
  Workflow,
  HeartPulse,
  Languages,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

const capabilities = [
  {
    icon: Bot,
    title: 'Agentic Coordinator',
    description: 'Coordinates extraction, validation, task creation, reminders, and escalation through an autonomous multi-step workflow.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: FileSearch,
    title: 'Document Intelligence',
    description: 'Converts unstructured discharge documents into structured appointments, tests, referrals, and medication lists.',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: Workflow,
    title: 'Task Orchestration',
    description: 'Creates prioritized, time-bound tasks and assigns them to the patient and care team with verified deadlines.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Workflow',
    description: 'Purpose-built for post-discharge recovery. Understands clinical context, urgency levels, and hospital care teams.',
    color: 'text-rose-900 bg-rose-50 border-rose-200',
  },
  {
    icon: Languages,
    title: 'Multilingual AI',
    description: 'Patient-friendly instructions can be generated in English, Hindi, Tamil, and Spanish to improve adherence.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: MapPin,
    title: 'Provider Matching',
    description: 'Matches follow-up needs with attending specialists based on clinical discipline, clinic location, and availability.',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: 'Clinical Safety',
    description: 'Unclear or clinically sensitive items are routed directly to human review with exact discharge summary citations.',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: CheckCircle2,
    title: 'Closed-Loop Governance',
    description: 'Maintains continuous status tracking until every post-discharge appointment and diagnostic test is verified.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
];

export function CapabilitiesSection() {
  return (
    <section id="product" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
            System Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Enterprise Healthcare Follow-up
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Purpose-built tools to help ensure discharge follow-ups are extracted accurately, tracked seamlessly, and resolved safely.
          </p>
        </div>

        {/* 8 Symmetrical Cards in 4-column desktop grid (2 rows of 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${cap.color} shadow-xs mb-4`}>
                  <cap.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                  {cap.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] font-bold text-teal-800 uppercase tracking-wider">
                <span>Enterprise Grade</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
