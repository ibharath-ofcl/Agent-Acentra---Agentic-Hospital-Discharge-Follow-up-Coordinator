import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Activity, ArrowRight } from 'lucide-react';

const navLinks = [
  { label: 'Product', href: '#product' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Clinical Safety', href: '#safety' },
  { label: 'For Patients', href: '#for-patients' },
  { label: 'For Care Teams', href: '#for-care-teams' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#052429]/95 backdrop-blur-md border-b border-[#0e4851] shadow-lg'
          : 'bg-[#052429] border-b border-[#0a383f]'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#00e575] flex items-center justify-center text-[#052429] shadow-sm font-black transition-transform group-hover:scale-105">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">
            CareFlow <span className="text-[#00e575]">AI</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-2">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-[#0a383f]/60"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-lg transition-all shadow-sm hover:shadow flex items-center gap-1.5"
          >
            Try the Demo
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-[#0a383f]"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#052429] border-b border-[#0e4851] px-4 py-4 space-y-2 text-xs"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-[#0a383f] rounded-lg font-medium"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-[#0e4851] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-lg text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68]"
              >
                Try the Demo
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
