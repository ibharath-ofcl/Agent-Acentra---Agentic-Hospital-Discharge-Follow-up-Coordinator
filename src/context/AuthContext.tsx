// ============================================================
// CareFlow AI — Demo Authentication Provider Component
// Phase 1: Frontend-only demo authentication.
// Provides local context state and sessionStorage persistence.
// ============================================================

import React, { useState, useCallback } from 'react';
import { AuthContext } from './authContextDef';
import { DEMO_CREDENTIALS } from '../types';
import type { AuthUser, AuthState, LoginResult } from '../types';

const STORAGE_KEY = 'careflow_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isAuthenticated && parsed.user) {
          return parsed;
        }
      }
    } catch {
      // Ignore parse errors from stale session data
    }
    return { user: null, isAuthenticated: false };
  });

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      const trimmedUser = username.trim();
      const trimmedPass = password.trim();

      // Subtle, tactile micro-delay (180ms) for realistic interaction feedback
      await new Promise((resolve) => setTimeout(resolve, 180));

      if (
        trimmedUser === DEMO_CREDENTIALS.patient.username &&
        trimmedPass === DEMO_CREDENTIALS.patient.password
      ) {
        const user: AuthUser = {
          username: DEMO_CREDENTIALS.patient.username,
          role: DEMO_CREDENTIALS.patient.role,
          name: DEMO_CREDENTIALS.patient.name,
        };
        const newState: AuthState = { user, isAuthenticated: true };
        setAuth(newState);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return { success: true, role: 'patient' };
      }

      if (
        trimmedUser === DEMO_CREDENTIALS.doctor.username &&
        trimmedPass === DEMO_CREDENTIALS.doctor.password
      ) {
        const user: AuthUser = {
          username: DEMO_CREDENTIALS.doctor.username,
          role: DEMO_CREDENTIALS.doctor.role,
          name: DEMO_CREDENTIALS.doctor.name,
        };
        const newState: AuthState = { user, isAuthenticated: true };
        setAuth(newState);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return { success: true, role: 'doctor' };
      }

      return {
        success: false,
        error: 'Invalid username or password. Please use the demo credentials provided below.',
      };
    },
    []
  );

  const logout = useCallback(() => {
    setAuth({ user: null, isAuthenticated: false });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        isAuthenticated: auth.isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
