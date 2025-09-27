import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Database, 
  AlertTriangle, 
  Activity,
  Search,
  Shield,
  Settings,
  FileText,
  UserCheck,
  UserX,
  RotateCcw,
  Trash2,
  CheckCircle,
  XCircle
} from "lucide-react";

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const users = [
    { id: 1, name: "Dr. Sarah Johnson", email: "sarah@university.edu", role: "Researcher", status: "active", lastLogin: "2024-01-15" },
    { id: 2, name: "Mark Thompson", email: "mark@epa.gov", role: "Policymaker", status: "active", lastLogin: "2024-01-14" },
    { id: 3, name: "Lisa Chen", email: "lisa@consulting.com", role: "Analyst", status: "inactive", lastLogin: "2024-01-10" },
    { id: 4, name: "David Wilson", email: "david@waterboard.gov", role: "Administrator", status: "active", lastLogin: "2024-01-15" },
  ];

  const datasets = [
    { id: 1, name: "Regional Survey 2024-Q1", uploadedBy: "Dr. Sarah Johnson", date: "2024-01-15", samples: 247, status: "approved" },
    { id: 2, name: "Industrial Area Monitoring", uploadedBy: "Mark Thompson", date: "2024-01-14", samples: 89, status: "pending" },
    { id: 3, name: "Rural Well Assessment", uploadedBy: "Lisa Chen", date: "2024-01-13", samples: 156, status: "approved" },
    { id: 4, name: "Urban Groundwater Study", uploadedBy: "David Wilson", date: "2024-01-12", samples: 324, status: "flagged" },
  ];

  const systemLogs = [
    { id: 1, timestamp: "2024-01-15 14:30", user: "Dr. Sarah Johnson", action: "Dataset uploaded", status: "success" },
    { id: 2, timestamp: "2024-01-15 13:45", user: "System", action: "Automated backup completed", status: "success" },
    { id: 3, timestamp: "2024-01-15 12:20", user: "Mark Thompson", action: "Login attempt", status: "success" },
    { id: 4, timestamp: "2024-01-15 11:15", user: "Unknown", action: "Failed login attempt", status: "error" },
  ];

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System management and monitoring</p>
        </div>
        <Button className="shadow-elegant">
          <Settings className="w-4 h-4 mr-2" />
          System Settings
        </Button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value="1,247"
          subtitle="Active researchers & analysts"
          icon={Users}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Datasets"
          value="89"
          subtitle="Approved & processing"
          icon={Database}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="System Alerts"
          value="3"
          subtitle="Requiring attention"
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="System Health"
          value="99.8%"
          subtitle="Uptime this month"
          icon={Activity}
          variant="safe"
        />
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="datasets">Datasets</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className={user.status === 'active' ? 'bg-risk-safe text-risk-safe-foreground' : ''}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <UserCheck className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <UserX className="w-4 h-4" />
                            </Button>
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

        {/* Dataset Management */}
        <TabsContent value="datasets" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Dataset Management
              </CardTitle>
              <CardDescription>
                Review, approve, and manage uploaded datasets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dataset Name</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Samples</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datasets.map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell className="font-medium">{dataset.name}</TableCell>
                        <TableCell>{dataset.uploadedBy}</TableCell>
                        <TableCell className="text-muted-foreground">{dataset.date}</TableCell>
                        <TableCell>{dataset.samples}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              dataset.status === 'approved' ? 'default' : 
                              dataset.status === 'pending' ? 'secondary' : 'destructive'
                            }
                            className={
                              dataset.status === 'approved' ? 'bg-risk-safe text-risk-safe-foreground' :
                              dataset.status === 'pending' ? 'bg-risk-moderate text-risk-moderate-foreground' :
                              'bg-risk-critical text-risk-critical-foreground'
                            }
                          >
                            {dataset.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

        {/* System Logs */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                System Activity Logs
              </CardTitle>
              <CardDescription>
                Monitor system activities, logins, and errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {systemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.status === 'success' ? 'default' : 'destructive'}
                            className={log.status === 'success' ? 'bg-risk-safe text-risk-safe-foreground' : ''}
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  HMPI Thresholds
                </CardTitle>
                <CardDescription>
                  Configure pollution risk level thresholds
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Safe (≤ 100)</label>
                  <Input type="number" defaultValue="100" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Moderate (101-200)</label>
                  <Input type="number" defaultValue="200" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">High (201-300)</label>
                  <Input type="number" defaultValue="300" />
                </div>
                <Button className="w-full">Update Thresholds</Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  System Maintenance
                </CardTitle>
                <CardDescription>
                  Backup and system management tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full">
                  Create System Backup
                </Button>
                <Button variant="outline" className="w-full">
                  Export User Data
                </Button>
                <Button variant="outline" className="w-full">
                  Clear System Cache
                </Button>
                <Button variant="destructive" className="w-full">
                  Reset Database (Danger)
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;