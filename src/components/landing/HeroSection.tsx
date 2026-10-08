import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Brain,
  ClipboardCheck,
  ListTodo,
  Bell,
  UserCheck,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

const workflowSteps = [
  { icon: FileText, label: 'Discharge Summary', color: 'bg-primary-100 text-primary-600' },
  { icon: Brain, label: 'AI Understanding', color: 'bg-teal-100 text-teal-600' },
  { icon: ClipboardCheck, label: 'Follow-up Plan', color: 'bg-emerald-100 text-emerald-600' },
  { icon: ListTodo, label: 'Tasks & Timeline', color: 'bg-amber-100 text-amber-600' },
  { icon: Bell, label: 'Reminders', color: 'bg-primary-100 text-primary-600' },
  { icon: UserCheck, label: 'Human Review', color: 'bg-coral-100 text-coral-600' },
];

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary-100/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-teal-100/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse-soft" />
              Agentic Hospital Discharge Coordination
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-[1.1] tracking-tight"
          >
            From Discharge Instructions{' '}
            <br className="hidden sm:block" />
            to Follow-up —{' '}
            <span className="text-primary-600">
              Automatically Coordinated
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-text-secondary leading-relaxed max-w-2xl mx-auto"
          >
            CareFlow AI turns hospital discharge instructions into a clear, trackable
            follow-up plan — while keeping humans in the loop whenever information is
            unclear or clinically sensitive.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-text-primary bg-white border border-border rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all"
            >
              Explore How It Works
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>

        {/* Workflow visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl border border-border shadow-lg p-6 sm:p-8">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center mb-6">
              The CareFlow Workflow
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-2">
              {workflowSteps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-surface-secondary border border-border-light"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step.color}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-text-primary whitespace-nowrap">
                      {step.label}
                    </span>
                  </motion.div>
                  {i < workflowSteps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-sage-300 shrink-0 hidden sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
