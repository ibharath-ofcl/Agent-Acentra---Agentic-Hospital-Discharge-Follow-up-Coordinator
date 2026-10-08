import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  Pill,
  Stethoscope,
  ArrowDown,
  UserCheck,
  CheckCircle2,
  XCircle,
  Lock,
} from 'lucide-react';

const triggers = [
  { icon: FileQuestion, label: 'Missing information', example: 'Follow-up date or specialty clinic not specified in discharge summary' },
  { icon: HelpCircle, label: 'Ambiguous instructions', example: '"Continue medication as discussed with team" without dosage' },
  { icon: AlertTriangle, label: 'Conflicting instructions', example: 'Discharge note contradicts physical therapy weight-bearing order' },
  { icon: Pill, label: 'Medication questions', example: 'Patient inquiries on dosing, side effects, or drug interactions' },
  { icon: Stethoscope, label: 'New or altered symptoms', example: 'Patient reports dizziness, chest tightness, or vitals variance post-discharge' },
];

export function SafetySection() {
  return (
    <section id="safety" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#008742] bg-[#e6fcf1] border border-[#a7f3d0] mb-3">
            <Lock className="w-3.5 h-3.5 text-[#008742]" />
            Clinical Safety & Governance Standard
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Human in the Loop — Always
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            CareFlow AI organizes existing hospital instructions. It does not make autonomous clinical
            diagnoses or treatment decisions. When uncertainty is detected, the system does not guess — it
            routes directly to human clinical staff.
          </p>
        </div>

        {/* CLINICAL BOUNDARY MATRIX: What AI Does vs What Clinicians Decide */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-12">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-800" />
            Clinical Boundary Matrix: System Capabilities vs Medical Authority
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: AI Administrative Coordination */}
            <div className="p-5 rounded-xl bg-teal-50/50 border border-teal-200">
              <div className="flex items-center gap-2 mb-3.5 text-teal-900 font-bold text-sm">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                What CareFlow AI Automates (Administrative)
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>EHR Record Ingestion:</strong> Reads and normalizes structured text from discharge summaries.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Care Timeline Synthesis:</strong> Constructs chronological 30-day follow-up schedules.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Informational Reminders:</strong> Sends scheduled phone call and SMS appointment notifications.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Plain-Language Translation:</strong> Translates clinical instructions into patient-friendly languages.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Provider Roster Matching:</strong> Identifies credentialed attending specialists in network.</span>
                </li>
              </ul>
            </div>

            {/* Column 2: Clinician Human Authority */}
            <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center gap-2 mb-3.5 text-amber-950 font-bold text-sm">
                <XCircle className="w-4.5 h-4.5 text-amber-700 shrink-0" />
                What Requires Human Clinician Authority (Medical)
              </div>
              <ul className="space-y-2.5 text-xs text-amber-950">
                <li className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">✕</span>
                  <span><strong>Zero Medical Diagnosis:</strong> AI never diagnoses symptoms, interprets labs, or gives medical advice.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">✕</span>
                  <span><strong>No Prescription Changes:</strong> Medication dosage, additions, or discontinuations are strictly clinician-controlled.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">✕</span>
                  <span><strong>No Autonomous Date Guessing:</strong> Missing follow-up dates are never filled with hallucinated dates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">✕</span>
                  <span><strong>Conflict Resolution:</strong> Contradictory surgical and physical therapy notes must be resolved by doctors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-700 font-bold">✕</span>
                  <span><strong>Emergency Escalation:</strong> Patient-reported red flag symptoms immediately trigger clinical alert.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Triggers and Escalation Resolution Path */}
        <div className="lg:grid lg:grid-cols-5 lg:gap-8 items-stretch">
          {/* Triggers (3 cols) */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                  5 Automated Escalation Triggers:
                </h3>
                <div className="space-y-3">
                  {triggers.map((t) => (
                    <div
                      key={t.label}
                      className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200">
                        <t.icon className="w-4 h-4 text-amber-800" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">{t.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">e.g. {t.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero guesswork guarantee: Detected ambiguities automatically stop autonomous processing.</span>
              </div>
            </div>
          </div>

          {/* Escalation Path (2 cols) */}
          <div className="lg:col-span-2 mt-6 lg:mt-0">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                  Escalation Resolution Path:
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-amber-50 border border-amber-300">
                    <div className="w-9 h-9 rounded-xl bg-amber-200/80 flex items-center justify-center shrink-0 border border-amber-300">
                      <AlertTriangle className="w-5 h-5 text-amber-800" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-950 uppercase tracking-wider">Stage 01</p>
                      <p className="text-xs font-bold text-amber-900">Flagged as "Needs Review"</p>
                      <p className="text-[11px] text-amber-800">Triggered by missing date or ambiguity</p>
                    </div>
                  </div>

                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center shrink-0 border border-teal-200">
                      <UserCheck className="w-5 h-5 text-teal-800" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-teal-950 uppercase tracking-wider">Stage 02</p>
                      <p className="text-xs font-bold text-teal-900">Doctor / Coordinator Triage Tray</p>
                      <p className="text-[11px] text-teal-800">Surfaced in centralized clinical queue</p>
                    </div>
                  </div>

                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Stage 03</p>
                      <p className="text-xs font-bold text-emerald-900">Clinician Approves or Edits</p>
                      <p className="text-[11px] text-emerald-800">Authoritative human sign-off</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-mono">
                Every recommendation maintains source provenance—linking directly to discharge summary page & OCR score.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
