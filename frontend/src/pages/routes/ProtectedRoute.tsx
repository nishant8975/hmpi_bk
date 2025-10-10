import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  // We only need user and profile here.
  // We trust AuthProvider to handle the 'loading' state.
  const { user, profile } = useAuth();

  // If the AuthProvider is finished and there's still no user, redirect.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user doesn't have the required role, redirect.
  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the page.
  return <Outlet />;
};

export default ProtectedRoute;

