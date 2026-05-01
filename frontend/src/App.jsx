/**
 * App.jsx — root component.
 * Sets up routing, auth context, toaster, AOS initialization,
 * and the route-level guards for Public/Private/Admin access.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Flights from './pages/Flights';
import Booking from './pages/Booking';
import Passenger from './pages/Passenger';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import AdminDashboard from './pages/AdminDashboard';
import Help from './pages/Help';
import NotFound from './pages/NotFound';

import './index.css';

/* ──────────────────────────────────────────────────────────
   Route guards — displayed while auth loads and redirects
   ────────────────────────────────────────────────────────── */

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_staff) return <Navigate to="/" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  return user ? <Navigate to="/" replace /> : children;
}

/* ──────────────────────────────────────────────────────────
   App shell — wraps everything with Navbar + Footer
   ────────────────────────────────────────────────────────── */

function AppShell() {
  // Initialize AOS once when the shell mounts
  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <ScrollToTop />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/help" element={<Help />} />

          {/* Public-only (redirects to home if already logged in) */}
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

          {/* Password reset & email verification — always public (reached via email links) */}
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Private — requires login */}
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/flights" element={<PrivateRoute><Flights /></PrivateRoute>} />
          <Route path="/bookings" element={<PrivateRoute><Booking /></PrivateRoute>} />
          <Route path="/passengers" element={<AdminRoute><Passenger /></AdminRoute>} />

          {/* Admin only — requires is_staff flag */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
          <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Root export
   ────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#191c1d',
              border: '1px solid #c4c6cf',
              borderRadius: 12,
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#009b50', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#ba1a1a', secondary: '#ffffff' } },
          }}
        />
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
