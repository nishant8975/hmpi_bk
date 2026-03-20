import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  Download, 
  BarChart3, 
  MapPin,
  FileText,
  Calendar,
  Filter,
  PieChart,
  AlertCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getMapData, getPolicymakerReportRegions, getPolicymakerReportSummary, getPolicymakerReportTrend, downloadSiteReport } from "@/service/api";
import { Loader2 } from "lucide-react";

const Reports = () => {
  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ["policymakerReportSummary"],
    queryFn: getPolicymakerReportSummary,
    staleTime: 0,
  });

  const { data: trendResponse, isLoading: isTrendLoading } = useQuery({
    queryKey: ["policymakerReportTrend"],
    queryFn: getPolicymakerReportTrend,
    staleTime: 0,
  });

  const { data: regionsResponse, isLoading: isRegionsLoading } = useQuery({
    queryKey: ["policymakerReportRegions"],
    queryFn: getPolicymakerReportRegions,
    staleTime: 0,
  });

  const trendData = trendResponse?.trendData ?? [];
  const regionalData = regionsResponse?.regionalData ?? [];

  const stats = summaryData?.stats;

  const { data: mapData } = useQuery({
    queryKey: ["mapData"],
    queryFn: getMapData,
    staleTime: 0,
  });

  const sitesForDownload = mapData ?? [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Excellent': return 'safe';
      case 'Good': return 'safe';
      case 'Moderate': return 'warning';
      case 'Poor': return 'critical';
      default: return 'default';
    }
  };

  const isLoading = isSummaryLoading || isTrendLoading || isRegionsLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          value={stats?.averageHMPI ?? 0}
          subtitle="Average of latest HMPI per site"
          icon={BarChart3}
        />
        <StatCard
          title="Safe Sites %"
          value={
            stats && stats.totalSites > 0
              ? `${((stats.safeSites / stats.totalSites) * 100).toFixed(1)}%`
              : "0%"
          }
          subtitle="Sites below safe threshold"
          icon={MapPin}
          variant="safe"
        />
        <StatCard
          title="High + Critical"
          value={(stats?.highRiskSites ?? 0) + (stats?.criticalSites ?? 0)}
          subtitle="Latest per site"
          icon={TrendingUp}
          variant="critical"
        />
        <StatCard
          title="Total Sites"
          value={stats?.totalSites ?? 0}
          subtitle="Currently monitored locations"
          icon={FileText}
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

      {/* High-risk Site Downloads */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            All Sites (Download Reports)
          </CardTitle>
          <CardDescription>
            Download the full per-site HMPI + metal concentration report for action planning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sitesForDownload.length > 0 ? (
            <div className="space-y-3">
              {sitesForDownload.slice(0, 30).map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-4 p-3 border border-border/50 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">{p.site}</p>
                    <p className="text-sm text-muted-foreground">
                      HMPI:{" "}
                      {Number.isFinite(Number(p.hmpi)) ? Number(p.hmpi).toFixed(2) : "N/A"} • Risk:{" "}
                      <span className="capitalize">{p.risk_level}</span>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadSiteReport(String(p.id), "excel")}
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No high/critical sites found.</p>
          )}
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