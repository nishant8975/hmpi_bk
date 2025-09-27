import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Download, 
  BarChart3, 
  MapPin,
  FileText,
  Calendar,
  Filter,
  PieChart
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Reports = () => {
  // Mock trend data
  const trendData = [
    { month: 'Jan', avgHMPI: 145, safeSites: 78, criticalSites: 12 },
    { month: 'Feb', avgHMPI: 152, safeSites: 75, criticalSites: 15 },
    { month: 'Mar', avgHMPI: 138, safeSites: 82, criticalSites: 10 },
    { month: 'Apr', avgHMPI: 142, safeSites: 80, criticalSites: 11 },
    { month: 'May', avgHMPI: 135, safeSites: 85, criticalSites: 8 },
    { month: 'Jun', avgHMPI: 128, safeSites: 88, criticalSites: 6 },
  ];

  const regionalData = [
    { region: 'North District', sites: 45, avgHMPI: 125, status: 'Good' },
    { region: 'South District', sites: 38, avgHMPI: 165, status: 'Moderate' },
    { region: 'East District', sites: 52, avgHMPI: 89, status: 'Excellent' },
    { region: 'West District', sites: 41, avgHMPI: 245, status: 'Poor' },
    { region: 'Central District', sites: 35, avgHMPI: 178, status: 'Moderate' },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Excellent': return 'safe';
      case 'Good': return 'safe';
      case 'Moderate': return 'warning';
      case 'Poor': return 'critical';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Insights</h1>
          <p className="text-muted-foreground">Comprehensive analysis of water quality trends and patterns</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter Period
          </Button>
          <Button className="shadow-elegant">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average HMPI"
          value="142.3"
          subtitle="Across all monitored sites"
          icon={BarChart3}
          trend={{ value: -5.2, isPositive: true }}
        />
        <StatCard
          title="Safe Sites"
          value="73%"
          subtitle="Below pollution threshold"
          icon={MapPin}
          variant="safe"
          trend={{ value: 8.1, isPositive: true }}
        />
        <StatCard
          title="Improvement Rate"
          value="+12%"
          subtitle="Since last quarter"
          icon={TrendingUp}
          variant="safe"
        />
        <StatCard
          title="Reports Generated"
          value="28"
          subtitle="This month"
          icon={FileText}
          trend={{ value: 25.3, isPositive: true }}
        />
      </div>

      {/* Trend Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HMPI Trend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              HMPI Trend Analysis
            </CardTitle>
            <CardDescription>
              6-month trend of average Heavy Metal Pollution Index
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgHMPI" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Site Status Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Site Status Distribution
            </CardTitle>
            <CardDescription>
              Monthly progression of safe vs critical sites
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="safeSites" 
                    stackId="1"
                    stroke="hsl(var(--risk-safe))"
                    fill="hsl(var(--risk-safe))"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="criticalSites" 
                    stackId="1"
                    stroke="hsl(var(--risk-critical))"
                    fill="hsl(var(--risk-critical))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Comparison */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Regional Comparison
          </CardTitle>
          <CardDescription>
            Water quality comparison across different monitoring districts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionalData.map((region, index) => (
              <Card key={index} className="border border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{region.region}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monitoring Sites</span>
                    <span className="font-semibold">{region.sites}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg HMPI</span>
                    <span className="font-semibold">{region.avgHMPI}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge 
                      className={
                        region.status === 'Excellent' ? 'bg-risk-safe text-risk-safe-foreground' :
                        region.status === 'Good' ? 'bg-risk-safe text-risk-safe-foreground' :
                        region.status === 'Moderate' ? 'bg-risk-moderate text-risk-moderate-foreground' :
                        'bg-risk-critical text-risk-critical-foreground'
                      }
                    >
                      {region.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Reports */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Quick Report Generation
            </CardTitle>
            <CardDescription>
              Generate standardized reports for different stakeholders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Monthly Summary Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MapPin className="w-4 h-4 mr-2" />
              Regional Assessment Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trend Analysis Report
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Executive Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Export Options */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Export & Sharing
            </CardTitle>
            <CardDescription>
              Download reports in various formats for presentations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                PDF Report
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Excel Data
              </Button>
              <Button variant="outline" size="sm">
                <PieChart className="w-4 h-4 mr-2" />
                PowerPoint
              </Button>
              <Button variant="outline" size="sm">
                <MapPin className="w-4 h-4 mr-2" />
                CSV Export
              </Button>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                Customize export parameters:
              </p>
              <div className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Include risk assessment details
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Add methodology appendix
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                  Include recommendations
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;