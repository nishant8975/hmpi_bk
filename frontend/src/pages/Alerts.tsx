import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlert, getAlerts } from "../service/api";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Loader2, Send, FileDown, MoreHorizontal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const getRiskBadgeVariant = (risk?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (risk?.toLowerCase()) {
    case 'high': return 'outline';
    case 'critical': return 'destructive';
    case 'moderate': return 'secondary';
    default: return 'default';
  }
};

const AlertsPage = () => {
    const { profile } = useAuth();
    const { toast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form state, pre-filled from navigation if available
    const [title, setTitle] = useState(location.state?.title || "");
    const [message, setMessage] = useState("");
    const [govtBody, setGovtBody] = useState("State Pollution Control Board");
    const [isUrgent, setIsUrgent] = useState(location.state?.isUrgent || false);
    const [status, setStatus] = useState("Pending");
    const sampleId = location.state?.sampleId;

    // ✨ Use useQuery for efficient data fetching and caching
    const { data: alerts = [], isLoading, error } = useQuery<any[], Error>({
        queryKey: ['alerts'],
        queryFn: getAlerts,
        staleTime: 1000 * 60, // Cache for 1 minute
    });

    // ✨ Use useMutation for robust form submissions
    const alertMutation = useMutation({
        mutationFn: createAlert,
        onSuccess: () => {
            toast({ title: 'Success', description: 'Alert has been sent to policymakers.' });
            queryClient.invalidateQueries({ queryKey: ['alerts'] }); // Refresh the alerts list
            navigate('/analysis-history');
        },
        onError: (err: Error) => {
            toast({ variant: 'destructive', title: 'Failed to Send Alert', description: err.message });
        },
    });

    const handleSubmitAlert = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sampleId) {
            toast({ variant: 'destructive', title: 'Action Required', description: "Create alerts from the 'Analysis History' page." });
            return;
        }
        alertMutation.mutate({ sample_id: sampleId, title, message, govt_body: govtBody, is_urgent: isUrgent, status });
    };

    const isResearcher = profile?.role === 'researcher' || profile?.role === 'admin';

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-foreground">Environmental Risk Alerts</h1>

            {isResearcher && (
                <Card>
                    <CardHeader>
                        <CardTitle>Issue a New Alert</CardTitle>
                        <CardDescription>Fill out the details below to notify the relevant authorities of a key finding.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmitAlert} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                    <Label htmlFor="title">Alert Title</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Critical Lead Levels Detected" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="govtBody">Government Body</Label>
                                    <Select value={govtBody} onValueChange={setGovtBody}>
                                        <SelectTrigger><SelectValue placeholder="Select a body" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="State Pollution Control Board">State Pollution Control Board</SelectItem>
                                            <SelectItem value="Central Pollution Control Board">Central Pollution Control Board</SelectItem>
                                            <SelectItem value="Ministry of Environment">Ministry of Environment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message to Policymakers (Optional)</Label>
                                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Provide a summary of the findings and any recommended actions..." />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="isUrgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                                <Label htmlFor="isUrgent">Mark as Urgent</Label>
                            </div>
                            <div>
                                <Button type="submit" disabled={alertMutation.isPending || !sampleId} className="w-full md:w-auto">
                                    {alertMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                    Send Alert to Policymakers
                                </Button>
                                {!sampleId && <p className="text-xs text-center md:text-left mt-2 text-destructive">To create an alert, please start from your 'Analysis History' page.</p>}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Active Alerts Feed</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div> :
                     error ? <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert> :
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Site</TableHead>
                                <TableHead>Risk</TableHead>
                                <TableHead>Contaminants</TableHead>
                                <TableHead>Govt Body</TableHead>
                                <TableHead>Date Sent</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {alerts.length > 0 ? alerts.map(alert => (
                                <TableRow key={alert.id}>
                                    <TableCell className="font-medium">{alert.water_samples?.locations?.site || 'N/A'}</TableCell>
                                    <TableCell><Badge variant={getRiskBadgeVariant(alert.water_samples?.pollution_indices[0]?.risk_level)}>{alert.water_samples?.pollution_indices[0]?.risk_level || 'N/A'}</Badge></TableCell>
                                    <TableCell className="text-xs max-w-[200px] truncate">{alert.water_samples?.pollution_indices[0]?.key_contaminants?.join(', ') || 'None'}</TableCell>
                                    <TableCell>{alert.govt_body}</TableCell>
                                    <TableCell>{new Date(alert.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        {alert.is_urgent && <Badge variant="destructive" className="mr-2">Urgent</Badge>}
                                        <Badge variant="outline">{alert.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem><FileDown className="w-4 h-4 mr-2" /> Download Report</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No active alerts.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>}
                </CardContent>
            </Card>
        </div>
    );
};

export default AlertsPage;

