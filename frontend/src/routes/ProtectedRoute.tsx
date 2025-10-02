// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Make sure the path is correct

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  // 1. While the session is loading, show a loading message
  if (loading) {
    return <div>Loading session...</div>;
  }

  // 2. If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If the route requires a specific role and the user's role doesn't match, redirect
  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    // You can redirect to a dedicated 'unauthorized' page or a general dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. If all checks pass, render the requested page
  return <Outlet />;
};

export default ProtectedRoute;