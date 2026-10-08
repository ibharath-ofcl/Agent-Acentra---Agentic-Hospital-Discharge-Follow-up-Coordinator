import { motion } from 'framer-motion';
import { ArrowRight, RotateCw } from 'lucide-react';

const loopSteps = [
  { label: 'Understand', description: 'Extract and interpret discharge instructions with OCR validation' },
  { label: 'Plan', description: 'Structure discrete clinical follow-up timeline and milestones' },
  { label: 'Assign', description: 'Route tasks to patients, family, and attending provider teams' },
  { label: 'Remind', description: 'Deliver automated, informational follow-up phone and SMS reminders' },
  { label: 'Track', description: 'Monitor completion, task check-ins, and clinic appointments' },
  { label: 'Escalate', description: 'Flag ambiguities and missing dates for human coordinator review' },
  { label: 'Complete', description: 'Verify safe recovery closure without readmission' },
];

export function ClosedLoopSection() {
  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
              Closed-Loop Coordination
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Follow-up That Doesn't Stop at Summarization
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              Most health tech systems stop after generating a static summary of a discharge PDF. CareFlow AI goes
              further — it establishes an active, closed-loop coordination process that tracks instructions through to confirmed resolution.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm">
              From ingestion through patient check-ins and clinician triage, the system tracks adherence, records reminder call outcomes, and escalates to human review whenever needed.
            </p>
          </motion.div>

          {/* Visual loop */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 lg:mt-0"
          >
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="space-y-0">
                {loopSteps.map((step, i) => (
                  <div key={step.label}>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-4 py-2.5"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#052429] text-[#00e575] flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-slate-900">{step.label}</p>
                        <p className="text-[11px] text-slate-500">{step.description}</p>
                      </div>
                    </motion.div>
                    {i < loopSteps.length - 1 && (
                      <div className="ml-3.5 h-3.5 border-l-2 border-dashed border-teal-800/30 flex items-center">
                        <ArrowRight className="w-2.5 h-2.5 text-teal-800 -ml-[5px]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Loop indicator */}
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-2">
                <RotateCw className="w-3.5 h-3.5 text-[#008742] animate-spin" />
                <span className="text-xs font-bold text-[#008742]">
                  Continuous tracking loop until every task is verified
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
