import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { currentUser, userProfile } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If they are logged in but haven't completed their profile
  if (!userProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If a specific role is required and it doesn't match
  if (allowedRole && userProfile.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}
