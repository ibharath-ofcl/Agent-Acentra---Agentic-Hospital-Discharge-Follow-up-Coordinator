import { motion } from 'framer-motion';
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
    description: 'Hospital discharge documents are uploaded to CareFlow AI for processing.',
    color: 'bg-primary-100 text-primary-600 border-primary-200',
  },
  {
    icon: ScanSearch,
    title: 'Extract Follow-up Information',
    description: 'AI extracts appointments, tests, referrals, medications, and care instructions from the document.',
    color: 'bg-teal-100 text-teal-600 border-teal-200',
  },
  {
    icon: AlertTriangle,
    title: 'Validate & Detect Uncertainty',
    description: 'The system flags missing dates, ambiguous instructions, or conflicting information for human review.',
    color: 'bg-amber-100 text-amber-600 border-amber-200',
  },
  {
    icon: ListChecks,
    title: 'Build Follow-up Tasks',
    description: 'Structured tasks with timelines are created for each follow-up action — appointments, tests, and referrals.',
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  },
  {
    icon: BellRing,
    title: 'Remind & Track',
    description: 'Automated reminders help patients stay on track. All attempts are recorded and tracked.',
    color: 'bg-primary-100 text-primary-600 border-primary-200',
  },
  {
    icon: UserCheck,
    title: 'Escalate to Human Reviewer',
    description: 'When information is unclear or clinically sensitive, it is routed to a human care coordinator or doctor.',
    color: 'bg-coral-100 text-coral-600 border-coral-200',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-surface-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            From Document to Follow-up in Six Steps
          </h2>
          <p className="mt-4 text-text-secondary text-lg">
            CareFlow AI transforms unstructured discharge instructions into an organized, trackable follow-up workflow.
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              variants={cardVariants}
              className="relative bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow group"
            >
              {/* Step number */}
              <span className="absolute top-4 right-4 text-xs font-bold text-sage-300">
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.color} mb-4`}>
                <step.icon className="w-5 h-5" />
              </div>

              <h3 className="text-base font-semibold text-text-primary mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.description}
              </p>

              {/* Connector line for visual flow */}
              {i < steps.length - 1 && i % 3 !== 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-sage-300" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
