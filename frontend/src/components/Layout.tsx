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
  UserCheck,
  AlertTriangle,
  Moon,
  Sun,
  Users // 👈 New icon for Collaboration
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface LayoutProps {
  children: ReactNode;
}

const Navigation = () => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/upload", label: "Upload Data", icon: Upload },
    { path: "/results", label: "Results", icon: FlaskConical },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle },
    { path: "/collaboration", label: "Collaboration", icon: Users }, // 👈 Added here
    { path: "/help", label: "Help", icon: HelpCircle },
  ];

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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                asChild
                variant={isActive(path) ? "default" : "ghost"}
                className={cn(
                  "flex items-center space-x-2",
                  isActive(path) && "shadow-elegant"
                )}
              >
                <Link to={path}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              </Button>
            ))}
          </nav>

          {/* Right side: Dark Mode + Admin */}
          <div className="flex items-center space-x-2">
            {/* 🌙 Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

            {/* ⚙️ Admin Access */}
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin" className="flex items-center space-x-1">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm">
              <UserCheck className="w-4 h-4" />
            </Button>
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
