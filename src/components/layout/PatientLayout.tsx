import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CalendarClock, ListTodo, Stethoscope, ClipboardList,
  History, BellRing, HelpCircle, Globe, LogOut, Menu, X, CheckCircle2,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage, type SupportedLanguage } from '../../context/LanguageContext';

interface PatientLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  toastMessage?: string | null;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  selectedLanguage?: SupportedLanguage;
}

export const PATIENT_NAV_ITEMS = [
  { id: 'dashboard', labelKey: 'nav.dashboard', defaultLabel: 'Dashboard', path: '/patient', icon: Activity },
  { id: 'followup', labelKey: 'nav.followups', defaultLabel: 'My Follow-ups', path: '/patient/follow-ups', icon: ListTodo, badge: '3' },
  { id: 'tasks', labelKey: 'nav.tasks', defaultLabel: 'Upcoming Tasks', path: '/patient/tasks', icon: CalendarClock, badge: '4' },
  { id: 'tests-referrals', labelKey: 'nav.tests', defaultLabel: 'Tests & Referrals', path: '/patient/tests-referrals', icon: Stethoscope, badge: '2' },
  { id: 'instructions', labelKey: 'nav.instructions', defaultLabel: 'Care Instructions', path: '/patient/care-instructions', icon: ClipboardList },
  { id: 'timeline', labelKey: 'nav.timeline', defaultLabel: 'Timeline', path: '/patient/timeline', icon: History },
  { id: 'reminders', labelKey: 'nav.reminders', defaultLabel: 'Reminders', path: '/patient/reminders', icon: BellRing },
  { id: 'help', labelKey: 'nav.help', defaultLabel: 'Help / Human Review', path: '/patient/help', icon: HelpCircle },
];

export function PatientLayout({
  children,
  activeTab,
  toastMessage,
  onLanguageChange,
}: PatientLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLangSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  const isCurrentActive = (item: typeof PATIENT_NAV_ITEMS[0]) => {
    if (location.pathname === item.path) return true;
    if (location.pathname.startsWith('/patient/') && location.pathname === item.path) return true;
    if (activeTab && (activeTab === item.id || (item.id === 'followup' && activeTab === 'follow-ups') || (item.id === 'tests-referrals' && activeTab === 'tests') || (item.id === 'tasks' && activeTab === 'upcoming'))) {
      return true;
    }
    if (item.path === '/patient' && location.pathname === '/patient' && (!activeTab || activeTab === 'dashboard')) {
      return true;
    }
    return false;
  };

  return (
    <div className="flex bg-[#f8fafc] text-slate-900 min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-[60] bg-[#052429] border border-[#00e575] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00e575]" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#052429] border-r border-[#0e4851] flex-shrink-0 fixed inset-y-0 z-40">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#0e4851]">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
              <Activity className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-base tracking-tight text-white line-clamp-1">
              CareFlow <span className="text-[#00e575]">AI</span>
            </span>
          </Link>
        </div>

        <div className="px-5 py-3 border-b border-[#0e4851]">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Role</div>
          <div className="text-xs font-bold text-[#00e575] flex items-center gap-1.5">
            <HeartPulse className="w-3.5 h-3.5" /> {t('nav.patient_portal', 'Patient Recovery Portal')}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto hide-scrollbar py-3 px-3 space-y-1">
          {PATIENT_NAV_ITEMS.map((item) => {
            const active = isCurrentActive(item);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-all ${
                  active
                    ? 'bg-[#00e575] text-[#052429] shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#052429]' : 'text-slate-300'}`} />
                  <span className="truncate">{t(item.labelKey, item.defaultLabel)}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active
                        ? 'bg-[#052429] text-[#00e575]'
                        : 'bg-[#0e4851] text-teal-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#0e4851] space-y-2">
          {/* Language Selector */}
          <div className="flex items-center gap-2 mb-2 bg-[#072d33] border border-[#0e4851] px-2.5 py-1.5 rounded-xl text-xs w-full">
            <Globe className="w-4 h-4 text-[#00e575] shrink-0" />
            <select
              value={language}
              aria-label="Select language"
              onChange={(e) => handleLangSelect(e.target.value as SupportedLanguage)}
              className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer font-medium w-full"
            >
              <option value="English" className="bg-[#052429] text-white">English</option>
              <option value="Tamil" className="bg-[#052429] text-white">தமிழ் (Tamil)</option>
              <option value="Hindi" className="bg-[#052429] text-white">हिन्दी (Hindi)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#00e575] text-[#052429] font-black flex items-center justify-center text-xs shrink-0">
              AK
            </div>
            <div className="text-left text-white overflow-hidden">
              <div className="font-bold text-xs truncate">Arun Kumar</div>
              <div className="text-[10px] text-slate-400 truncate">MRN: P001 • Post-MI</div>
            </div>
          </div>
          <Link
            to="/doctor"
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors cursor-pointer"
          >
            <Stethoscope className="w-3.5 h-3.5" /> {t('nav.doctor_view', 'Doctor / Coordinator View')}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-slate-300 bg-transparent hover:bg-red-950/40 hover:text-red-400 border border-transparent rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> {t('nav.sign_out', 'Sign Out')}
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 relative">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#052429] text-white border-b border-[#0e4851] h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1.5 text-slate-300 hover:text-white rounded-lg focus:outline-hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] font-black">
                <Activity className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                CareFlow <span className="text-[#00e575]">AI</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/doctor" className="text-[11px] font-bold text-[#00e575] bg-[#072d33] px-2.5 py-1 rounded border border-[#0e4851]">
              Doctor
            </Link>
            <button onClick={handleLogout} className="p-1.5 text-slate-300 hover:text-red-400" aria-label="Sign out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Off-canvas */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#052429] border-r border-[#0e4851] flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-[#0e4851]">
                  <span className="font-bold text-base tracking-tight text-white">{t('nav.patient_portal', 'Patient Recovery Portal')}</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-300 hover:text-white" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Mobile Language Selector */}
                <div className="p-3 border-b border-[#0e4851]">
                  <div className="flex items-center gap-2 bg-[#072d33] border border-[#0e4851] px-2.5 py-1.5 rounded-xl text-xs w-full">
                    <Globe className="w-4 h-4 text-[#00e575] shrink-0" />
                    <select
                      value={language}
                      aria-label="Select language"
                      onChange={(e) => handleLangSelect(e.target.value as SupportedLanguage)}
                      className="bg-transparent text-slate-200 text-xs focus:outline-hidden cursor-pointer font-medium w-full"
                    >
                      <option value="English" className="bg-[#052429] text-white">English</option>
                      <option value="Tamil" className="bg-[#052429] text-white">தமிழ் (Tamil)</option>
                      <option value="Hindi" className="bg-[#052429] text-white">हिन्दी (Hindi)</option>
                    </select>
                  </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {PATIENT_NAV_ITEMS.map((item) => {
                    const active = isCurrentActive(item);
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-semibold text-xs transition-colors ${
                          active
                            ? 'bg-[#00e575] text-[#052429] font-bold'
                            : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span>{t(item.labelKey, item.defaultLabel)}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#0e4851] text-teal-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
                <div className="p-4 border-t border-[#0e4851] space-y-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-red-400 bg-red-950/30 rounded-lg"
                  >
                    <LogOut className="w-3.5 h-3.5" /> {t('nav.sign_out', 'Sign Out')}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-20">
          {children}
        </main>
      </div>
    </div>
  );
}

