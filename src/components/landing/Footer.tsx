import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#03181b] text-slate-300 border-t border-[#0a383f] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429]">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                CareFlow <span className="text-[#00e575]">AI</span>
              </span>
            </Link>
            <p className="mt-3 text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
              Agentic hospital discharge and follow-up coordinator. Organizes post-discharge instructions
              into a clear, trackable plan with strict human-in-the-loop clinical governance.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#00e575] bg-[#072d33] px-3 py-1.5 rounded-lg border border-[#0e4851]">
              <ShieldCheck className="w-4 h-4 text-[#00e575]" />
              Strict Human-In-The-Loop Safety Standard
            </div>
          </div>

          {/* Platform Sections */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Platform Workflow
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li><a href="#product" className="hover:text-white transition-colors">Core Capabilities</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">6-Step Processing</a></li>
              <li><a href="#safety" className="hover:text-white transition-colors">Clinical Safety Trigger</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">Portal Login <ArrowRight className="w-3 h-3 text-[#00e575]" /></Link></li>
            </ul>
          </div>

          {/* Demo Portals */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Demo Environments
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/patient" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <HeartPulse className="w-3.5 h-3.5 text-[#00e575]" /> Patient Portal (Arun Kumar)
                </Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <Stethoscope className="w-3.5 h-3.5 text-[#00e575]" /> Doctor & Coordinator Queue
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white flex items-center gap-1.5 transition-colors font-semibold text-white">
                  <span>Sign In as Demo User</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Clinical Disclaimer & Safety Boundary */}
        <div className="pt-8 border-t border-[#0a383f] text-xs text-slate-400 space-y-2">
          <p className="leading-relaxed">
            <strong className="text-white">Clinical Safety Boundary:</strong> CareFlow AI is an administrative and follow-up coordination prototype. It does not diagnose medical conditions, recommend clinical treatment, adjust medications, or make diagnostic decisions. All extracted instructions are sourced directly from the hospital's discharge summary with source citations, and any uncertainty is flagged for human review.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2 text-[11px] text-slate-400">
            <p>© {new Date().getFullYear()} CareFlow AI. Phase 1 Interactive Prototype • Synthetic healthcare demo data only.</p>
            <p className="font-mono text-slate-400">Acentra Agentic Healthcare Hackathon</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
