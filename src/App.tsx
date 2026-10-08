import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { SceneCanvas } from './three/SceneCanvas';
import { CustomCursor } from './three/CustomCursor';
import { JudgeModeTour } from './components/common/JudgeModeTour';
import { useSceneStore } from './three/useSceneStore';

function RouteWatcher() {
  const { pathname } = useLocation();
  const { setCurrentSection, setActiveRole } = useSceneStore();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });

    if (pathname === '/patient') {
      setCurrentSection('patient');
      setActiveRole('patient');
    } else if (pathname === '/doctor') {
      setCurrentSection('doctor');
      setActiveRole('doctor');
    } else {
      setCurrentSection('hero');
      setActiveRole(null);
    }
  }, [pathname, setCurrentSection, setActiveRole]);

  return null;
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
              path="/doctor"
              element={
                <ProtectedRoute allowedRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
