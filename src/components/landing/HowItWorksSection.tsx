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
    <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
            Workflow Architecture
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CareFlow AI Works
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            From unstructured discharge PDFs to verified clinical follow-up in six structured stages.
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
              className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow group"
            >
              {/* Step number */}
              <span className="absolute top-4 right-4 text-xs font-mono font-bold text-slate-400 group-hover:text-teal-800 transition-colors">
                STAGE 0{i + 1}
              </span>

              <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${step.color} mb-4 shadow-xs`}>
                <step.icon className="w-5 h-5" />
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
