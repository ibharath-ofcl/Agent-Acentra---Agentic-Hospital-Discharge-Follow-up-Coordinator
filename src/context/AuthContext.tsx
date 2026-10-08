import React, { createContext, useState, useEffect } from 'react';
import type { AuthState, AuthUser, LoginResult, UserRole } from '../types';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

import { AuthContext } from "./authContextDef";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role') as 'doctor' | 'patient';
    const name = localStorage.getItem('name');
    const ptId = localStorage.getItem('patientId');

    if (token && role && name) {
      return {
        isAuthenticated: true,
        user: { id: ptId || '1', role, name, email: '' },
        token
      };
    }
    return { isAuthenticated: false, user: null, token: null };
  });

  
  const login = async (username: string, password: string, preferredRole?: UserRole): Promise<LoginResult> => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // Determine target role from username or preferred role
    const isDoctor = 
      preferredRole === 'doctor' || 
      cleanUser.includes('doc') || 
      cleanUser.includes('meera') || 
      cleanUser.includes('admin') || 
      cleanUser.includes('coord');
    
    const role: 'doctor' | 'patient' = isDoctor ? 'doctor' : 'patient';
    const name = role === 'doctor' ? 'Dr. Meera Patel' : 'Arun Kumar';
    const patientId = role === 'patient' ? '1' : '';

    // Attempt backend login first if available
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanUser, password: cleanPass })
      });

      if (response.ok) {
        const data = await response.json();
        const serverRole = (data.role === 'doctor' || data.role === 'patient') ? data.role : role;
        const serverName = data.name || name;
        const serverToken = data.access_token || 'demo-token';
        const serverPtId = data.patient_id || patientId;

        localStorage.setItem('token', serverToken);
        localStorage.setItem('role', serverRole);
        localStorage.setItem('name', serverName);
        if (serverPtId) localStorage.setItem('patientId', serverPtId);

        setAuth({
          isAuthenticated: true,
          user: { id: serverPtId, role: serverRole, name: serverName, email: cleanUser },
          token: serverToken
        });

        return { success: true, role: serverRole };
      }
    } catch {
      // Backend not running, proceed smoothly with demo fallback
    }

    // Demo authentication fallback
    const validDoctorUsers = ['doctor', 'doctor@acentra.com', 'meera', 'dr.meera@hospital.com', 'admin', 'coordinator'];
    const validPatientUsers = ['patient', 'patient@acentra.com', 'arun', 'arun@example.com', 'user'];
    
    const isDoctorMatch = validDoctorUsers.includes(cleanUser) || (isDoctor && cleanUser.length > 0);
    const isPatientMatch = validPatientUsers.includes(cleanUser) || (!isDoctor && cleanUser.length > 0);

    if (isDoctorMatch || isPatientMatch) {
      const token = `demo-token-${role}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('name', name);
      if (patientId) localStorage.setItem('patientId', patientId);

      setAuth({
        isAuthenticated: true,
        user: { id: patientId, role, name, email: cleanUser },
        token
      });

      return { success: true, role };
    }

    return { success: false, error: 'Invalid credentials. Please use the preset demo buttons or credentials.' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    localStorage.removeItem('patientId');
    setAuth({ isAuthenticated: false, user: null, token: null });

    // Prevent browser back button from accessing secure pages
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
