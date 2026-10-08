// ============================================================
// CareFlow AI — useAuth Custom Hook
// Consumes AuthContext for role-based authentication and actions.
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/authContextDef';
import { DEMO_CREDENTIALS } from '../types';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { DEMO_CREDENTIALS };
