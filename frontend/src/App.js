import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import apiClient from './utils/apiClient';
import {
  AdminDashboardPage,
  ChangePasswordPage,
  DashboardPage,
  DrawsPage,
  HomePage,
  LoginPage,
  PhilanthropyPage,
  ScoreEntryPage,
  SignupPage,
  SubscriptionPage,
} from './pages';

const isAdminRole = (role) => String(role || '').trim().toLowerCase() === 'admin';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-surface" />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-surface" />;
  }

  return isAuthenticated && isAdminRole(user?.role) ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-surface" />;
  }

  if (!isAuthenticated) {
    return children;
  }

  const redirectPath = isAdminRole(user?.role) ? '/admin' : '/dashboard';
  return <Navigate to={redirectPath} replace />;
}

function SubscriptionRequiredRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    let active = true;

    const checkSubscription = async () => {
      if (!isAuthenticated) {
        if (active) {
          setHasActiveSubscription(false);
          setCheckingSubscription(false);
        }
        return;
      }

      if (isAdminRole(user?.role)) {
        if (active) {
          setHasActiveSubscription(true);
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
    return <div className="min-h-screen bg-surface" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRole(user?.role) || hasActiveSubscription) {
    return children;
  }

  return <Navigate to="/subscription" replace />;
}

function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <SignupPage />
              </PublicOnlyRoute>
            }
          />

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

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;
