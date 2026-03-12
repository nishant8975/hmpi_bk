import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from "./pages/routes/ProtectedRoute";

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
import LandingPage from "./pages/LandingPage";

// ✅ Import Your Separate ChatBot File
import HMPIChatBot from "./components/HMPIChatBot"; 
// 🔁 If it's inside pages folder use:
// import HMPIChatBot from "./pages/HMPIChatBot";

import "./App.css";

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
          {/* --- Public Routes --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/help" element={<Help />} />

          {/* --- Protected Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProtectedLayout />}>

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/collaboration" element={<Collaboration />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/report-issue" element={<CommunityReportPage />} />

              <Route element={<ProtectedRoute allowedRoles={['researcher', 'admin']} />}>
                <Route path="/upload" element={<Upload />} />
                <Route path="/results" element={<Results />} />
                <Route path="/analysis-history" element={<AnalysisHistory />} />
                <Route path="/site/:siteId" element={<SiteDetailsPage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['policymaker', 'researcher', 'admin']} />}>
                <Route path="/reports" element={<Reports />} />
                <Route path="/alerts" element={<Alerts />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>

    {/* ✅ ALWAYS FLOATING – Bottom Right */}
    <div className="fixed bottom-6 right-6 z-[9999]">
      <HMPIChatBot />
    </div>

  </QueryClientProvider>
);


export default App;
