import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { SceneCanvas } from './three/SceneCanvas';
import { CustomCursor } from './three/CustomCursor';
import { JudgeModeTour } from './components/common/JudgeModeTour';
import { useSceneStore } from './three/useSceneStore';

// Code-split pages for instant route transitions & optimal bundle size
const LandingPage = React.lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = React.lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const PatientDashboard = React.lazy(() => import('./pages/PatientDashboard').then(m => ({ default: m.PatientDashboard })));
const PatientFollowUpsPage = React.lazy(() => import('./pages/patient/PatientFollowUpsPage').then(m => ({ default: m.PatientFollowUpsPage })));
const PatientUpcomingTasksPage = React.lazy(() => import('./pages/patient/PatientUpcomingTasksPage').then(m => ({ default: m.PatientUpcomingTasksPage })));
const PatientTestsReferralsPage = React.lazy(() => import('./pages/patient/PatientTestsReferralsPage').then(m => ({ default: m.PatientTestsReferralsPage })));
const DoctorDashboard = React.lazy(() => import('./pages/DoctorDashboard').then(m => ({ default: m.DoctorDashboard })));
const DoctorFollowUpsPage = React.lazy(() => import('./pages/doctor/DoctorFollowUpsPage').then(m => ({ default: m.DoctorFollowUpsPage })));
const DoctorUpcomingTasksPage = React.lazy(() => import('./pages/doctor/DoctorUpcomingTasksPage').then(m => ({ default: m.DoctorUpcomingTasksPage })));
const DoctorCareInstructionsPage = React.lazy(() => import('./pages/doctor/DoctorCareInstructionsPage').then(m => ({ default: m.DoctorCareInstructionsPage })));
const DoctorNotificationsPage = React.lazy(() => import('./pages/doctor/DoctorNotificationsPage').then(m => ({ default: m.DoctorNotificationsPage })));

function RouteWatcher() {
  const { pathname } = useLocation();
  const { setCurrentSection, setActiveRole } = useSceneStore();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    if (pathname.startsWith('/patient')) {
      setCurrentSection('patient');
      setActiveRole('patient');
    } else if (pathname.startsWith('/doctor')) {
      setCurrentSection('doctor');
      setActiveRole('doctor');
    } else {
      setCurrentSection('hero');
      setActiveRole(null);
    }
  }, [pathname, setCurrentSection, setActiveRole]);

  return null;
}

function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#03181b] text-teal-400">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#00e575] border-t-transparent animate-spin" />
        <span className="text-xs font-mono tracking-wider text-teal-300/80">Loading CareFlow AI...</span>
      </div>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global 3D Scene Canvas Persistent Layer */}
        <SceneCanvas />
        <CustomCursor />
        <JudgeModeTour />
        <RouteWatcher />

        <div className="relative z-10 min-h-screen">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/patient"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/follow-ups"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientFollowUpsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/tasks"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientUpcomingTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/tests-referrals"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientTestsReferralsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/care-instructions"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard defaultTab="instructions" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/instructions"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard defaultTab="instructions" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/timeline"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard defaultTab="timeline" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/reminders"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard defaultTab="reminders" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/profile"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard defaultTab="profile" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/patient/help"
                element={
                  <ProtectedRoute allowedRole="patient">
                    <PatientDashboard defaultTab="help" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/follow-ups"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorFollowUpsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/tasks"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorUpcomingTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/care-instructions"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorCareInstructionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/patients"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard defaultTab="patients" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/upload"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard defaultTab="upload" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/priority"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard defaultTab="priority" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/review"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard defaultTab="review" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/reminders"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard defaultTab="reminders" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/timeline"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard defaultTab="timeline" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/doctor/notifications"
                element={
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorNotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
