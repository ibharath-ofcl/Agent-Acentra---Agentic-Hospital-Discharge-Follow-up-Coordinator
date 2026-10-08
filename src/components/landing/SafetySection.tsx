import { motion } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  FileQuestion,
  Pill,
  Stethoscope,
  ArrowRight,
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
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
        </motion.div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8 items-start">
          {/* Triggers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                When CareFlow AI detects any of these, it escalates:
              </h3>
              <div className="space-y-3">
                {triggers.map((t, i) => (
                  <motion.div
                    key={t.label}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <t.icon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{t.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">e.g. {t.example}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Escalation path */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 mt-6 lg:mt-0"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">
                Escalation Resolution Path:
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-amber-950 uppercase">Stage 1</p>
                    <p className="text-xs font-semibold text-amber-900">Flagged as "Needs Review"</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 sm:rotate-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-teal-50 border border-teal-200">
                  <UserCheck className="w-5 h-5 text-teal-800 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-teal-950 uppercase">Stage 2</p>
                    <p className="text-xs font-semibold text-teal-900">Routed to Doctor / Care Coordinator Tray</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 rotate-90 sm:rotate-0" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950 uppercase">Stage 3</p>
                    <p className="text-xs font-semibold text-emerald-900">Human Reviews, Approves, or Resolves</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every recommendation maintains source provenance—linking directly to the discharge summary page number and OCR confidence score.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
