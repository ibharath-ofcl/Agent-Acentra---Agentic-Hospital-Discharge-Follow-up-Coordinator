import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Activity className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary tracking-tight">
                CareFlow <span className="text-primary-600">AI</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-text-secondary max-w-sm leading-relaxed">
              Agentic hospital discharge and follow-up coordinator. Turning complex discharge summaries
              into actionable, human-reviewed follow-up schedules.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 inline-flex">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Strict Human-In-The-Loop Clinical Governance
            </div>
          </div>

          {/* Nav links */}
          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#product" className="hover:text-primary-600 transition-colors">Capabilities</a></li>
              <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">How It Works</a></li>
              <li><a href="#safety" className="hover:text-primary-600 transition-colors">Clinical Safety</a></li>
              <li><Link to="/login" className="hover:text-primary-600 transition-colors">Portal Login</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-semibold text-text-primary uppercase tracking-wider mb-3">
              Demo Access
            </h4>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>
                <Link to="/patient" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
                  <HeartPulse className="w-3.5 h-3.5 text-coral-500" /> Patient View (Demo)
                </Link>
              </li>
              <li>
                <Link to="/doctor" className="hover:text-primary-600 flex items-center gap-1.5 transition-colors">
                  <Activity className="w-3.5 h-3.5 text-primary-500" /> Care Team View (Demo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer / Notice */}
        <div className="pt-8 border-t border-border-light text-xs text-text-muted space-y-2">
          <p className="leading-relaxed">
            <strong>Important Safety Notice:</strong> CareFlow AI is an administrative and workflow coordination prototype. It does not provide medical diagnosis, treatment recommendations, clinical decisions, or medication adjustments. All follow-up actions require verification by licensed healthcare professionals.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2">
            <p>© {new Date().getFullYear()} CareFlow AI. Phase 1 Prototype — Synthetic demonstration data only.</p>
            <p className="text-[11px] text-text-muted">Acentra Agentic Healthcare Hackathon Initiative</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
