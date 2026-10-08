import {
  Upload,
  ScanSearch,
  AlertTriangle,
  ListChecks,
  BellRing,
  UserCheck,
} from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Discharge Summary',
    description: 'Hospital discharge records and clinical summaries are uploaded to CareFlow AI for intake.',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    icon: ScanSearch,
    title: 'Extract Follow-up Information',
    description: 'Autonomous extraction parses specialist visits, lab tests, referrals, and medication reconciliations.',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    icon: AlertTriangle,
    title: 'Validate & Detect Uncertainty',
    description: 'The system flags missing dates, ambiguous clinical statements, or conflicting directives.',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    icon: ListChecks,
    title: 'Build Follow-up Tasks',
    description: 'Structured tasks with calendar milestones are generated for patient and care team visibility.',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    icon: BellRing,
    title: 'Remind & Track',
    description: 'Automated informational reminders reach out to patients, tracking task progress.',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    icon: UserCheck,
    title: 'Escalate to Human Reviewer',
    description: 'Unresolved or clinically sensitive items escalate to attending physicians or care coordinators.',
    color: 'bg-red-50 text-red-800 border-red-200',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
            Workflow Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CareFlow AI Works
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            From unstructured discharge PDFs to verified clinical follow-up in six structured stages.
          </p>
        </div>

        {/* Steps - 6 cards in symmetrical 2x3 or 3x2 grid with equal heights */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Step number and icon */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.color} shadow-xs`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-teal-800 transition-colors bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    STAGE 0{i + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-teal-800 font-semibold">
                <span>Verified Step 0{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
