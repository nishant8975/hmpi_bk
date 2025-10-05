import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  FlaskConical, 
  Upload, 
  BarChart3, 
  FileText, 
  HelpCircle,
  Settings,
  AlertTriangle,
  Moon,
  Sun,
  Users,
  History,
  FlaskConicalIcon,
  Map // ✨ New Icon for Map View
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuth } from "../hooks/useAuth"; // For checking user role
import UserProfile from "./auth/UserProfile"; // For the dropdown menu

interface LayoutProps {
  children: ReactNode;
}

const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { profile } = useAuth(); // Get the user's profile and role
  const isActive = (path: string) => location.pathname === path;

  // A complete list of all possible navigation items with their required roles
  const allNavItems = [
    // Public User links
    { path: "/", label: "Map View", icon: Map, roles: ['public'] },

    // Professional User links
    { path: "/", label: "Dashboard", icon: BarChart3, roles: ['researcher', 'policymaker', 'admin'] },
    { path: "/upload", label: "Upload Data", icon: Upload, roles: ['researcher', 'admin'] },
    { path: "/analysis-history", label: "Analysis History", icon: History, roles: ['researcher', 'admin'] },
    { path: "/reports", label: "Reports", icon: FileText, roles: ['policymaker', 'admin'] },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle, roles: ['policymaker', 'researcher', 'admin'] },
    
    // Shared links
    { path: "/help", label: "Help", icon: HelpCircle, roles: ['public', 'researcher', 'policymaker', 'admin'] },
  ];

  // Filter the navigation items based on the current user's role
  const navItems = allNavItems.filter(item => {
    // If user is not logged in, only show items available to 'public'
    if (!profile) return item.roles.includes('public');
    // If user is logged in, show items that include their role
    return item.roles.includes(profile.role);
  });

  return (
    <header className="border-b bg-card shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HMPI Analyzer</h1>
              <p className="text-xs text-muted-foreground">Heavy Metal Pollution Index</p>
            </div>
          </Link>

          {/* Dynamic Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                asChild
                variant={isActive(path) ? "default" : "ghost"}
                className={cn( "flex items-center space-x-2", isActive(path) && "shadow-elegant" )}
              >
                <Link to={path}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          {/* Right side: Dark Mode + Admin + User Profile */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? ( <Moon className="w-4 h-4" /> ) : ( <Sun className="w-4 h-4" /> )}
            </Button>

            {/* Conditional Admin Access Button */}
            {profile?.role === 'admin' && (
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin" className="flex items-center space-x-1">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}

            {/* Functional User Profile Dropdown */}
            <UserProfile />
          </div>
        </div>
      </div>
    </header>
  );
};

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

