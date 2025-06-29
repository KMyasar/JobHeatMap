import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useProfile } from './hooks/useProfile';

// Pages
import { SignInPage } from './pages/auth/SignInPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { HomePage } from './pages/HomePage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { ResumeAnalysisPage } from './pages/ResumeAnalysisPage';
import { RoleSuggestionsPage } from './pages/RoleSuggestionsPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { SettingsPage } from './pages/SettingsPage';
import { CircularVisualizationDemo } from './pages/CircularVisualizationDemo';

// Profile Check Component
const ProfileChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  useEffect(() => {
    // Don't check profile if still loading auth or if user is not authenticated
    if (authLoading || !user) {
      return;
    }

    // Don't redirect if we're already on auth pages
    if (location.pathname.startsWith('/auth/')) {
      return;
    }

    // Wait for profile to load
    if (profileLoading) {
      return;
    }

    // Only check once per session to avoid infinite loops
    if (hasCheckedProfile) {
      return;
    }

    setHasCheckedProfile(true);

    // Check if profile is complete
    const isProfileComplete = profile && 
                             profile.full_name && 
                             profile.full_name.trim() !== '' && 
                             profile.skills && 
                             profile.skills.length > 0;

    if (!isProfileComplete && location.pathname !== '/setup-profile') {
      // Profile incomplete, redirect to setup
      navigate('/setup-profile', { replace: true });
    } else if (isProfileComplete && location.pathname === '/setup-profile') {
      // Profile complete but on setup page, redirect to home
      navigate('/', { replace: true });
    }
  }, [user, profile, authLoading, profileLoading, navigate, location.pathname, hasCheckedProfile]);

  // Reset check flag when user changes
  useEffect(() => {
    setHasCheckedProfile(false);
  }, [user?.id]);

  return <>{children}</>;
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  return <>{children}</>;
};

// Public Route Component
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Profile Setup Route Component
const ProfileSetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // If profile is already complete, redirect to home
  const isProfileComplete = profile && 
                           profile.full_name && 
                           profile.full_name.trim() !== '' && 
                           profile.skills && 
                           profile.skills.length > 0;

  if (isProfileComplete) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <ProfileChecker>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/auth/signin"
          element={
            <PublicRoute>
              <SignInPage />
            </PublicRoute>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          }
        />

        {/* Profile Setup Route */}
        <Route
          path="/setup-profile"
          element={
            <ProfileSetupRoute>
              <ProfileSetupPage />
            </ProfileSetupRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-analysis"
          element={
            <ProtectedRoute>
              <ResumeAnalysisPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/role-suggestions"
          element={
            <ProtectedRoute>
              <RoleSuggestionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/heatmap"
          element={
            <ProtectedRoute>
              <HeatmapPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/circular-demo"
          element={
            <ProtectedRoute>
              <CircularVisualizationDemo />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProfileChecker>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;