import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';
import DonorDashboard from './pages/DonorDashboard';
import TrustDashboard from './pages/TrustDashboard';
import AdminDashboard from './pages/AdminDashboard';

function Home() {
  const { userProfile } = useAuth();
  
  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }
  
  if (userProfile.role === 'donor') return <Navigate to="/donor" replace />;
  if (userProfile.role === 'trust') return <Navigate to="/trust" replace />;
  if (userProfile.role === 'admin') return <Navigate to="/admin" replace />;
  
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public Routes without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/complete-profile" element={<CompleteProfile />} />
            
            {/* Routes with Layout */}
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
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
