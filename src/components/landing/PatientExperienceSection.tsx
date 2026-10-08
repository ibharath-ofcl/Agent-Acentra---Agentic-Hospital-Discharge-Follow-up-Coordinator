import { Link } from 'react-router-dom';
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
  ArrowRight,
  User,
  Heart,
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
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          {/* Left Text & Value Prop (6 cols) */}
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-900 bg-teal-50 border border-teal-200 mb-3">
              <User className="w-3.5 h-3.5 text-teal-700" />
              Patient & Family Experience
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Clear, Simple Follow-up — In Your Language
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed">
              After discharge, patients see exactly what they need to do next — appointments,
              diagnostic tests, medications, and recovery guidelines — organized in plain language without confusing medical jargon.
            </p>
            <p className="mt-3 text-slate-600 leading-relaxed text-sm">
              Any ambiguous order from the hospital summary is visibly badged as "Needs Review" so patients know their care coordinator is clarifying it directly with attending clinicians.
            </p>

            {/* Language Selector Preview */}
            <div className="mt-6 flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-700">Supported Languages:</span>
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                English
              </span>
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                हिंदी (Hindi)
              </span>
              <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                தமிழ் (Tamil)
              </span>
            </div>

            <div className="mt-8">
              <Link
                to="/patient"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-900 hover:bg-teal-950 rounded-xl transition-all shadow-sm"
              >
                Experience Patient Portal (Arun Kumar)
                <ArrowRight className="w-3.5 h-3.5 text-[#00e575]" />
              </Link>
            </div>
          </div>

          {/* Right: Feature Badges Grid & Live Snippet (6 cols) */}
          <div className="lg:col-span-6 mt-10 lg:mt-0">
            {/* Synthetic Snippet Card */}
            <div className="mb-4 p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-900 font-bold">
                  <Heart className="w-4 h-4 text-rose-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Next Priority Action: Fasting Blood Sugar & HbA1c</div>
                  <div className="text-[11px] text-teal-900">Target: 18 Oct 2026 • Fast for 10-12 hours prior</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                Upcoming Lab
              </span>
            </div>

            {/* 8 Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((f) => (
                <motion.div
                  key={f.label}
                  whileHover={{ x: 2 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:bg-slate-100/80 transition-all shadow-xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 border border-teal-200">
                    <f.icon className="w-3.5 h-3.5 text-teal-800" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-snug">{f.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
