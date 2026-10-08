import {
  Upload,
  ScanSearch,
  AlertTriangle,
  ListChecks,
  BellRing,
  UserCheck,
  CheckCircle2,
  FileCheck2,
  GitBranch,
} from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Discharge Record Ingestion',
    description: 'Hospital EHR summaries and clinical encounter documents are ingested through HL7 FHIR or secure PDF intake.',
    input: 'Unstructured EHR Summary PDF',
    output: 'Raw Clinical Text & Entities',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
    tag: 'EHR Intake',
  },
  {
    icon: ScanSearch,
    title: 'Clinical Entity Normalization',
    description: 'Autonomous extraction parses follow-up specialist visits, lab diagnostics, dietary guidelines, and medication reconciliations.',
    input: 'Clinical Narrative & Orders',
    output: 'Structured ICD-10 / LOINC Entities',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tag: 'AI Understanding',
  },
  {
    icon: AlertTriangle,
    title: 'Deterministic Safety Gate',
    description: 'The system validates extracted orders against missing target dates, ambiguous phrasing, or conflicting medication directions.',
    input: 'Extracted Entity Array',
    output: 'Validated Items / Flagged Queue',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    tag: 'Zero-Guessing Gate',
  },
  {
    icon: ListChecks,
    title: 'Care Plan & Timeline Synthesis',
    description: 'Verified instructions are synthesized into a 30-day chronological recovery plan with milestone deadlines and priority tiers.',
    input: 'Validated Clinical Orders',
    output: 'Patient & Doctor Care Timeline',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
    tag: 'Timeline Engine',
  },
  {
    icon: BellRing,
    title: 'Multimodal Outreach & Tracking',
    description: 'Automated informational reminders reach out to patients via phone call and SMS in their preferred language (EN, HI, TA).',
    input: 'Scheduled Milestones',
    output: 'Call Audio, SMS, Adherence Log',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tag: 'Patient Adherence',
  },
  {
    icon: UserCheck,
    title: 'Human Review & Closed-Loop Closure',
    description: 'Unresolved ambiguities or missed patient deadlines escalate directly to attending physicians and care coordinators.',
    input: 'Exceptions & Completed Visits',
    output: 'Physician Sign-off & Case Close',
    color: 'bg-red-50 text-red-800 border-red-200',
    tag: 'Clinician Oversight',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-900 bg-teal-100 border border-teal-200 mb-3">
            <GitBranch className="w-3.5 h-3.5 text-teal-700" />
            Acentra Clinical Workflow Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CareFlow AI Works
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            From unstructured hospital discharge summaries to verified outpatient follow-up in six deterministic, clinical-grade stages.
          </p>
        </div>

        {/* Steps Grid - Symmetrical 3x2 Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Header with Step Number and Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.color} shadow-xs`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      {step.tag}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      0{i + 1}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              {/* Data Flow Tags */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-700">In:</span>
                  <span className="truncate max-w-[200px] font-mono text-slate-600">{step.input}</span>
                </div>
                <div className="flex items-center justify-between text-teal-800">
                  <span className="font-semibold">Out:</span>
                  <span className="truncate max-w-[200px] font-mono font-medium">{step.output}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Clinical Assurance Callout */}
        <div className="mt-12 bg-white rounded-xl border border-teal-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                100% EHR Source Traceability Guarantee
              </div>
              <div className="text-xs text-slate-600">
                Every extracted appointment, lab test, and task links directly to the specific page and line of the source hospital discharge record.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 bg-teal-50 px-3.5 py-2 rounded-xl border border-teal-200 whitespace-nowrap">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Zero Autonomous Hallucinations
          </div>
        </div>
      </div>
    </section>
  );
}
