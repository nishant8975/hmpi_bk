import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSiteDetails } from "../service/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, MapPin, BarChart, History, BellPlus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "../hooks/useAuth"; 

const WHO_STANDARDS: Record<string, number> = {
  As: 0.01, Cd: 0.003, Cr: 0.05, Cu: 2.0, Fe: 0.3, Mn: 0.4, Ni: 0.07, Pb: 0.01, Zn: 5.0,
};

const METAL_COLORS: Record<string, string> = {
  As: "#8884d8", Cd: "#82ca9d", Cr: "#ffc658", Cu: "#ff7300", Fe: "#d0ed57", Mn: "#a4de6c", Ni: "#8dd1e1", Pb: "#ff8042", Zn: "#00C49F",
};

const getRiskBadgeVariant = (
  risk?: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (risk?.toLowerCase()) {
    case "safe": return "default";
    case "moderate": return "secondary";
    case "high": return "outline";
    case "critical": return "destructive";
    default: return "default";
  }
};

const SiteDetailsPage = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [visibleMetals, setVisibleMetals] = useState<Record<string, boolean>>(
    Object.fromEntries(Object.keys(WHO_STANDARDS).map((m) => [m, false]))
  );

  const {
    data: site,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["siteDetails", siteId],
    queryFn: () => getSiteDetails(siteId!),
    enabled: !!siteId,
  });

  const handleIssueAlert = () => {
    if (!site || !site.history || site.history.length === 0) return;
    const latestSample = site.history[site.history.length - 1];
    const riskLevel = latestSample?.pollution_indices[0]?.risk_level;
    const isHighRisk = riskLevel === 'high' || riskLevel === 'critical';

    navigate('/alerts', {
      state: {
        sampleId: latestSample.id,
        title: `Pollution Alert for ${site.site}`,
        riskLevel: riskLevel,
        isUrgent: isHighRisk,
      },
    });
  };

  const handleMetalVisibilityChange = (metal: string) => {
    setVisibleMetals((prev) => ({ ...prev, [metal]: !prev[metal] }));
  };

  // The primary loading state for the initial fetch
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="text-destructive text-center py-12">
        Error: {error.message}
      </div>
    );

  if (!site) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Site data could not be found.
      </div>
    );
  }

  const latestSample = site.history && site.history.length > 0 ? site.history[site.history.length - 1] : null;
  const chartData = site.history.map((s: any) => ({
    date: new Date(s.sample_date).toLocaleDateString(),
    hmpi: s.pollution_indices[0]?.hmpi,
    ...Object.keys(WHO_STANDARDS).reduce(
      (acc, metal) => ({ ...acc, [metal]: s[metal] }),
      {}
    ),
  }));

  const isResearcher = profile?.role === 'researcher' || profile?.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{site.site}</h1>
        <p className="text-muted-foreground">
          Comprehensive analysis and historical data for this location.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Charts Area */}
        <div className="lg:col-span-2 space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>HMPI Trend</CardTitle>
               <CardDescription>
                 Historical variation of the Heavy Metal Pollution Index (HMPI).
               </CardDescription>
             </CardHeader>
             <CardContent>
               <ResponsiveContainer width="100%" height={300}>
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                   <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip />
                   <Legend />
                   <Line
                     type="monotone"
                     dataKey="hmpi"
                     name="HMPI"
                     stroke="#ef4444"
                     strokeWidth={2}
                     activeDot={{ r: 6 }}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </CardContent>
           </Card>

           <Card>
             <CardHeader>
               <CardTitle>Heavy Metals Concentration</CardTitle>
               <CardDescription>
                 Individual concentrations compared with WHO guideline limits.
               </CardDescription>
             </CardHeader>
             <CardContent>
               <ResponsiveContainer width="100%" height={350}>
                 <LineChart data={chartData}>
                   <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                   <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip />
                   <Legend />
                   {Object.keys(visibleMetals).map(
                     (metal) =>
                       visibleMetals[metal] && (
                         <>
                           <Line
                             key={metal}
                             type="monotone"
                             dataKey={metal}
                             stroke={METAL_COLORS[metal]}
                             dot={false}
                             strokeWidth={1.5}
                           />
                           <ReferenceLine
                             y={WHO_STANDARDS[metal]}
                             stroke={METAL_COLORS[metal]}
                             strokeDasharray="4 4"
                             label={{
                               value: `${metal} WHO Limit`,
                               fontSize: 10,
                               fill: METAL_COLORS[metal],
                               position: "top",
                             }}
                           />
                         </>
                       )
                   )}
                 </LineChart>
               </ResponsiveContainer>
               <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 justify-center p-3 bg-muted/40 rounded-lg">
                 {Object.keys(WHO_STANDARDS).map((metal) => (
                   <div
                     key={metal}
                     className="flex items-center space-x-2 hover:opacity-90 transition"
                   >
                     <Checkbox
                       id={metal}
                       checked={visibleMetals[metal]}
                       onCheckedChange={() => handleMetalVisibilityChange(metal)}
                     />
                     <Label
                       htmlFor={metal}
                       className="text-sm font-medium leading-none cursor-pointer"
                     >
                       {metal}
                     </Label>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Site Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Coordinates:</span>
                <span className="font-mono text-xs">
                  {site.latitude}, {site.longitude}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Samples:</span>
                <span className="font-bold">{site.history.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Current Status:</span>
                <Badge
                  variant={getRiskBadgeVariant(
                    latestSample?.pollution_indices[0]?.risk_level
                  )}
                >
                  {latestSample?.pollution_indices[0]?.risk_level || 'N/A'}
                </Badge>
              </div>
            </CardContent>
            {isResearcher && latestSample && (
              <CardFooter>
                <Button onClick={handleIssueAlert} className="w-full" variant="outline">
                  <BellPlus className="mr-2 h-4 w-4" />
                  Issue Alert for this Site
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Latest Sample */}
          {latestSample && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Latest Sample Analysis
                </CardTitle>
                <CardDescription>
                  Sampled on{" "}
                  {new Date(latestSample.sample_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metal</TableHead>
                      <TableHead>Concentration</TableHead>
                      <TableHead>WHO Limit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(WHO_STANDARDS).map((metal) => (
                      <TableRow
                        key={metal}
                        className={`transition ${
                          latestSample[metal] > WHO_STANDARDS[metal]
                            ? "bg-destructive/10 text-destructive font-semibold"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="font-bold">{metal}</TableCell>
                        <TableCell>{latestSample[metal]}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {WHO_STANDARDS[metal]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsPage;

