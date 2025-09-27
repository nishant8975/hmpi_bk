import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Upload, 
  BarChart3, 
  FileText, 
  HelpCircle,
  Settings,
  ArrowRight,
  Database,
  MapPin,
  PieChart,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";

export const SiteMap = () => {
  const pages = [
    {
      title: "Home Dashboard",
      icon: Home,
      path: "/",
      description: "Overview of all analysis results and quick actions",
      children: [
        { title: "Summary Cards", icon: BarChart3 },
        { title: "Recent Analyses", icon: Database },
        { title: "Quick Upload", icon: Upload },
        { title: "System Health", icon: Settings }
      ]
    },
    {
      title: "Upload Data",
      icon: Upload,
      path: "/upload",
      description: "Upload CSV/Excel datasets for HMPI analysis",
      children: [
        { title: "Drag & Drop Interface", icon: Upload },
        { title: "Data Validation", icon: Database },
        { title: "Sample Templates", icon: Download },
        { title: "Processing Status", icon: BarChart3 }
      ]
    },
    {
      title: "Results Analysis",
      icon: BarChart3,
      path: "/results",
      description: "View calculated HMPI values and risk assessments",
      children: [
        { title: "Table View", icon: Database },
        { title: "Charts & Graphs", icon: PieChart },
        { title: "Interactive Maps", icon: MapPin },
        { title: "Export Options", icon: Download }
      ]
    },
    {
      title: "Reports & Insights",
      icon: FileText,
      path: "/reports",
      description: "Generate comprehensive reports and trend analysis",
      children: [
        { title: "Trend Analysis", icon: BarChart3 },
        { title: "Regional Comparison", icon: MapPin },
        { title: "Custom Reports", icon: FileText },
        { title: "Export Formats", icon: Download }
      ]
    },
    {
      title: "Help & Support",
      icon: HelpCircle,
      path: "/help",
      description: "Documentation, FAQs, and technical support",
      children: [
        { title: "FAQs", icon: HelpCircle },
        { title: "HMPI Methodology", icon: Database },
        { title: "Contact Support", icon: FileText },
        { title: "API Documentation", icon: Settings }
      ]
    },
    {
      title: "Admin Dashboard",
      icon: Settings,
      path: "/admin",
      description: "System management for administrators",
      children: [
        { title: "User Management", icon: Database },
        { title: "Dataset Approval", icon: Upload },
        { title: "System Logs", icon: FileText },
        { title: "Configuration", icon: Settings }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Site Navigation Map</h1>
        <p className="text-muted-foreground">
          Complete overview of all application pages and features
        </p>
      </div>

      {/* Navigation Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {pages.map((page, index) => (
          <Card key={index} className="shadow-card hover:shadow-elegant transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <page.icon className="w-4 h-4 text-primary" />
                </div>
                {page.title}
              </CardTitle>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sub-features */}
              <div className="space-y-2">
                {page.children.map((child, childIndex) => (
                  <div key={childIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <child.icon className="w-3 h-3" />
                    <span>{child.title}</span>
                  </div>
                ))}
              </div>

              {/* Navigate Button */}
              <Button asChild variant="outline" className="w-full">
                <Link to={page.path} className="flex items-center justify-center gap-2">
                  Visit Page
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Flow Diagram */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Typical User Flow</CardTitle>
          <CardDescription>
            Common navigation paths for different user types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Researcher Flow */}
            <div className="p-4 bg-primary/5 rounded-lg">
              <h3 className="font-semibold text-primary mb-3">Researcher Workflow</h3>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="bg-background px-3 py-1 rounded-full border">Dashboard</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">Upload Data</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">View Results</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">Generate Report</span>
              </div>
            </div>

            {/* Policymaker Flow */}
            <div className="p-4 bg-accent/5 rounded-lg">
              <h3 className="font-semibold text-accent mb-3">Policymaker Workflow</h3>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="bg-background px-3 py-1 rounded-full border">Dashboard</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">View Results</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">Regional Analysis</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">Export Reports</span>
              </div>
            </div>

            {/* Admin Flow */}
            <div className="p-4 bg-chart-3/10 rounded-lg">
              <h3 className="font-semibold text-chart-3 mb-3">Administrator Workflow</h3>
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="bg-background px-3 py-1 rounded-full border">Admin Dashboard</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">User Management</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">Dataset Review</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="bg-background px-3 py-1 rounded-full border">System Settings</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};