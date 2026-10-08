import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, Stethoscope, AlertCircle, ArrowLeft, ShieldCheck, KeyRound, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [username, setUsername] = useState('patient');
  const [password, setPassword] = useState('patient123');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'patient') {
      setUsername('patient');
      setPassword('patient123');
    } else {
      setUsername('doctor');
      setPassword('doctor123');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const result = login(username.trim(), password.trim());
    if (result.success) {
      if (result.role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/doctor');
      }
    } else {
      setErrorMessage('Invalid credentials. Use patient / patient123 or doctor / doctor123.');
    }
  };

  return (
    <div className="min-h-screen bg-[#03181b] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient teal */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#0e4851] rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#00e575]" /> Back to CareFlow AI
        </Link>

        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#00e575] flex items-center justify-center text-[#052429] shadow-md font-black">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            CareFlow <span className="text-[#00e575]">AI</span>
          </span>
        </div>

        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-white">
          Sign In to Healthcare Portal
        </h2>
        <p className="mt-1 text-center text-xs text-slate-300">
          Agentic Hospital Discharge & Follow-up Coordinator
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#052429] border border-[#0e4851] py-8 px-6 shadow-2xl rounded-2xl sm:px-10"
        >
          {/* Role selection tab */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Demo Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'patient'
                    ? 'border-[#00e575] bg-[#00e575]/15 text-[#00e575] shadow-sm'
                    : 'border-[#0a383f] bg-[#072d33] text-slate-300 hover:border-[#145e69]'
                }`}
              >
                <User className="w-4 h-4" />
                PATIENT
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('doctor')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-[#00e575] bg-[#00e575]/15 text-[#00e575] shadow-sm'
                    : 'border-[#0a383f] bg-[#072d33] text-slate-300 hover:border-[#145e69]'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                DOCTOR / CARE COORD.
              </button>
            </div>
          </div>

          {/* Quick-fill credential badge */}
          <div className="p-3 mb-5 bg-[#072d33] rounded-xl border border-[#0e4851] text-xs text-slate-300 flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-[#00e575] shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-white">Preset Credentials Loaded:</span>
              <div className="mt-0.5 font-mono text-[11px] text-[#00e575] flex items-center justify-between">
                <span>{selectedRole === 'patient' ? 'patient / patient123' : 'doctor / doctor123'}</span>
                <span className="text-[10px] text-slate-400">Autofilled</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs text-white rounded-xl border border-[#0a383f] bg-[#072d33] focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] transition-all font-mono"
                placeholder={selectedRole === 'patient' ? 'patient' : 'doctor'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs text-white rounded-xl border border-[#0a383f] bg-[#072d33] focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] transition-all font-mono"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Sign In as {selectedRole === 'patient' ? 'Patient (Arun Kumar)' : 'Care Coordinator'}
            </button>
          </form>

          {/* Mandatory synthetic data note */}
          <div className="mt-6 pt-4 border-t border-[#0e4851] text-center">
            <p className="text-[11px] text-slate-400">
              ⚠️ Demo environment — synthetic healthcare data only.
            </p>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] text-[#00e575]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Session stored locally in browser session storage</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
