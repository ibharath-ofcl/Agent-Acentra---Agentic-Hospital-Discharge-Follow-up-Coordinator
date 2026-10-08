import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const loopSteps = [
  { label: 'Understand', description: 'Extract and interpret discharge instructions' },
  { label: 'Plan', description: 'Create structured follow-up timeline' },
  { label: 'Assign', description: 'Route tasks to patients and providers' },
  { label: 'Remind', description: 'Automated, evidence-based reminders' },
  { label: 'Track', description: 'Monitor completion and adherence' },
  { label: 'Escalate', description: 'Flag issues for human review' },
  { label: 'Complete', description: 'Close the loop on every task' },
];

export function ClosedLoopSection() {
  return (
    <section className="py-20 sm:py-28 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              Closed-Loop Coordination
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Follow-up That Doesn't Stop at Summarization
            </h2>
            <p className="mt-4 text-text-secondary text-lg leading-relaxed">
              Most systems stop after summarizing a discharge document. CareFlow AI goes
              further — it creates a closed-loop process that helps ensure every follow-up
              instruction is actually acted upon.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              From understanding the document to completing every task, the system tracks
              progress, sends reminders, and escalates to human reviewers when needed.
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
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="space-y-0">
                {loopSteps.map((step, i) => (
                  <div key={step.label}>
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + i * 0.07 }}
                      className="flex items-center gap-4 py-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary">{step.label}</p>
                        <p className="text-xs text-text-secondary">{step.description}</p>
                      </div>
                    </motion.div>
                    {i < loopSteps.length - 1 && (
                      <div className="ml-4 h-4 border-l-2 border-dashed border-primary-200 flex items-center">
                        <ArrowRight className="w-3 h-3 text-primary-300 -ml-[7px]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* Loop indicator */}
              <div className="mt-4 pt-4 border-t border-border-light flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
                <span className="text-xs font-medium text-emerald-600">
                  Continuous loop until all tasks are completed or reviewed
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
