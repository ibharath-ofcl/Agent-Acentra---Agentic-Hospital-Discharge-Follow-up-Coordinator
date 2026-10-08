import { Link } from 'react-router-dom';
import { ArrowRight, Stethoscope, User, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function FinalCtaSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#03181b] text-white border-b border-[#0a383f] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#00e575]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0a383f] text-[#00e575] border border-[#0e4851] mb-6 shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00e575]" />
          <span>Interactive Prototype Ready for Demo</span>
        </div>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
          Ready to Experience Closed-Loop <br className="hidden sm:inline" />
          Discharge Coordination?
        </h2>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Test how CareFlow AI automatically turns complex discharge summaries into clear recovery timelines for patients, while giving hospital care teams a centralized clinical triage command center.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/login"
              className="px-8 py-4 text-sm font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 cursor-pointer"
            >
              Try the Demo Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Secondary Role Switchers */}
        <div className="mt-10 pt-8 border-t border-[#0e4851]/60 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs">
          <span className="text-slate-400">Direct Portal Jump:</span>
          <Link
            to="/doctor"
            className="px-4 py-2 rounded-lg bg-[#072d33] border border-[#0e4851] hover:border-[#00e575]/50 text-white font-semibold flex items-center gap-2 transition-all hover:bg-[#0a383f]"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#00e575]" />
            Doctor Command Center (Dr. Meera Patel)
          </Link>
          <Link
            to="/patient"
            className="px-4 py-2 rounded-lg bg-[#072d33] border border-[#0e4851] hover:border-[#00e575]/50 text-white font-semibold flex items-center gap-2 transition-all hover:bg-[#0a383f]"
          >
            <User className="w-3.5 h-3.5 text-[#00e575]" />
            Patient Recovery Portal (Arun Kumar)
          </Link>
        </div>
      </div>
    </section>
  );
}
