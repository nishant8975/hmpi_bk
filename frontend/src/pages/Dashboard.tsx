import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Upload, History, BellPlus } from "lucide-react";
import { getResearcherDashboardData } from "../service/api";

const getRiskBadgeVariant = (risk?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (risk?.toLowerCase()) {
    case 'high': return 'outline';
    case 'critical': return 'destructive';
    case 'moderate': return 'secondary';
    default: return 'default';
  }
};

const ResearcherDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['researcherDashboard'],
    queryFn: getResearcherDashboardData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-destructive">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {profile?.full_name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground">Here's a summary of your research and contributions.</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Button onClick={() => navigate('/upload')} size="lg" className="flex items-center justify-center gap-2">
            <Upload className="h-5 w-5" /> Upload New Dataset
          </Button>
          <Button onClick={() => navigate('/analysis-history')} variant="secondary" size="lg" className="flex items-center justify-center gap-2">
            <History className="h-5 w-5" /> View Full History
          </Button>
           <Button onClick={() => navigate('/alerts')} variant="outline" size="lg" className="flex items-center justify-center gap-2">
            <BellPlus className="h-5 w-5" /> Issue Manual Alert
          </Button>
        </CardContent>
      </Card>
      
      {/* At-a-Glance Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalAnalyses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High-Risk Samples</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.highRiskSamples}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerts Issued</CardTitle>
            <BellPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.alertsIssued}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Analyses Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site</TableHead>
                <TableHead>Sample Date</TableHead>
                <TableHead className="text-center">Risk Level</TableHead>
                <TableHead className="text-right">HMPI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentAnalyses?.length > 0 ? data.recentAnalyses.map((analysis: any) => (
                <TableRow key={analysis.id} className="cursor-pointer" onClick={() => navigate(`/results/${analysis.id}`)}>
                  <TableCell className="font-medium">{analysis.locations.site}</TableCell>
                  <TableCell>{new Date(analysis.sample_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getRiskBadgeVariant(analysis.pollution_indices[0]?.risk_level)}>
                      {analysis.pollution_indices[0]?.risk_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{analysis.pollution_indices[0]?.hmpi.toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">No recent analyses found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Dashboard component that decides which dashboard to show
const Dashboard = () => {
    const { profile } = useAuth();

    // If the user is a researcher or admin, show the new detailed dashboard
    if (profile?.role === 'researcher' || profile?.role === 'admin') {
        return <ResearcherDashboard />;
    }
    
    // Default dashboard for other roles (e.g., policymaker)
    return (
        <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome, {profile?.full_name}.</p>
            {/* We will build the PolicymakerDashboard component later */}
        </div>
    );
};


export default Dashboard;

