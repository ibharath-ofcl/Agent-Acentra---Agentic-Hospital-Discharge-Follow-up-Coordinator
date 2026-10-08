import { motion } from 'framer-motion';
import { Phone, MessageSquare, RotateCcw, AlertCircle, ShieldAlert } from 'lucide-react';

export function ReminderSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              {/* Example reminder call */}
              <div className="bg-primary-50/80 rounded-xl p-5 border border-primary-100 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
                    Example Reminder Call
                  </span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed italic">
                  "Hello Arun, this is the hospital follow-up coordinator. This is a reminder
                  that your discharge plan shows a cardiology follow-up scheduled for tomorrow.
                  Please check your follow-up details in your portal. Thank you."
                </p>
              </div>

              {/* Fallback flow */}
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                If patient does not answer
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: Phone, label: 'AI reminder call attempt', color: 'text-primary-500' },
                  { icon: RotateCcw, label: 'Retry (up to configured limit)', color: 'text-amber-500' },
                  { icon: MessageSquare, label: 'Fallback to SMS / message', color: 'text-teal-500' },
                  { icon: AlertCircle, label: 'Record attempt and escalate if needed', color: 'text-coral-500' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.08 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-surface-secondary"
                  >
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span className="text-sm text-text-primary">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 lg:order-2 mb-10 lg:mb-0"
          >
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider mb-3">
              AI Reminders
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Gentle, Informational Follow-up Reminders
            </h2>
            <p className="mt-4 text-text-secondary text-lg leading-relaxed">
              CareFlow AI can send automated reminder calls to help patients stay on track
              with their follow-up appointments and tasks.
            </p>

            {/* Safety boundary */}
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    Important Safety Boundary
                  </p>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    AI reminders are <strong>informational only</strong>. They never diagnose,
                    recommend treatment, change medications, or provide clinical advice. If a
                    patient asks a clinical question, the call directs them to their care team.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
