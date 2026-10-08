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
          <div>
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
          </div>

          {/* Feature grid - 8 items in 2 columns */}
          <div className="mt-10 lg:mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {features.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-800/30 hover:bg-slate-100 transition-all shadow-xs"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center shrink-0 border border-teal-200">
                    <f.icon className="w-4 h-4 text-teal-800" />
                  </div>
                  <span className="text-xs font-bold text-slate-900">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
