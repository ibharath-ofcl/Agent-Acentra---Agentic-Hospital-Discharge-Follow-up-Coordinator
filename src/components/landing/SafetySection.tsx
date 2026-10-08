import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  Pill,
  Stethoscope,
  ArrowDown,
  UserCheck,
} from 'lucide-react';

const triggers = [
  { icon: FileQuestion, label: 'Missing information', example: 'Follow-up date not specified in summary' },
  { icon: HelpCircle, label: 'Ambiguous instructions', example: '"Continue medication as discussed with team"' },
  { icon: AlertTriangle, label: 'Conflicting instructions', example: 'Discharge note contradicts physical therapy order' },
  { icon: Pill, label: 'Medication questions', example: 'Patient inquiries on dosing or side effects' },
  { icon: Stethoscope, label: 'New or altered symptoms', example: 'Patient-reported vitals variance post-discharge' },
];

export function SafetySection() {
  return (
    <section id="safety" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00e575]/20 text-[#052429] mb-5 border border-[#00e575]/40 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-[#008742]" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Human in the Loop — Always
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
            CareFlow AI organizes existing hospital instructions. It does not make autonomous clinical
            decisions. When the system detects uncertainty, it does not guess — it
            routes directly to a human clinician.
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8 items-stretch">
          {/* Triggers */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                  When CareFlow AI detects any of these, it escalates:
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

              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero guesswork: Ambiguities immediately routed to human triage.</span>
              </div>
            </div>
          </div>

          {/* Escalation path */}
          <div className="lg:col-span-2 mt-6 lg:mt-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs h-full flex flex-col justify-between">
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
                      <p className="text-xs font-bold text-teal-900">Doctor / Care Coordinator Tray</p>
                      <p className="text-[11px] text-teal-800">Placed in centralized triage dashboard</p>
                    </div>
                  </div>

                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-300">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Stage 03</p>
                      <p className="text-xs font-bold text-emerald-900">Human Reviews & Approves</p>
                      <p className="text-[11px] text-emerald-800">Clinician verifies and closes resolution</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every recommendation maintains source provenance—linking directly to the discharge summary page number and OCR confidence score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
