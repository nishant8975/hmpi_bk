import { useAuth } from "../hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getPolicymakerDashboardData } from "../service/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Map, Bell, BarChart2 } from "lucide-react";
import MapView from '../pages/map view/MapView'; // We'll reuse the MapView component

const PolicymakerDashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['policymakerDashboard'],
    queryFn: getPolicymakerDashboardData,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-destructive text-center py-12">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Policymaker Dashboard</h1>
        <p className="text-muted-foreground">A high-level overview of regional water quality and active alerts.</p>
      </div>
      
      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites Monitored</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalSites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High/Critical Risk Sites</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.highRiskSites}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeAlerts}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Live Map View */}
        <div className="lg:col-span-2">
           <Card>
             <CardHeader>
                <CardTitle>Live Contamination Map</CardTitle>
             </CardHeader>
             <CardContent>
                <MapView />
             </CardContent>
           </Card>
        </div>

        {/* Latest Alerts Feed */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Latest Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.latestAlerts?.length > 0 ? data.latestAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                        <Bell className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                        <p className="text-sm font-medium leading-none truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.water_samples?.locations?.site || 'Unknown Site'} - {new Date(alert.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
              )) : (
                <p className="text-sm text-center text-muted-foreground py-8">No active alerts.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PolicymakerDashboard;

