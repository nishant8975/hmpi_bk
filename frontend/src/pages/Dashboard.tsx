import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  FlaskConical, 
  Upload, 
  AlertTriangle, 
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  BarChart3,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  // Mock data
  const recentAnalyses = [
    { id: 1, location: "Site A-01", hmpi: 85.2, risk: "safe", date: "2024-01-15" },
    { id: 2, location: "Site B-03", hmpi: 245.7, risk: "high", date: "2024-01-14" },
    { id: 3, location: "Site C-12", hmpi: 156.3, risk: "moderate", date: "2024-01-13" },
    { id: 4, location: "Site D-08", hmpi: 378.9, risk: "critical", date: "2024-01-12" },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Monitor heavy metal pollution levels across your sites</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="shadow-elegant">
            <Link to="/upload">
              <Plus className="w-4 h-4 mr-2" />
              Upload Dataset
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/results">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Results
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Samples"
          value="1,247"
          subtitle="Analyzed this month"
          icon={FlaskConical}
          trend={{ value: 12.5, isPositive: true }}
          variant="default"
        />
        <StatCard
          title="Safe Sites"
          value="892"
          subtitle="71.5% of total sites"
          icon={MapPin}
          variant="safe"
        />
        <StatCard
          title="High Risk Sites"
          value="89"
          subtitle="Require attention"
          icon={AlertTriangle}
          trend={{ value: -8.2, isPositive: true }}
          variant="warning"
        />
        <StatCard
          title="Critical Sites"
          value="23"
          subtitle="Immediate action needed"
          icon={TrendingUp}
          trend={{ value: -15.3, isPositive: true }}
          variant="critical"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Start analyzing your water quality data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full justify-start bg-gradient-primary">
              <Link to="/upload">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Upload New Dataset
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start">
              <Link to="/results">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Latest Results
              </Link>
            </Button>
            <Button variant="ghost" asChild className="w-full justify-start">
              <Link to="/reports">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Report
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Analyses */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>
              Latest HMPI calculations from your uploaded datasets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses.map((analysis) => (
                <div key={analysis.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{analysis.location}</p>
                    <p className="text-sm text-muted-foreground">{analysis.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-foreground">
                      {analysis.hmpi}
                    </span>
                    <RiskBadge level={analysis.risk} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>
            Current system performance and data processing status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Processing</span>
                <span>95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span>67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response</span>
                <span>99.8%</span>
              </div>
              <Progress value={99.8} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;