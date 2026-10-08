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
  { icon: FileQuestion, label: 'Missing information', example: 'Follow-up date not specified' },
  { icon: HelpCircle, label: 'Ambiguous instructions', example: '"Continue medication as discussed"' },
  { icon: AlertTriangle, label: 'Conflicting instructions', example: 'Contradicting activity guidelines' },
  { icon: Pill, label: 'Medication questions', example: 'Dosage clarity needed' },
  { icon: Stethoscope, label: 'New symptoms', example: 'Patient-reported symptom not in summary' },
];

export function SafetySection() {
  return (
    <section id="safety" className="py-20 sm:py-28 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mb-5">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Human in the Loop — Always
          </h2>
          <p className="mt-4 text-text-secondary text-lg leading-relaxed">
            CareFlow AI organizes existing hospital instructions. It does not make clinical
            decisions. When the system encounters uncertainty, it does not guess — it
            escalates to a human reviewer.
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
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-semibold text-text-primary mb-5">
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
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-secondary border border-border-light"
                  >
                    <t.icon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text-primary">{t.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">e.g. {t.example}</p>
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
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <h3 className="text-base font-semibold text-text-primary mb-5">
                What happens:
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <p className="text-sm font-medium text-amber-800">Flagged as "Needs Review"</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-sage-300" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100">
                  <UserCheck className="w-5 h-5 text-primary-500 shrink-0" />
                  <p className="text-sm font-medium text-primary-800">Routed to care coordinator or doctor</p>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-4 h-4 text-sage-300" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <p className="text-sm font-medium text-emerald-800">Human reviews, approves, or edits</p>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-border-light">
                <p className="text-xs text-text-secondary leading-relaxed">
                  Every extracted piece of information includes source evidence linking back
                  to the original discharge document for verification.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
