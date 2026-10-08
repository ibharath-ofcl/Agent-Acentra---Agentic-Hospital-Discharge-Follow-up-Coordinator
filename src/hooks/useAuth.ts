// ============================================================
// CareFlow AI — Demo Authentication Hook
// Phase 1: Frontend-only demo auth.
// Replace with real authentication in a future phase.
// ============================================================

import { useState, useCallback } from 'react';
import type { UserRole } from '../types';

interface AuthUser {
  username: string;
  role: UserRole;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

// Demo credentials — NOT real authentication
const DEMO_CREDENTIALS = {
  patient: { username: 'patient', password: 'patient123', role: 'patient' as UserRole, name: 'Arun Kumar' },
  doctor: { username: 'doctor', password: 'doctor123', role: 'doctor' as UserRole, name: 'Dr. Meera Patel' },
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const stored = sessionStorage.getItem('careflow_auth');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { user: null, isAuthenticated: false };
      }
    }
    return { user: null, isAuthenticated: false };
  });

  const login = useCallback((username: string, password: string): { success: boolean; error?: string; role?: UserRole } => {
    // Demo login logic — replace with real API call
    const patientCred = DEMO_CREDENTIALS.patient;
    const doctorCred = DEMO_CREDENTIALS.doctor;

    if (username === patientCred.username && password === patientCred.password) {
      const user: AuthUser = { username: patientCred.username, role: patientCred.role, name: patientCred.name };
      const state = { user, isAuthenticated: true };
      setAuth(state);
      sessionStorage.setItem('careflow_auth', JSON.stringify(state));
      return { success: true, role: 'patient' };
    }

    if (username === doctorCred.username && password === doctorCred.password) {
      const user: AuthUser = { username: doctorCred.username, role: doctorCred.role, name: doctorCred.name };
      const state = { user, isAuthenticated: true };
      setAuth(state);
      sessionStorage.setItem('careflow_auth', JSON.stringify(state));
      return { success: true, role: 'doctor' };
    }

    return { success: false, error: 'Invalid credentials. Use demo credentials to log in.' };
  }, []);

  const logout = useCallback(() => {
    setAuth({ user: null, isAuthenticated: false });
    sessionStorage.removeItem('careflow_auth');
  }, []);

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login,
    logout,
  };
}
