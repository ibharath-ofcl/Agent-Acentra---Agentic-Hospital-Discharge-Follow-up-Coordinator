import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, ClockAlert, AlertTriangle, CheckCircle2, LogOut,
  PhoneCall, X, Clock, Menu, Sparkles, LayoutDashboard,
  ListTodo, CalendarClock, ClipboardList, UserCheck, BellRing
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface DoctorLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  toastMessage?: string | null;
}

export const DOCTOR_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/doctor', icon: LayoutDashboard },
  { id: 'notifications', label: 'Notification Automation', path: '/doctor/notifications', icon: BellRing, badge: 'Demo' },
  { id: 'followup', label: 'My Follow-ups', path: '/doctor/follow-ups', icon: ListTodo, badge: '7' },
  { id: 'tasks', label: 'Upcoming Tasks', path: '/doctor/tasks', icon: CalendarClock, badge: '4' },
  { id: 'instructions', label: 'Care Instructions', path: '/doctor/care-instructions', icon: ClipboardList },
  { id: 'upload', label: 'Discharge Intelligence', path: '/doctor?tab=upload', icon: Sparkles, ai: true },
  { id: 'patients', label: 'Patients', path: '/doctor?tab=patients', icon: Users },
  { id: 'review', label: 'Needs Human Review', path: '/doctor?tab=review', icon: AlertTriangle, alert: true, badge: '4' },
  { id: 'priority', label: 'Priority Queue', path: '/doctor?tab=priority', icon: ClockAlert },
  { id: 'reminders', label: 'Reminders & Calls', path: '/doctor?tab=reminders', icon: PhoneCall },
  { id: 'timeline', label: 'Timeline / Audit', path: '/doctor?tab=timeline', icon: Clock },
];

export function DoctorLayout({ children, activeTab, toastMessage }: DoctorLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentActive = (item: typeof DOCTOR_NAV_ITEMS[0]) => {
    if (activeTab && activeTab === item.id) return true;
    if (item.path === '/doctor') {
      return location.pathname === '/doctor' && !location.search && !activeTab;
    }
    if (item.path.startsWith('/doctor/')) {
      return location.pathname === item.path;
    }
    if (item.path.includes('?tab=')) {
      const tabParam = item.path.split('?tab=')[1];
      return location.pathname === '/doctor' && (location.search.includes(`tab=${tabParam}`) || activeTab === tabParam);
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
            <UserCheck className="w-3.5 h-3.5" /> Coordinator Command
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto hide-scrollbar py-3 px-3 space-y-1">
          {DOCTOR_NAV_ITEMS.map((item) => {
            const active = isCurrentActive(item);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-semibold text-xs transition-all ${
                  active
                    ? 'bg-[#00e575] text-[#052429] shadow-sm font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-[#0a383f]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <item.icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#052429]' : item.ai ? 'text-[#00e575]' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      active
                        ? 'bg-[#052429] text-[#00e575]'
                        : item.alert
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
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
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-8 h-8 rounded-full bg-[#0a383f] text-[#00e575] border border-[#145e69] font-black flex items-center justify-center text-xs shrink-0">
              MP
            </div>
            <div className="text-left text-white overflow-hidden">
              <div className="font-bold text-xs truncate">Dr. Meera Patel</div>
              <div className="text-[10px] text-slate-400 truncate">Cardiology Coordinator</div>
            </div>
          </div>
          <Link
            to="/patient"
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-[#00e575] bg-[#072d33] hover:bg-[#0a383f] border border-[#0e4851] rounded-lg transition-colors cursor-pointer"
          >
            Switch to Patient Portal
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-bold text-slate-300 bg-transparent hover:bg-red-950/40 hover:text-red-400 border border-transparent rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
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
              className="p-1.5 -ml-1.5 text-slate-300 hover:text-white rounded-lg focus:outline-none"
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
            <Link to="/patient" className="text-[11px] font-bold text-[#00e575] bg-[#072d33] px-2.5 py-1 rounded border border-[#0e4851]">
              Patient View
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
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#052429] border-r border-[#0e4851] flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-5 border-b border-[#0e4851]">
                  <span className="font-bold text-base tracking-tight text-white">CareFlow Menu</span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-300 hover:text-white" aria-label="Close menu">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {DOCTOR_NAV_ITEMS.map((item) => {
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
                          <span>{item.label}</span>
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
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
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
