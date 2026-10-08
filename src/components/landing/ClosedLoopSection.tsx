import { RotateCw, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const loopSteps = [
  { label: 'EHR Document Intake', description: 'Autonomous OCR parses discharge summary PDF with 98.4% confidence' },
  { label: 'Clinical Extraction', description: 'Normalizes follow-up visits, diagnostic labs, and medication orders' },
  { label: 'Safety & Uncertainty Gate', description: 'Flags ambiguous timeframes or conflicting instructions for clinician triage' },
  { label: 'Timeline & Task Synthesis', description: 'Structures 30-day chronological milestones with priority rankings' },
  { label: 'Multilingual Outreach', description: 'Delivers informational phone calls & SMS reminders in patient’s language' },
  { label: 'Patient Adherence Tracking', description: 'Monitors appointment confirmation, clinic arrival, and lab attendance' },
  { label: 'Clinician Sign-off & Closure', description: 'Verifies safe recovery completion without 30-day readmission' },
];

export function ClosedLoopSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
            Closed-Loop Healthcare Governance
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Follow-up That Doesn’t Stop at Summarization
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            Most healthcare IT tools simply generate a static PDF summary. CareFlow AI establishes an active,
            closed-loop coordination lifecycle that tracks instructions through to verified resolution.
          </p>
        </div>

        {/* Comparison Grid: Traditional vs CareFlow AI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-14">
          {/* Traditional Fragmented Care (4 cols) */}
          <div className="lg:col-span-5 bg-rose-50/40 rounded-2xl border border-rose-200 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-rose-200 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
                  Traditional Discharge Process
                </span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                  Fragmented & High-Risk
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-rose-950">
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Static Paper Handout:</strong> Patient receives a multi-page summary with dense medical jargon.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Outpatient Visibility:</strong> Hospital care team has no way of knowing if follow-ups were booked.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Silent Ambiguity:</strong> Missing specialist dates are overlooked until a post-discharge complication occurs.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>High 30-Day Readmissions:</strong> Patients miss crucial cardiology, nephrology, or blood sugar checkpoints.</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-rose-200 text-[11px] text-rose-800 font-semibold">
              Result: Up to 20% preventable readmissions within 30 days.
            </div>
          </div>

          {/* CareFlow AI Closed-Loop Lifecycle (7 cols) */}
          <div className="lg:col-span-7 bg-[#052429] text-white rounded-2xl border border-[#0e4851] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#0e4851] mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00e575] animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#00e575]">
                    CareFlow AI Closed-Loop Protocol
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-300 bg-[#0a383f] px-2 py-0.5 rounded border border-[#145e69]">
                  Acentra Active Coordination
                </span>
              </div>

              {/* Steps timeline */}
              <div className="space-y-2">
                {loopSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-3 py-1.5 px-2.5 rounded-lg bg-[#072d33]/60 border border-[#0e4851]/60">
                    <div className="w-6 h-6 rounded-full bg-[#00e575] text-[#052429] flex items-center justify-center text-[10px] font-black shrink-0">
                      0{i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {step.label}
                      </div>
                      <div className="text-[11px] text-slate-300 truncate">
                        {step.description}
                      </div>
                    </div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00e575] shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#0e4851] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2 text-[#00e575] font-semibold">
                <RotateCw className="w-4 h-4 animate-spin text-[#00e575]" />
                Continuous loop tracks each task until verified clinic attendance.
              </span>
              <Link
                to="/doctor"
                className="text-white hover:text-[#00e575] font-bold flex items-center gap-1 transition-colors"
              >
                Inspect Doctor Queue <ArrowRight className="w-3.5 h-3.5 text-[#00e575]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
