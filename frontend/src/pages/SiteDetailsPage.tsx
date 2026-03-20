import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAlert,
  downloadSiteReport,
  getLatestResearcherSiteReport,
  getSiteDetails,
} from "../service/api";
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
import { useToast } from "@/components/ui/use-toast";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "../hooks/useAuth"; 
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const WHO_STANDARDS: Record<string, number> = {
  As: 0.01, Cd: 0.003, Cr: 0.05, Cu: 2.0, Fe: 0.3, Mn: 0.4, Ni: 0.07, Pb: 0.01, Zn: 5.0,
};

const METAL_COLORS: Record<string, string> = {
  As: "#8884d8", Cd: "#82ca9d", Cr: "#ffc658", Cu: "#ff7300", Fe: "#d0ed57", Mn: "#a4de6c", Ni: "#8dd1e1", Pb: "#ff8042", Zn: "#00C49F",
};

const HandwrittenPad = ({
  disabled,
  onSave,
}: {
  disabled?: boolean;
  onSave: (dataUrl: string | null) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  // Keep a stable canvas size.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    const w = parent?.clientWidth ?? 520;
    const h = 170;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = Math.floor(w * 2); // for crisp lines
    canvas.height = Math.floor(h * 2);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.scale(2, 2);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827"; // text-ish dark
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    lastPointRef.current = null;
  }, []);

  const getPos = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.getBoundingClientRect().width;
    const h = canvas.getBoundingClientRect().height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    onSave(null);
    lastPointRef.current = null;
    setStroke(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  const onPointerDown = (e: any) => {
    if (disabled) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    lastPointRef.current = getPos(e);
  };

  const onPointerMove = (e: any) => {
    if (disabled) return;
    const last = lastPointRef.current;
    if (!last) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const current = getPos(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();
    lastPointRef.current = current;
  };

  const onPointerUp = () => {
    if (disabled) return;
    lastPointRef.current = null;
  };

  return (
    <div className="space-y-2">
      <div className="rounded-md border bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ touchAction: "none", display: "block", margin: "0 auto" }}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="w-full" onClick={clear} disabled={disabled}>
          Clear
        </Button>
        <Button type="button" className="w-full" onClick={save} disabled={disabled}>
          Save
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Draw using mouse/finger, then press Save.</p>
    </div>
  );
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

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isResearcher = profile?.role === "researcher" || profile?.role === "admin";
  const isPolicymaker = profile?.role === "policymaker" || profile?.role === "admin";

  // Policymaker decision form state
  const [decisionAction, setDecisionAction] = useState<string>("Isolate site");
  const [decisionMessage, setDecisionMessage] = useState<string>("");
  const [decisionGovtBody, setDecisionGovtBody] = useState<string>("State Pollution Control Board");
  const [decisionStatus, setDecisionStatus] = useState<string>("Action Taken");
  const [decisionUrgent, setDecisionUrgent] = useState<boolean>(false);
  const [handwrittenNoteDataUrl, setHandwrittenNoteDataUrl] = useState<string | null>(null);

  const decisionMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      toast({ title: "Decision published", description: "Public map will show this action for the site." });
      queryClient.invalidateQueries({ queryKey: ["mapData"] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Failed to publish decision", description: err?.message || "Unknown error" });
    },
  });

  // Researcher full report (to policymaker)
  const [fullReportText, setFullReportText] = useState<string>("");
  const fullReportMutation = useMutation({
    mutationFn: createAlert,
    onSuccess: async () => {
      toast({ title: "Report sent", description: "Policymakers can download this full report." });
      // Refetch latest report for policymaker view.
      queryClient.invalidateQueries({ queryKey: ["latestResearcherSiteReport", siteId] });
    },
    onError: (err: any) => {
      toast({ variant: "destructive", title: "Failed to send report", description: err?.message || "Unknown error" });
    },
  });

  const {
    data: latestResearcherReportResponse,
    isLoading: isLatestResearcherReportLoading,
  } = useQuery({
    queryKey: ["latestResearcherSiteReport", siteId],
    queryFn: () => getLatestResearcherSiteReport(siteId!),
    enabled: isPolicymaker && !!siteId,
    staleTime: 0,
  });

  const latestResearcherReport = latestResearcherReportResponse?.report ?? null;

  const {
    data: site,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["siteDetails", siteId],
    queryFn: () => getSiteDetails(siteId!),
    enabled: !!siteId,
  });

  // PDF capture ref must be created before any conditional returns.
  const reportCaptureRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadFullReportPdf = async () => {
    try {
      if (!reportCaptureRef.current) return;

      // Increase scale for better readability in the PDF.
      const canvas = await html2canvas(reportCaptureRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidthMm = pdf.internal.pageSize.getWidth();
      const pageHeightMm = pdf.internal.pageSize.getHeight();

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const pxPerMm = imgWidthPx / pageWidthMm;
      const pageHeightPx = pageHeightMm * pxPerMm;

      let renderedHeightPx = 0;
      let pageIndex = 0;

      while (renderedHeightPx < imgHeightPx) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = imgWidthPx;
        pageCanvas.height = Math.min(
          pageHeightPx,
          imgHeightPx - renderedHeightPx
        );

        const ctx = pageCanvas.getContext("2d");
        if (!ctx) break;
        ctx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          imgWidthPx,
          pageCanvas.height,
          0,
          0,
          imgWidthPx,
          pageCanvas.height
        );

        const pageImgData = pageCanvas.toDataURL("image/png");
        const pageHeightMmComputed = pageCanvas.height / pxPerMm;

        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(
          pageImgData,
          "PNG",
          0,
          0,
          pageWidthMm,
          pageHeightMmComputed
        );

        renderedHeightPx += pageCanvas.height;
        pageIndex += 1;
      }

      const fileSafeSite = String(site?.site ?? "site").replace(
        /[^a-z0-9]+/gi,
        "_"
      );
      const fileName = `full_report_${fileSafeSite}.pdf`;
      pdf.save(fileName);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "PDF download failed",
        description: err?.message || "Unknown error",
      });
    }
  };

  // Keep hook order stable: compute latestSample even while `site` is loading.
  const latestSample = site?.history && site.history.length > 0 ? site.history[site.history.length - 1] : null;

  useEffect(() => {
    if (!latestSample) return;

    const riskLevel = latestSample?.pollution_indices?.[0]?.risk_level;
    const risk = String(riskLevel ?? "").toLowerCase();

    if (risk === "critical") {
      setDecisionAction("Isolate site");
      setDecisionStatus("Action Taken");
      setDecisionUrgent(true);
      setDecisionMessage((prev) =>
        prev.trim()
          ? prev
          : "Due to critical HMPI findings, the site should be isolated and immediate corrective actions initiated."
      );
    } else if (risk === "high") {
      setDecisionAction("Increase monitoring");
      setDecisionStatus("Recommended");
      setDecisionUrgent(true);
      setDecisionMessage((prev) =>
        prev.trim()
          ? prev
          : "High HMPI detected. Increase monitoring frequency and begin targeted investigation to identify pollution sources."
      );
    } else if (risk === "moderate") {
      setDecisionAction("Targeted remediation plan");
      setDecisionStatus("Recommended");
      setDecisionUrgent(false);
      setDecisionMessage((prev) =>
        prev.trim()
          ? prev
          : "Moderate HMPI detected. Implement a remediation plan and monitor progress over the next sampling cycle."
      );
    } else {
      setDecisionAction("Routine monitoring");
      setDecisionStatus("In Progress");
      setDecisionUrgent(false);
      setDecisionMessage((prev) =>
        prev.trim()
          ? prev
          : "HMPI is within safe limits. Continue routine monitoring and preventative measures."
      );
    }
  }, [latestSample?.id]);

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

  const chartData = site.history.map((s: any) => ({
    date: new Date(s.sample_date).toLocaleDateString(),
    hmpi: s.pollution_indices[0]?.hmpi,
    ...Object.keys(WHO_STANDARDS).reduce(
      (acc, metal) => ({ ...acc, [metal]: s[metal] }),
      {}
    ),
  }));

  return (
    <div className="space-y-8" ref={reportCaptureRef}>
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

          {isResearcher && latestSample && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Send Full Research Report
                </CardTitle>
                <CardDescription>
                  Add conclusions using HMPI + metal concentrations. Policymakers can download it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Report to policymakers</Label>
                  <Textarea
                    value={fullReportText}
                    onChange={(e) => setFullReportText(e.target.value)}
                    placeholder="Write the full report for this site. Include key findings and recommendations..."
                    className="min-h-[140px]"
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    if (!latestSample) return;
                    if (!fullReportText.trim()) {
                      toast({ variant: "destructive", title: "Missing report text", description: "Please write the report before sending." });
                      return;
                    }

                    fullReportMutation.mutate({
                      sample_id: latestSample.id,
                      title: `Researcher Full Report: ${site.site}`,
                      message: fullReportText,
                      govt_body: decisionGovtBody,
                      is_urgent: decisionUrgent,
                      status: "Report Submitted",
                    });
                  }}
                  disabled={fullReportMutation.isPending}
                >
                  {fullReportMutation.isPending ? "Sending..." : "Send to Policymaker"}
                </Button>
              </CardContent>
            </Card>
          )}

          {isPolicymaker && latestSample && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Policymaker Decision</CardTitle>
                <CardDescription>
                  Publish an action/recommendation so the public can see it on the map.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Latest risk:{" "}
                  <Badge variant={getRiskBadgeVariant(latestSample?.pollution_indices?.[0]?.risk_level)}>
                    {latestSample?.pollution_indices?.[0]?.risk_level || "N/A"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label>Action</Label>
                  <Select value={decisionAction} onValueChange={setDecisionAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Isolate site">Isolate site</SelectItem>
                      <SelectItem value="Increase monitoring">Increase monitoring</SelectItem>
                      <SelectItem value="Targeted remediation plan">Targeted remediation plan</SelectItem>
                      <SelectItem value="Routine monitoring">Routine monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message to public (optional)</Label>
                  <Textarea
                    value={decisionMessage}
                    onChange={(e) => setDecisionMessage(e.target.value)}
                    placeholder="Example: Isolate the site and start corrective actions within 7 days."
                    className="min-h-[110px]"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label>Government body</Label>
                    <Select value={decisionGovtBody} onValueChange={setDecisionGovtBody}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="State Pollution Control Board">State Pollution Control Board</SelectItem>
                        <SelectItem value="Central Pollution Control Board">Central Pollution Control Board</SelectItem>
                        <SelectItem value="Ministry of Environment">Ministry of Environment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={decisionStatus} onValueChange={setDecisionStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Action Taken">Action Taken</SelectItem>
                        <SelectItem value="Recommended">Recommended</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Switch
                    id="decisionUrgent"
                    checked={decisionUrgent}
                    onCheckedChange={setDecisionUrgent}
                  />
                  <Label htmlFor="decisionUrgent">Mark as urgent</Label>
                </div>

                <div className="space-y-2 pt-3">
                  <Label>Handwritten report (policymaker, for PDF)</Label>
                  <HandwrittenPad
                    disabled={decisionMutation.isPending}
                    onSave={(dataUrl) => setHandwrittenNoteDataUrl(dataUrl)}
                  />
                  {handwrittenNoteDataUrl ? (
                    <img
                      src={handwrittenNoteDataUrl}
                      alt="Handwritten note preview"
                      className="w-full rounded-md border bg-white"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Optional: draw and press Save.
                    </p>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    if (!latestSample) return;
                    decisionMutation.mutate({
                      sample_id: latestSample.id,
                    title: `Policymaker Decision: ${decisionAction} - ${site.site}`,
                      message: decisionMessage,
                      govt_body: decisionGovtBody,
                      is_urgent: decisionUrgent,
                      status: decisionStatus,
                    });
                  }}
                  disabled={decisionMutation.isPending}
                >
                  {decisionMutation.isPending ? "Publishing..." : "Publish to public map"}
                </Button>
              </CardContent>
            </Card>
          )}

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
              {isPolicymaker && (
                <CardFooter className="flex gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => downloadSiteReport(siteId!, "excel")}
                    disabled={decisionMutation.isPending}
                  >
                    Download Site Data (Excel)
                  </Button>
                </CardFooter>
              )}
            </Card>
          )}

          {isPolicymaker && latestSample && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Researcher Full Report</CardTitle>
                <CardDescription>
                  Latest submitted report text for policymakers (PDF includes charts + table + this note).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLatestResearcherReportLoading ? (
                  <p className="text-sm text-muted-foreground">Loading report...</p>
                ) : latestResearcherReport ? (
                  <>
                    <div className="text-sm text-muted-foreground">
                      Submitted:{" "}
                      {latestResearcherReport.created_at
                        ? new Date(latestResearcherReport.created_at).toLocaleString()
                        : "N/A"}{" "}
                      • Status: {latestResearcherReport.status || "N/A"}
                    </div>

                    <div className="rounded-md border p-3 bg-muted/30">
                      <p className="text-sm font-medium mb-2">Report text</p>
                      <p className="text-sm whitespace-pre-wrap leading-5">
                        {latestResearcherReport.message || "No report text provided."}
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      onClick={handleDownloadFullReportPdf}
                      disabled={decisionMutation.isPending}
                    >
                      Download Full Report (PDF)
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No researcher full report submitted yet for this site.
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteDetailsPage;

