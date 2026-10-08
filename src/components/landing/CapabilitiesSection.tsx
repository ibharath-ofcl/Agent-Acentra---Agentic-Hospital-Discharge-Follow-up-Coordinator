import { motion } from 'framer-motion';
import {
  Bot,
  FileSearch,
  Workflow,
  HeartPulse,
  Languages,
  MapPin,
  ShieldCheck,
} from 'lucide-react';

const capabilities = [
  {
    icon: Bot,
    title: 'Agentic AI',
    description: 'Coordinates extraction, validation, task creation, reminders, and escalation through an autonomous multi-step workflow.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: FileSearch,
    title: 'Document Intelligence',
    description: 'Converts discharge documents into structured follow-up information — appointments, tests, referrals, and instructions.',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: Workflow,
    title: 'Task Orchestration',
    description: 'Creates prioritized, time-bound tasks and assigns them to the right follow-up workflow with tracked deadlines.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Workflow',
    description: 'Purpose-built for post-discharge coordination. Understands clinical context, urgency levels, and care team structures.',
    color: 'text-rose-900 bg-rose-50 border-rose-200',
  },
  {
    icon: Languages,
    title: 'Multilingual AI',
    description: 'Patient-friendly instructions can be generated in English, Hindi, Tamil, and Spanish to improve comprehension and adherence.',
    color: 'text-teal-900 bg-teal-50 border-teal-200',
  },
  {
    icon: MapPin,
    title: 'Provider Matching',
    description: 'Matches follow-up needs with available providers based on specialty, location, and verified clinic availability.',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
  {
    icon: ShieldCheck,
    title: 'Clinical Safety',
    description: 'Unclear or clinically sensitive information is routed directly to human review with exact source citations.',
    color: 'text-emerald-900 bg-emerald-50 border-emerald-200',
  },
];

export function CapabilitiesSection() {
  return (
    <section id="product" className="py-20 sm:py-28 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
            System Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Enterprise Healthcare Follow-up
          </h2>
          <p className="mt-4 text-slate-600 text-base sm:text-lg">
            Purpose-built tools to help ensure discharge follow-ups are extracted accurately, tracked seamlessly, and resolved safely.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex gap-4"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${cap.color} shadow-xs`}>
                <cap.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {cap.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {cap.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
