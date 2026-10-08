import { motion } from 'framer-motion';
import { Phone, MessageSquare, RotateCcw, AlertCircle, ShieldAlert } from 'lucide-react';

export function ReminderSection() {
  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          {/* Visual simulation card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              {/* Example Call Script Box */}
              <div className="bg-[#052429] text-white rounded-xl p-5 border border-[#0e4851] mb-6">
                <div className="flex items-center gap-2 mb-2.5">
                  <Phone className="w-4 h-4 text-[#00e575]" />
                  <span className="text-[11px] font-black text-[#00e575] uppercase tracking-wider">
                    Simulated Informational Call Script
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic">
                  “Hello Arun, this is the hospital follow-up coordinator. This is a reminder
                  that your discharge plan shows a cardiology follow-up scheduled for tomorrow.
                  Please check your follow-up details in your portal. Thank you.”
                </p>
              </div>

              {/* Fallback Flow */}
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Automated Multi-Channel Fallback Flow (If Unanswered):
              </p>
              <div className="space-y-2">
                {[
                  { icon: Phone, label: '1. AI reminder phone call placed', color: 'text-teal-800' },
                  { icon: RotateCcw, label: '2. Retry attempt scheduled in 30 minutes', color: 'text-amber-600' },
                  { icon: MessageSquare, label: '3. If still unanswered: send secure SMS link', color: 'text-emerald-700' },
                  { icon: AlertCircle, label: '4. Record attempts & escalate to care team if required', color: 'text-rose-700' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: 0.2 + i * 0.06 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium"
                  >
                    <item.icon className={`w-4 h-4 ${item.color} shrink-0`} />
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 lg:order-2 mb-10 lg:mb-0"
          >
            <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-3">
              Multi-Channel Reminder Engine
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Gentle, Informational Follow-up Reminders
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              CareFlow AI schedules automated informational reminders to ensure patients never lose track of appointments or critical post-discharge lab milestones.
            </p>

            {/* Strict Safety Boundary Callout */}
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-300">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                    Strict Clinical Safety Boundary
                  </p>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    AI reminders are <strong>strictly informational</strong>. The system must <strong>never</strong> diagnose, provide treatment advice, change medications, or answer medical questions. Any clinical inquiry by the patient immediately diverts to the human care team.
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
