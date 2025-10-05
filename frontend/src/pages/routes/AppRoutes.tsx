// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Import your page components
// For now, we can create simple placeholders here until you build the actual pages.
const Login = () => <h2>Login Page</h2>;
const PublicMap = () => <h2>Public Contamination Map</h2>;
const ResearcherDashboard = () => <h3>Researcher Data Upload Dashboard</h3>;
const PolicymakerDashboard = () => <h3>Policymaker Decision Dashboard</h3>;
const AdminDashboard = () => <h3>Admin Control Panel</h3>;
const Unauthorized = () => <h2>403 - You are not authorized to view this page.</h2>;
const NotFound = () => <h2>404 - Page Not Found</h2>;


const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/map" element={<PublicMap />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* --- Protected Routes --- */}

      {/* Routes for Researchers and Admins */}
      <Route element={<ProtectedRoute allowedRoles={['researcher', 'admin']} />}>
        <Route path="/researcher/dashboard" element={<ResearcherDashboard />} />
      </Route>

      {/* Routes for Policymakers and Admins */}
      <Route element={<ProtectedRoute allowedRoles={['policymaker', 'admin']} />}>
        <Route path="/policymaker/dashboard" element={<PolicymakerDashboard />} />
      </Route>

      {/* Routes for Admins ONLY */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all Route for 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;