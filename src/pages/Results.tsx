import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RiskBadge, getRiskLevel } from "@/components/RiskBadge";
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
  Filter
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Results = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const sampleData = [
    { id: 1, location: "Site A-01", lat: 40.7128, lng: -74.0060, hmpi: 85.2, as: 0.005, cd: 0.001, cr: 0.02, pb: 0.008 },
    { id: 2, location: "Site B-03", lat: 40.7580, lng: -73.9855, hmpi: 245.7, as: 0.015, cd: 0.008, cr: 0.045, pb: 0.025 },
    { id: 3, location: "Site C-12", lat: 40.6782, lng: -73.9442, hmpi: 156.3, as: 0.008, cd: 0.003, cr: 0.028, pb: 0.012 },
    { id: 4, location: "Site D-08", lat: 40.7282, lng: -73.7949, hmpi: 378.9, as: 0.025, cd: 0.015, cr: 0.065, pb: 0.045 },
    { id: 5, location: "Site E-15", lat: 40.8176, lng: -73.7788, hmpi: 67.4, as: 0.003, cd: 0.001, cr: 0.012, pb: 0.004 },
  ];

  const chartData = sampleData.map(item => ({
    name: item.location,
    HMPI: item.hmpi,
    As: item.as * 1000, // Convert to µg/L for better visualization
    Cd: item.cd * 1000,
    Cr: item.cr * 1000,
    Pb: item.pb * 1000,
  }));

  const riskDistribution = [
    { name: 'Safe', value: 40, color: 'hsl(var(--risk-safe))' },
    { name: 'Moderate', value: 35, color: 'hsl(var(--risk-moderate))' },
    { name: 'High', value: 20, color: 'hsl(var(--risk-high))' },
    { name: 'Critical', value: 5, color: 'hsl(var(--risk-critical))' },
  ];

  const filteredData = sampleData.filter(item =>
    item.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis Results</h1>
          <p className="text-muted-foreground">HMPI calculations for your water quality dataset</p>
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
              placeholder="Search by location name or coordinates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
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
                    {filteredData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.location}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </TableCell>
                        <TableCell className="font-bold">{item.hmpi.toFixed(1)}</TableCell>
                        <TableCell>
                          <RiskBadge level={getRiskLevel(item.hmpi)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {item.as > 0.01 && <Badge variant="secondary" className="text-xs">As</Badge>}
                            {item.cd > 0.005 && <Badge variant="secondary" className="text-xs">Cd</Badge>}
                            {item.cr > 0.03 && <Badge variant="secondary" className="text-xs">Cr</Badge>}
                            {item.pb > 0.01 && <Badge variant="secondary" className="text-xs">Pb</Badge>}
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
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HMPI Bar Chart */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>HMPI Values by Location</CardTitle>
                <CardDescription>
                  Comparison of Heavy Metal Pollution Index across sampling sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="name" 
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
                      <Bar 
                        dataKey="HMPI" 
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Distribution Pie Chart */}
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
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {riskDistribution.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heavy Metals Comparison */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Heavy Metal Concentrations</CardTitle>
              <CardDescription>
                Individual heavy metal levels (μg/L) across sampling locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
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
                    <Bar dataKey="As" fill="hsl(var(--chart-1))" name="Arsenic" />
                    <Bar dataKey="Cd" fill="hsl(var(--chart-2))" name="Cadmium" />
                    <Bar dataKey="Cr" fill="hsl(var(--chart-3))" name="Chromium" />
                    <Bar dataKey="Pb" fill="hsl(var(--chart-4))" name="Lead" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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