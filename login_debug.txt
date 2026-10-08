import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Activity,
  User,
  Stethoscope,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../hooks/useAuth';
import type { UserRole } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  // If redirected from a protected route, extract target path or required role
  const redirectedFrom = (location.state as { from?: string; requiredRole?: UserRole })?.from;
  const initialRole: UserRole =
    redirectedFrom === '/doctor' ? 'doctor' : 'patient';

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [username, setUsername] = useState(DEMO_CREDENTIALS[initialRole].username);
  const [password, setPassword] = useState(DEMO_CREDENTIALS[initialRole].password);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'patient') {
      setUsername(DEMO_CREDENTIALS.patient.username);
      setPassword(DEMO_CREDENTIALS.patient.password);
    } else {
      setUsername(DEMO_CREDENTIALS.doctor.username);
      setPassword(DEMO_CREDENTIALS.doctor.password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(username.trim(), password.trim());

      if (result.success) {
        if (result.role === 'patient') {
          navigate('/patient', { replace: true });
        } else {
          navigate('/doctor', { replace: true });
        }
      } else {
        setErrorMessage(
          result.error ||
            'Invalid username or password. Please use the demo credentials provided below.'
        );
      }
    } catch {
      setErrorMessage('An unexpected error occurred during demo login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03181b] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <Link
          to="/"
          className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white mb-6 transition-colors"
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

        {/* Redirect notice if redirected from protected route */}
        {redirectedFrom && (
          <div className="mt-4 w-full p-3 bg-[#0a383f]/80 border border-[#145e69] rounded-xl text-xs text-slate-200 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#00e575] shrink-0" />
            <span>
              Authentication required to access {redirectedFrom === '/doctor' ? 'Doctor Command Center' : 'Patient Portal'}. Please sign in below.
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 w-full max-w-md relative z-10">
        <div className="bg-[#052429] border border-[#0e4851] py-8 px-6 shadow-2xl rounded-xl sm:px-10">
          {/* Role selection tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2.5">
              Select Demo Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect('patient')}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Preset Demo Credentials:</span>
                <span className="text-[10px] text-slate-400">Autofilled</span>
              </div>
              <div className="mt-1 font-mono text-[11px] text-[#00e575] bg-[#052429] px-2 py-1 rounded border border-[#0a383f]">
                {selectedRole === 'patient' ? (
                  <span>username: <strong>patient</strong> | password: <strong>patient123</strong></span>
                ) : (
                  <span>username: <strong>doctor</strong> | password: <strong>doctor123</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
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
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isSubmitting}
                required
                className="w-full px-3.5 py-2.5 text-xs text-white rounded-xl border border-[#0a383f] bg-[#072d33] focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] transition-all font-mono"
                placeholder={selectedRole === 'patient' ? 'patient' : 'doctor'}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  disabled={isSubmitting}
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs text-white rounded-xl border border-[#0a383f] bg-[#072d33] focus:outline-none focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] transition-all font-mono"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 text-xs font-bold text-[#052429] bg-[#00e575] hover:bg-[#00cb68] disabled:opacity-75 disabled:cursor-not-allowed rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>
                    Sign In as {selectedRole === 'patient' ? 'Patient (Arun Kumar)' : 'Doctor (Dr. Meera Patel)'}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Mandatory demo environment note */}
          <div className="mt-6 pt-4 border-t border-[#0e4851] text-center space-y-2">
            <p className="text-xs text-amber-300 font-medium">
              Demo environment — synthetic healthcare data only.
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00e575]" />
              <span>Frontend-only session authentication • No backend required</span>
            </div>
            {isAuthenticated && user && (
              <p className="text-[11px] text-[#00e575] font-semibold pt-1">
                Currently signed in as {user.name} ({user.role})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
