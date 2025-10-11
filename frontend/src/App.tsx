import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from './pages/routes/ProtectedRoute';



// Pages
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Reports from "./pages/Reports";
import Help from "./pages/Help";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Alerts from "./pages/Alerts";
import Collaboration from "./pages/Collaboration";
import Login from "./pages/Login";
import ProfilePage from "./components/auth/ProfilePage";
import AnalysisHistory from "./pages/AnalysisHistory";
import SiteDetailsPage from "./pages/SiteDetailsPage";
import CommunityReportPage from "./pages/CommunityReportPage";

// Import Landing Page
import LandingPage from "./pages/LandingPage"; // Add this import

import './App.css';

const queryClient = new QueryClient();

const ProtectedLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* --- Public Routes (No Layout) --- */}
          <Route path="/" element={<LandingPage />} /> {/* Add Landing Page Route */}
          <Route path="/login" element={<Login />} />
          <Route path="/help" element={<Help />} />

          {/* --- Protected Routes (All use the main Layout) --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>
              {/* Routes for ANY logged-in user */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/report-issue" element={<CommunityReportPage />} />

              {/* NESTED role-specific routes */}
              
              {/* Routes for Researchers & Admins */}
              <Route element={<ProtectedRoute allowedRoles={['researcher', 'admin']} />}>
                <Route path="/upload" element={<Upload />} />
                <Route path="/results" element={<Results />} />
                <Route path="/analysis-history" element={<AnalysisHistory />} />
                <Route path="/site/:siteId" element={<SiteDetailsPage />} />
              </Route>

              {/* Routes for Policymakers, Researchers & Admins */}
              <Route element={<ProtectedRoute allowedRoles={['policymaker', 'researcher', 'admin']} />}>
                <Route path="/reports" element={<Reports />} />
                <Route path="/alerts" element={<Alerts />} />  
              </Route>

              {/* Routes for Admins ONLY */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Route>
          </Route>

          {/* --- Catch-all route must stay at the very bottom --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

