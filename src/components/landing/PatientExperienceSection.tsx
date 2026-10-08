import { motion } from 'framer-motion';
import {
  CalendarCheck,
  ListTodo,
  TestTubes,
  Forward,
  FileHeart,
  Bell,
  Clock,
  Languages,
} from 'lucide-react';

const features = [
  { icon: ListTodo, label: 'What do I need to do next?' },
  { icon: CalendarCheck, label: 'Upcoming appointments' },
  { icon: TestTubes, label: 'Tests & lab orders' },
  { icon: Forward, label: 'Referrals & specialist visits' },
  { icon: FileHeart, label: 'Patient care instructions' },
  { icon: Clock, label: 'Post-discharge timeline' },
  { icon: Bell, label: 'Reminder call history' },
  { icon: Languages, label: 'Language selection (EN, TA, HI)' },
];

export function PatientExperienceSection() {
  return (
    <section id="for-patients" className="py-20 sm:py-28 bg-white border-b border-slate-200">
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
              Patient Recovery Experience
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Clear, Simple Follow-up — In Your Language
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              After discharge, patients see exactly what they need to do next — appointments,
              tests, medications, and care instructions — organized in plain language without medical jargon.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm">
              Items with missing or ambiguous details are visibly flagged as "Needs Review" while your care coordinator resolves them behind the scenes.
            </p>
          </motion.div>

          {/* Feature grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 lg:mt-0"
          >
            <div className="grid grid-cols-2 gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: 0.2 + i * 0.04 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-800/30 hover:bg-slate-100 transition-all"
                >
                  <f.icon className="w-5 h-5 text-teal-800 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
