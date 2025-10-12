import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react'; // For a loading indicator

// A simple full-page spinner to show while auth is being checked
const FullPageSpinner = () => (
  <div className="flex justify-center items-center h-screen w-screen bg-background">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  // ✨ FIX: Get the 'loading' state from the useAuth hook.
  const { user, profile, loading } = useAuth();

  // 1. First, check if the authentication process is still running.
  //    If it is, we must show a loading indicator and wait.
  if (loading) {
    return <FullPageSpinner />;
  }

  // 2. ONLY after loading is false, we can safely check for the user.
  //    If there's no user, redirect to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Finally, check if the user has the required role.
  if (allowedRoles && (!profile || !allowedRoles.includes(profile.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If all checks pass, render the requested page.
  return <Outlet />;
};

export default ProtectedRoute;

