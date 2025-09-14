import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Results from "./pages/Results";
import Reports from "./pages/Reports";
import Help from "./pages/Help";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Alerts from "./pages/Alerts";
import { Alert } from "./components/ui/alert";
import { ThemeProvider } from "next-themes";
import Collaboration from "./pages/Collaboration";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/results" element={<Results />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/help" element={<Help />} />
            <Route path="/Alerts" element={<Alerts />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
