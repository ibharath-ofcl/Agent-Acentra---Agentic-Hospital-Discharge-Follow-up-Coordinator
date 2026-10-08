import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Prevent unauthenticated direct access, redirect to /login
    return <Navigate to="/login" state={{ from: location.pathname, requiredRole: allowedRole }} replace />;
  }

  // Prevent cross-role direct navigation (e.g. patient visiting /doctor or vice-versa)
  if (allowedRole && user.role !== allowedRole) {
    const targetPath = user.role === 'patient' ? '/patient' : '/doctor';
    return <Navigate to={targetPath} replace />;
  }

  return <>{children}</>;
}
