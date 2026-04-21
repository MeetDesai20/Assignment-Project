import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import apiClient from './utils/apiClient';

// Pages
import {
  HomePage,
  LoginPage,
  SignupPage,
  DashboardPage,
  ScoreEntryPage,
  DrawsPage,
  PhilanthropyPage,
  AdminDashboardPage,
  SubscriptionPage,
  ChangePasswordPage,
} from './pages';

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin';

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin';

/**
 * Protected Route Wrapper
 * Redirect to login if not authenticated
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Admin Route Wrapper
 * Redirect to dashboard if not admin
 */
function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    );
  }

  return isAuthenticated && isAdminRole(user?.role) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function SubscriptionRequiredRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSubscription = async () => {
      if (!isAuthenticated || isAdminRole(user?.role)) {
        if (active) {
          setHasActiveSubscription(!!isAuthenticated);
          setCheckingSubscription(false);
        }
        return;
      }

      try {
        const response = await apiClient.get('/subscriptions/current');
        const currentSubscription = response.data?.data ?? null;
        if (active) {
          setHasActiveSubscription(currentSubscription?.status === 'active');
        }
      } catch (error) {
        if (active) {
          setHasActiveSubscription(false);
        }
      } finally {
        if (active) {
          setCheckingSubscription(false);
        }
      }
    };

    setCheckingSubscription(true);
    checkSubscription();

    return () => {
      active = false;
    };
  }, [isAuthenticated, user?.role]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-on-surface">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRole(user?.role) || hasActiveSubscription) {
    return children;
  }

  return <Navigate to="/subscription" replace />;
}

/**
 * Main App Component
 * Route configuration for the entire application
 */
function AppRoutes() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Check if user is still authenticated on app load
    checkAuth();
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <SubscriptionRequiredRoute>
            <DashboardPage />
          </SubscriptionRequiredRoute>
        }
      />
      <Route
        path="/score-entry"
        element={
          <SubscriptionRequiredRoute>
            <ScoreEntryPage />
          </SubscriptionRequiredRoute>
        }
      />
      <Route
        path="/draws"
        element={
          <SubscriptionRequiredRoute>
            <DrawsPage />
          </SubscriptionRequiredRoute>
        }
      />
      <Route
        path="/charity"
        element={
          <SubscriptionRequiredRoute>
            <PhilanthropyPage />
          </SubscriptionRequiredRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <SubscriptionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePasswordPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage />
          </AdminRoute>
        }
      />

      {/* Catch-all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Root App Component
 * Provides all contexts and routing
 */
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <AppRoutes />
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}
