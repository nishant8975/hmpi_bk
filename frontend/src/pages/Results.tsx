import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  MapPin,
  BarChart3,
  TableIcon,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Results = () => {
  const location = useLocation();
  const rawResults = location.state?.results || [];

  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 normalize backend results → frontend shape
  const normalizedResults = useMemo(() => {
    return (rawResults || []).map((item: any) => ({
      Location: item.Location || item.location || "Unknown",
      Latitude: item.Latitude ?? item.latitude ?? null,
      Longitude: item.Longitude ?? item.longitude ?? null,
      HMPI: item.HMPI ?? item.hmpi ?? 0,
      RiskLevel: item.RiskLevel || item.riskLevel || "Safe",
      KeyContaminants: item.KeyContaminants || item.keyContaminants || [],
    }));
  }, [rawResults]);




  // 🔹 filter normalized results
  const filteredData = useMemo(
    () =>
      normalizedResults.filter((item: any) =>
        item.Location?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [normalizedResults, searchTerm]
  );

  // 🔹 normalize risk levels
  const normalizeRisk = (risk: string): "safe" | "moderate" | "high" | "critical" => {
    if (!risk) return "safe";
    const r = risk.toLowerCase();
    if (r.includes("very") || r.includes("critical")) return "critical";
    if (r.includes("high")) return "high";
    if (r.includes("moderate")) return "moderate";
    return "safe";
  };

  // 🔹 chart data
  const chartData = filteredData.map((item: any) => ({
    name: item.Location,
    HMPI: item.HMPI,
    ...item,
  }));

  // 🔹 pie chart risk distribution
  const riskDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach((item: any) => {
      const normalized = normalizeRisk(item.RiskLevel);
      counts[normalized] = (counts[normalized] || 0) + 1;
    });
    const total = filteredData.length || 1;
    const colors: Record<string, string> = {
      safe: "#4CAF50",
      moderate: "#FFC107",
      high: "#FF5722",
      critical: "#D32F2F",
    };
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value: Math.round((value / total) * 100),
      color: colors[name] || "#999",
    }));
  }, [filteredData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis Results</h1>
          <p className="text-muted-foreground">
            HMPI calculations for your water quality dataset
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button className="shadow-elegant">
            <Download className="w-4 h-4 mr-2" />
            Export Results
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by location name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table" className="flex items-center gap-2">
            <TableIcon className="w-4 h-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="charts" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Map View
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>HMPI Analysis Results</CardTitle>
              <CardDescription>
                Heavy Metal Pollution Index values and risk assessments for each sampling location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead>HMPI Value</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Key Contaminants</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.Location}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.Latitude?.toFixed(4)}, {item.Longitude?.toFixed(4)}
                        </TableCell>
                        <TableCell className="font-bold">{item.HMPI?.toFixed(1)}</TableCell>
                        <TableCell>
                          <RiskBadge level={normalizeRisk(item.RiskLevel)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {item.KeyContaminants?.map((metal: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {metal}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Charts View */}
        {/* Charts View */}
<TabsContent value="charts" className="space-y-6">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Bar Chart */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>HMPI Values by Location</CardTitle>
        <CardDescription>
          Comparison of Heavy Metal Pollution Index across sampling sites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-x-auto">
          <ResponsiveContainer width={Math.max(chartData.length * 60, 600)} height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
              <Bar dataKey="HMPI" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* Pie Chart */}
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle>Risk Level Distribution</CardTitle>
        <CardDescription>
          Percentage breakdown of sites by pollution risk category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {riskDistribution.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">
                {item.name} ({item.value}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
</TabsContent>


        {/* Map View */}
        <TabsContent value="map">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Interactive Map View</CardTitle>
              <CardDescription>
                Geographical visualization of HMPI values with color-coded risk markers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center space-y-2">
                  <MapPin className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-lg font-medium text-foreground">Interactive Map</p>
                  <p className="text-sm text-muted-foreground">
                    Map integration would display color-coded markers for each sampling location
                  </p>
                  <Button variant="outline" className="mt-4">
                    Load Map View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Results;
