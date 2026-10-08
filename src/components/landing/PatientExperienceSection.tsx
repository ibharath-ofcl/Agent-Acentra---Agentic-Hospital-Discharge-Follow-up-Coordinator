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
  { icon: Forward, label: 'Referrals' },
  { icon: FileHeart, label: 'Care instructions' },
  { icon: Clock, label: 'Follow-up timeline' },
  { icon: Bell, label: 'Reminder history' },
  { icon: Languages, label: 'Language selection' },
];

export function PatientExperienceSection() {
  return (
    <section id="for-patients" className="py-20 sm:py-28">
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
              For Patients
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
              Clear, Simple Follow-up — In Your Language
            </h2>
            <p className="mt-4 text-text-secondary text-lg leading-relaxed">
              After discharge, patients see exactly what they need to do next — appointments,
              tests, medications, and care instructions — all in one place, in clear language.
            </p>
            <p className="mt-3 text-text-secondary leading-relaxed">
              Items that need additional information are clearly marked, and the care team
              is notified to follow up.
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
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-border hover:border-primary-200 hover:shadow-sm transition-all"
                >
                  <f.icon className="w-5 h-5 text-primary-500 shrink-0" />
                  <span className="text-sm font-medium text-text-primary">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
