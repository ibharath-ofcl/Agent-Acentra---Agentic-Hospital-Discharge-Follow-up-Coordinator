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
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: FileSearch,
    title: 'Document Intelligence',
    description: 'Converts discharge documents into structured follow-up information — appointments, tests, referrals, and instructions.',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    icon: Workflow,
    title: 'Task Orchestration',
    description: 'Creates prioritized, time-bound tasks and assigns them to the right follow-up workflow with tracked deadlines.',
    color: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: HeartPulse,
    title: 'Healthcare Workflow',
    description: 'Purpose-built for post-discharge coordination. Understands clinical context, urgency levels, and care team structures.',
    color: 'text-coral-600 bg-coral-50',
  },
  {
    icon: Languages,
    title: 'Multilingual AI',
    description: 'Patient-friendly instructions can be generated in multiple languages to improve comprehension and adherence.',
    color: 'text-primary-600 bg-primary-50',
  },
  {
    icon: MapPin,
    title: 'Provider Matching',
    description: 'Matches follow-up needs with available providers based on specialty, location, and availability.',
    color: 'text-teal-600 bg-teal-50',
  },
  {
    icon: ShieldCheck,
    title: 'Clinical Safety',
    description: 'Unclear or clinically sensitive information is never guessed — it is routed to human review with source evidence.',
    color: 'text-emerald-600 bg-emerald-50',
  },
];

export function CapabilitiesSection() {
  return (
    <section id="product" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
            Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
            Built for Healthcare Follow-up Coordination
          </h2>
          <p className="mt-4 text-text-secondary text-lg">
            Every capability is designed to help ensure discharge follow-ups are organized, tracked, and acted upon.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8 lg:gap-x-8">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex gap-4"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cap.color}`}>
                <cap.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary mb-1.5">
                  {cap.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
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
