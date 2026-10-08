import React, { createContext, useState, useEffect } from 'react';
import type { AuthState, AuthUser, LoginCredentials } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name);
      if (data.patient_id) {
        localStorage.setItem('patientId', data.patient_id);
      }

      setAuth({
        isAuthenticated: true,
        user: { id: data.patient_id || '1', role: data.role, name: data.name, email: credentials.email },
        token: data.access_token
      });
    } catch (e) {
      console.error(e);
      throw e;
    }
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
