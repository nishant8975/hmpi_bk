import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Download, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    site: "Site A-01",
    region: "Mumbai Basin",
    risk: "High",
    govtBody: "Central Pollution Control Board",
    status: "Sent",
    date: "2025-09-14",
    resolved: false,
    immediate: false,
    contaminants: ["As", "Cd", "Pb"],
    reportFile: "/reports/SiteA-01.pdf",
  },
  {
    site: "Site C-12",
    region: "Godavari Basin",
    risk: "Moderate",
    govtBody: "State Pollution Control Board",
    status: "Pending",
    date: "2025-09-13",
    resolved: false,
    immediate: false,
    contaminants: ["Cr"],
    reportFile: "/reports/SiteC-12.pdf",
  },
  {
    site: "Site D-08",
    region: "Narmada Basin",
    risk: "Critical",
    govtBody: "Ministry of Environment, Forest and Climate Change",
    status: "In Process",
    date: "2025-09-12",
    resolved: false,
    immediate: true,
    contaminants: ["As", "Cd", "Cr", "Pb"],
    reportFile: "/reports/SiteD-08.pdf",
  },
  {
    site: "Site E-15",
    region: "Tapti Basin",
    risk: "Safe",
    govtBody: "State Pollution Control Board",
    status: "Predicted Risk",
    date: "2025-09-11",
    resolved: true,
    immediate: false,
    contaminants: [],
    reportFile: "/reports/SiteE-15.pdf",
  },
];

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Critical": return "text-red-600";
    case "High": return "text-orange-500";
    case "Moderate": return "text-yellow-500";
    default: return "text-green-600";
  }
};

const Alerts = () => {
  const sendToGovt = (site: string, body: string) => {
    toast.success(`Report for ${site} has been sent to ${body}.`);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Environmental Risk Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left border-collapse">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="py-3 px-2">Site</th>
                <th className="py-3 px-2">Region</th>
                <th className="py-3 px-2">Risk</th>
                <th className="py-3 px-2">Contaminants</th>
                <th className="py-3 px-2">Govt Body</th>
                <th className="py-3 px-2">Date Sent</th>
                <th className="py-3 px-2">Resolved</th>
                <th className="py-3 px-2">Immediate</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.site} className="border-b last:border-none hover:bg-muted/10">
                  <td className="py-3 px-2 font-medium">{a.site}</td>
                  <td className="px-2">{a.region}</td>
                  <td className={cn("px-2 font-semibold", getRiskColor(a.risk))}>{a.risk}</td>
                  <td className="px-2">
                    {a.contaminants.length ? (
                      <div className="flex flex-wrap gap-1">
                        {a.contaminants.map((c) => (
                          <Badge key={c} variant="secondary">{c}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </td>
                  <td className="px-2">{a.govtBody}</td>
                  <td className="px-2">{a.date}</td>
                  <td className="px-2">{a.resolved ? "Yes" : "No"}</td>
                  <td className="px-2">
                    {a.immediate ? (
                      <Badge variant="destructive">Urgent</Badge>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-2">{a.status}</td>
                  <td className="px-2 flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(a.reportFile, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Report
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => sendToGovt(a.site, a.govtBody)}
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Send
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;
