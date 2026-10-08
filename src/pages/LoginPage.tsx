import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, User, Stethoscope, AlertCircle, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';
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
    const result = login(username, password);
    if (result.success) {
      if (result.role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/doctor');
      }
    } else {
      setErrorMessage(result.error || 'Failed to authenticate. Please verify demo credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-xs font-medium text-text-muted hover:text-primary-600 mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to CareFlow AI Overview
        </Link>
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-text-primary">
            CareFlow <span className="text-primary-600">AI</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-text-primary">
          Sign in to your Care Portal
        </h2>
        <p className="mt-1 text-center text-xs text-text-secondary">
          Phase 1 Interactive Prototype • Frontend Demonstration Authentication
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-6 shadow-sm border border-border rounded-2xl sm:px-10"
        >
          {/* Role selector tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-2.5">
              Select Demo Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  selectedRole === 'patient'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-2xs'
                    : 'border-border bg-white text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                <User className="w-4 h-4" />
                Patient
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('doctor')}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  selectedRole === 'doctor'
                    ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-2xs'
                    : 'border-border bg-white text-text-secondary hover:bg-surface-secondary'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Doctor / Care Team
              </button>
            </div>
          </div>

          {/* Quick preset banner */}
          <div className="p-3 mb-6 bg-surface-secondary rounded-xl border border-border-light text-xs text-text-secondary flex items-start gap-2.5">
            <KeyRound className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-primary">Demo Credentials Loaded:</span>
              <div className="mt-0.5 font-mono text-[11px] text-text-muted">
                {selectedRole === 'patient' ? 'user: patient | pass: patient123' : 'user: doctor | pass: doctor123'}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-coral-50 border border-coral-200 text-coral-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Username / Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder={selectedRole === 'patient' ? 'patient' : 'doctor'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 text-sm font-semibold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-sm hover:shadow"
            >
              Sign In as {selectedRole === 'patient' ? 'Patient' : 'Care Coordinator'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-border-light flex items-center justify-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Session Simulator (HIPAA Safe Placeholder)</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
