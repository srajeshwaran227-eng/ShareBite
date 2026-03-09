import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Component } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';
import DonorDashboard from './pages/DonorDashboard';
import TrustDashboard from './pages/TrustDashboard';
import AdminDashboard from './pages/AdminDashboard';

// ── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('App crashed:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#F5F0E8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', padding: '2rem', textAlign: 'center', fontFamily: 'Nunito, sans-serif'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#2C3E1F', marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#9EAD82', fontSize: '0.85rem', maxWidth: '360px', marginBottom: '1.5rem' }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button onClick={() => window.location.reload()}
            style={{ padding: '0.7rem 1.5rem', background: '#E8622A', color: '#fff', border: 'none', borderRadius: '999px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Home redirect ────────────────────────────────────────────────────────────
function Home() {
  const { userProfile } = useAuth();
  if (!userProfile) return <Navigate to="/login" replace />;
  if (userProfile.role === 'donor') return <Navigate to="/donor" replace />;
  if (userProfile.role === 'trust') return <Navigate to="/trust" replace />;
  if (userProfile.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/login" replace />;
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Routes>
              {/* Public */}
              <Route path="/login"            element={<Login />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />

              {/* Protected with Layout */}
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />

                <Route path="/donor" element={
                  <ProtectedRoute allowedRole="donor">
                    <DonorDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/trust" element={
                  <ProtectedRoute allowedRole="trust">
                    <TrustDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/admin" element={
                  <ProtectedRoute allowedRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
