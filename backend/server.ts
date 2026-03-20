import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import csv from "csv-parser";
import stream from "stream";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import {
  validateHeaders,
  calculateHMPI,
  convertResultsToCSV,
  convertResultsToExcelBuffer,
} from "./src/helpers/hmpiCalculator";
import {
  convertSiteHistoryToCSV,
  convertSiteHistoryToExcelBuffer,
} from "./src/helpers/siteReport";

// --- 1. Load Environment Variables ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- 2. Supabase Admin Client Initialization ---
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Multer setup for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// --- 3. Authentication & Authorization Middleware ---
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role: string;
  };
}

const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required." });

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: "Invalid or expired token." });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) return res.status(403).json({ error: "User profile not found." });

    req.user = { ...user, role: profile.role };
    next();
  } catch (err) {
    res.status(500).json({ error: "An error occurred during authentication." });
  }
};

const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => { // Corrected typo here
    if (!req.user || !req.user.role || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: You do not have the required permissions." });
    }
    next();
  };
};

// ---------------- Upload Route (Updated to save data) ----------------
app.post(
  "/upload",
  authMiddleware,
  authorize(['researcher', 'admin']),
  upload.single("file"),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
      
      const user = req.user!;
      const csvBuffer = req.file.buffer;
      const rows: Record<string, any>[] = [];
      
      await new Promise<void>((resolve, reject) => {
          stream.Readable.from(csvBuffer).pipe(csv())
          .on("headers", (headers: string[]) => {
              const validation = validateHeaders(headers.map(h => h.trim()));
              if (validation !== true) reject({ status: 400, message: validation });
          })
          .on("data", (data) => rows.push(data))
          .on("error", (err) => reject({ status: 500, message: "Error parsing CSV." }))
          .on("end", () => rows.length > 0 ? resolve() : reject({ status: 400, message: "CSV is empty." }));
      });

      const results = [];
      for (const row of rows) {
        const hmpiResult = calculateHMPI(row);
        
        const { data: location, error: locationError } = await supabaseAdmin
          .from('locations')
          .upsert({ site: row.Site, latitude: parseFloat(row.Latitude), longitude: parseFloat(row.Longitude) }, 
                  { onConflict: 'latitude, longitude' })
          .select('id').single();

        if (locationError) throw locationError;

        const { data: sample, error: sampleError } = await supabaseAdmin
          .from('water_samples')
          .insert({
            location_id: location.id,
            researcher_id: user.id,
            sample_date: row['Sample Date'] || new Date().toISOString().split('T')[0],
            "As": parseFloat(row.As) || null, "Cd": parseFloat(row.Cd) || null, "Cr": parseFloat(row.Cr) || null,
            "Cu": parseFloat(row.Cu) || null, "Fe": parseFloat(row.Fe) || null, "Mn": parseFloat(row.Mn) || null,
            "Ni": parseFloat(row.Ni) || null, "Pb": parseFloat(row.Pb) || null, "Zn": parseFloat(row.Zn) || null,
          }).select('id').single();
        
        if (sampleError) throw sampleError;

        const { error: indexError } = await supabaseAdmin
          .from('pollution_indices')
          .insert({
            sample_id: sample.id,
            hmpi: hmpiResult.HMPI,
            risk_level: hmpiResult.RiskLevel,
            key_contaminants: hmpiResult.KeyContaminants,
          });

        if (indexError) throw indexError;
        
        results.push(hmpiResult);
      }
      
      if (req.query.csv === "true") {
          const csvResults = convertResultsToCSV(results);
          res.header("Content-Type", "text/csv").attachment("hmpi_results.csv").send(csvResults);
      } else if (req.query.excel === "true") {
          const excelBuffer = convertResultsToExcelBuffer(results);
          res.header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").attachment("hmpi_results.xlsx").send(excelBuffer);
      } else {
          res.json(results);
      }

    } catch (err: any) {
      console.error("🔥 Server error:", err);
      res.status(err.status || 500).json({ error: err.message || "Internal server error." });
    }
});

// --- Route to get Analysis History ---
app.get(
  "/api/analysis-history",
  authMiddleware, // Ensure user is logged in
  authorize(['researcher', 'admin']), // Only researchers and admins can see their history
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;

      const { data, error } = await supabaseAdmin
        .from('water_samples')
        .select(`
          id,
          sample_date,
          location_id,
          locations ( site ),
          pollution_indices ( hmpi, risk_level )
        `)
        .eq('researcher_id', user.id)
        .order('sample_date', { ascending: false });

      if (error) throw error;

      res.json(data);
    } catch (err: any) {
      console.error("🔥 Error fetching analysis history:", err);
      res.status(500).json({ error: "Failed to fetch analysis history." });
    }
  }
);

// --- Route to CREATE a new, detailed alert ---
app.post(
  "/api/alerts",
  authMiddleware,
  authorize(['researcher', 'policymaker', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const { sample_id, title, message, govt_body, is_urgent, status } = req.body;

      if (!sample_id || !title || !govt_body) {
        return res.status(400).json({ error: "Missing required fields for alert (sample_id, title, govt_body)." });
      }

      // Resolve the original researcher_id from the referenced sample.
      // This keeps referential integrity even when a policymaker creates an action/decision.
      const { data: sampleRow, error: sampleError } = await supabaseAdmin
        .from('water_samples')
        .select('id, researcher_id')
        .eq('id', sample_id)
        .single();

      if (sampleError) throw sampleError;
      if (!sampleRow) return res.status(404).json({ error: "Sample not found." });

      // Security: researchers should only be able to create alerts for their own samples.
      if (req.user?.role === "researcher" && String(sampleRow.researcher_id) !== String(user.id)) {
        return res.status(403).json({ error: "Forbidden: You can only create alerts for your own samples." });
      }

      const { data, error } = await supabaseAdmin
        .from('alerts')
        .insert({
          sample_id,
          researcher_id: sampleRow.researcher_id,
          title,
          message,
          govt_body,
          is_urgent,
          status: status || 'Pending', // Default to 'Pending' if not provided
        })
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      console.error("🔥 Error creating alert:", err);
      res.status(500).json({ error: "Failed to create alert." });
    }
  }
);

// --- Route to GET all alerts with detailed info for the UI ---
app.get(
  "/api/alerts",
  authMiddleware,
  authorize(['researcher', 'policymaker', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('alerts')
        .select(`
          id,
          title,
          message,
          govt_body,
          is_urgent,
          status,
          created_at,
          water_samples (
            sample_date,
            locations ( site ),
            pollution_indices ( risk_level, key_contaminants )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      console.error("🔥 Error fetching alerts:", err);
      res.status(500).json({ error: "Failed to fetch alerts." });
    }
  }
);

// --- Route to get all necessary data for the Researcher Dashboard ---
app.get(
  "/api/dashboard/researcher",
  authMiddleware,
  authorize(['researcher', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;

      // 1. Get recent analyses (last 5)
      const { data: recentAnalyses, error: analysesError } = await supabaseAdmin
        .from('water_samples')
        .select(`
          id, sample_date, locations ( site ),
          pollution_indices ( hmpi, risk_level )
        `)
        .eq('researcher_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (analysesError) throw analysesError;

      // 2. Get statistics
      const { count: totalAnalyses, error: totalError } = await supabaseAdmin
        .from('water_samples')
        .select('*', { count: 'exact', head: true })
        .eq('researcher_id', user.id);
      
      if (totalError) throw totalError;

      const { count: highRiskSamples, error: riskError } = await supabaseAdmin
        .from('pollution_indices')
        .select('*, water_samples!inner(researcher_id)', { count: 'exact', head: true })
        .in('risk_level', ['high', 'critical'])
        .eq('water_samples.researcher_id', user.id);

      if (riskError) throw riskError;

      const { count: alertsIssued, error: alertsError } = await supabaseAdmin
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('researcher_id', user.id);

      if (alertsError) throw alertsError;

      res.json({
        stats: {
          totalAnalyses: totalAnalyses ?? 0,
          highRiskSamples: highRiskSamples ?? 0,
          alertsIssued: alertsIssued ?? 0,
        },
        recentAnalyses: recentAnalyses,
      });

    } catch (err: any) {
      console.error("🔥 Error fetching researcher dashboard data:", err);
      res.status(500).json({ error: "Failed to fetch dashboard data." });
    }
  }
);

app.get(
  "/api/sites/:siteId",
  authMiddleware, 
  authorize(['researcher', 'policymaker', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { siteId } = req.params;

      // 1. Fetch the basic site information
      const { data: siteData, error: siteError } = await supabaseAdmin
        .from('locations')
        .select('id, site, latitude, longitude')
        .eq('id', siteId)
        .single();

      if (siteError) throw siteError;
      if (!siteData) return res.status(404).json({ error: "Site not found." });

      // 2. Fetch all historical samples for this site, now including all metal concentrations
      const { data: historicalData, error: historyError } = await supabaseAdmin
        .from('water_samples')
        .select(`
          id,
          sample_date,
          "As", "Cd", "Cr", "Cu", "Fe", "Mn", "Ni", "Pb", "Zn",
          pollution_indices ( hmpi, risk_level, key_contaminants )
        `)
        .eq('location_id', siteId)
        .order('sample_date', { ascending: true });

      if (historyError) throw historyError;

      res.json({
        ...siteData,
        history: historicalData,
      });

    } catch (err: any) {
      console.error(`🔥 Error fetching site details for ID ${req.params.siteId}:`, err);
      res.status(500).json({ error: "Failed to fetch site details." });
    }
  }
);

// --- Latest Researcher Full Report for a Site (policymaker can download) ---
app.get(
  "/api/sites/:siteId/reports/latest-researcher",
  authMiddleware,
  authorize(["policymaker", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { siteId } = req.params;

      const { data: latestReport, error: reportError } = await supabaseAdmin
        .from("alerts")
        .select(
          "id, title, message, govt_body, is_urgent, status, created_at, water_samples(location_id)"
        )
        .ilike("title", "Researcher Full Report%")
        .eq("water_samples.location_id", siteId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (reportError) throw reportError;

      return res.json({ report: latestReport ?? null });
    } catch (err: any) {
      console.error("🔥 Error fetching latest researcher report:", err);
      return res.status(500).json({ error: "Failed to fetch latest report." });
    }
  }
);


// --- Policymaker Reports (Dynamic, no mock) ---
app.get(
  "/api/reports/policymaker/summary",
  authMiddleware,
  authorize(["policymaker", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 1) Get sites + latest HMPI per site
      const { data: locations, error: locationsError } = await supabaseAdmin
        .from("locations")
        .select("id, site");

      if (locationsError) throw locationsError;
      const locs = locations ?? [];

      const { data: samples, error: samplesError } = await supabaseAdmin
        .from("water_samples")
        .select("location_id, sample_date, pollution_indices (hmpi, risk_level)")
        .order("sample_date", { ascending: false });

      if (samplesError) throw samplesError;

      const latestByLocation = new Map<
        string,
        { hmpi: number; risk_level: string }
      >();

      for (const s of samples ?? []) {
        const locId = String((s as any).location_id ?? "");
        if (!locId || latestByLocation.has(locId)) continue;
        const pollution = (s as any).pollution_indices;
        const idx = Array.isArray(pollution) ? pollution[0] : pollution;
        if (!idx) continue;
        const hmpiRaw = idx.hmpi;
        const riskRaw = idx.risk_level;
        if (hmpiRaw == null || riskRaw == null) continue;
        latestByLocation.set(locId, {
          hmpi: Number(hmpiRaw),
          risk_level: String(riskRaw),
        });
      }

      const latestValues = Array.from(latestByLocation.values());
      const totalSites = locs.length;

      const counts = {
        safe: 0,
        moderate: 0,
        high: 0,
        critical: 0,
      };

      for (const v of latestValues) {
        const risk = v.risk_level?.toLowerCase();
        if (risk === "safe") counts.safe++;
        else if (risk === "moderate") counts.moderate++;
        else if (risk === "high") counts.high++;
        else if (risk === "critical") counts.critical++;
      }

      const avgHMPI =
        latestValues.length === 0
          ? 0
          : latestValues.reduce((sum, v) => sum + v.hmpi, 0) /
            latestValues.length;

      res.json({
        stats: {
          totalSites,
          averageHMPI: Number(avgHMPI.toFixed(2)),
          safeSites: counts.safe,
          moderateSites: counts.moderate,
          highRiskSites: counts.high,
          criticalSites: counts.critical,
        },
      });
    } catch (err: any) {
      console.error("🔥 Error generating policymaker summary:", err);
      res.status(500).json({ error: "Failed to generate summary." });
    }
  }
);

app.get(
  "/api/reports/policymaker/trend",
  authMiddleware,
  authorize(["policymaker", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data: samples, error: samplesError } = await supabaseAdmin
        .from("water_samples")
        .select("sample_date, pollution_indices (hmpi, risk_level)")
        .order("sample_date", { ascending: true });

      if (samplesError) throw samplesError;

      type MonthAgg = {
        sumHMPI: number;
        countHMPI: number;
        safeSites: number;
        moderateSites: number;
        highSites: number;
        criticalSites: number;
      };

      const byMonth = new Map<string, MonthAgg>();

      const getMonthKey = (d: string) => {
        const dt = new Date(d);
        if (Number.isNaN(dt.getTime())) return null;
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      };

      for (const s of samples ?? []) {
        const monthKey = getMonthKey((s as any).sample_date);
        if (!monthKey) continue;
        const idx = Array.isArray((s as any).pollution_indices)
          ? (s as any).pollution_indices[0]
          : (s as any).pollution_indices;
        if (!idx) continue;

        const hmpiRaw = idx.hmpi;
        const riskRaw = idx.risk_level;
        if (hmpiRaw == null || riskRaw == null) continue;

        if (!byMonth.has(monthKey)) {
          byMonth.set(monthKey, {
            sumHMPI: 0,
            countHMPI: 0,
            safeSites: 0,
            moderateSites: 0,
            highSites: 0,
            criticalSites: 0,
          });
        }

        const agg = byMonth.get(monthKey)!;
        const hmpi = Number(hmpiRaw);
        agg.sumHMPI += hmpi;
        agg.countHMPI += 1;

        const risk = String(riskRaw).toLowerCase();
        if (risk === "safe") agg.safeSites += 1;
        else if (risk === "moderate") agg.moderateSites += 1;
        else if (risk === "high") agg.highSites += 1;
        else if (risk === "critical") agg.criticalSites += 1;
      }

      const monthLabel = (key: string) => {
        const [y, m] = key.split("-").map((x) => Number(x));
        const dt = new Date(y, m - 1, 1);
        return dt.toLocaleString("en-US", { month: "short" });
      };

      const trendData = Array.from(byMonth.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, agg]) => ({
          month: monthLabel(key),
          avgHMPI:
            agg.countHMPI === 0
              ? 0
              : Number((agg.sumHMPI / agg.countHMPI).toFixed(2)),
          safeSites: agg.safeSites,
          criticalSites: agg.criticalSites,
        }));

      res.json({ trendData });
    } catch (err: any) {
      console.error("🔥 Error generating policymaker trend:", err);
      res.status(500).json({ error: "Failed to generate trend." });
    }
  }
);

app.get(
  "/api/reports/policymaker/regions",
  authMiddleware,
  authorize(["policymaker", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { data: locations, error: locationsError } = await supabaseAdmin
        .from("locations")
        .select("id, site");
      if (locationsError) throw locationsError;

      const locs = locations ?? [];

      const { data: samples, error: samplesError } = await supabaseAdmin
        .from("water_samples")
        .select("location_id, pollution_indices (hmpi, risk_level)")
        .order("sample_date", { ascending: false });
      if (samplesError) throw samplesError;

      const latestByLocation = new Map<
        string,
        { hmpi: number; risk_level: string }
      >();

      for (const s of samples ?? []) {
        const locId = String((s as any).location_id ?? "");
        if (!locId || latestByLocation.has(locId)) continue;
        const pollution = (s as any).pollution_indices;
        const idx = Array.isArray(pollution) ? pollution[0] : pollution;
        if (!idx) continue;
        const hmpiRaw = idx.hmpi;
        if (hmpiRaw == null) continue;
        const riskRaw = idx.risk_level;
        latestByLocation.set(locId, {
          hmpi: Number(hmpiRaw),
          risk_level: String(riskRaw ?? "safe"),
        });
      }

      type RegionAgg = { sumHMPI: number; sites: number };
      const byRegion = new Map<string, RegionAgg>();

      for (const loc of locs) {
        const latest = latestByLocation.get(String((loc as any).id));
        if (!latest) continue;

        const rawSite = String((loc as any).site ?? "");
        const region = rawSite.includes(" - ")
          ? rawSite.split(" - ")[0]
          : rawSite || "Unknown";

        if (!byRegion.has(region)) {
          byRegion.set(region, { sumHMPI: 0, sites: 0 });
        }

        const agg = byRegion.get(region)!;
        agg.sumHMPI += latest.hmpi;
        agg.sites += 1;
      }

      const statusFromAvg = (avg: number) => {
        if (avg <= 100) return "Excellent";
        if (avg <= 200) return "Good";
        if (avg <= 300) return "Moderate";
        return "Poor";
      };

      const regionalData = Array.from(byRegion.entries())
        .map(([region, agg]) => {
          const avgHMPI = agg.sites === 0 ? 0 : agg.sumHMPI / agg.sites;
          return {
            region,
            sites: agg.sites,
            avgHMPI: Number(avgHMPI.toFixed(2)),
            status: statusFromAvg(avgHMPI),
          };
        })
        .sort((a, b) => b.avgHMPI - a.avgHMPI);

      res.json({ regionalData });
    } catch (err: any) {
      console.error("🔥 Error generating policymaker regions:", err);
      res.status(500).json({ error: "Failed to generate regions." });
    }
  }
);

// --- Per-site report download (policymaker) ---
app.get(
  "/api/sites/:siteId/report",
  authMiddleware,
  authorize(["researcher", "policymaker", "admin"]),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { siteId } = req.params;
      const format = String(req.query.format ?? "excel").toLowerCase();
      if (!["excel", "csv"].includes(format)) {
        return res.status(400).json({ error: "Invalid format. Use excel or csv." });
      }

      const { data: siteData, error: siteError } = await supabaseAdmin
        .from("locations")
        .select("id, site, latitude, longitude")
        .eq("id", siteId)
        .single();

      if (siteError) throw siteError;
      if (!siteData) return res.status(404).json({ error: "Site not found." });

      const { data: history, error: historyError } = await supabaseAdmin
        .from("water_samples")
        .select(`
          sample_date,
          "As", "Cd", "Cr", "Cu", "Fe", "Mn", "Ni", "Pb", "Zn",
          pollution_indices ( hmpi, risk_level, key_contaminants )
        `)
        .eq("location_id", siteId)
        .order("sample_date", { ascending: true });

      if (historyError) throw historyError;

      if (format === "csv") {
        const csv = convertSiteHistoryToCSV(
          { site: siteData.site, latitude: siteData.latitude, longitude: siteData.longitude },
          history ?? []
        );
        res.header("Content-Type", "text/csv").attachment(`site_${siteId}_report.csv`).send(csv);
        return;
      }

      const excelBuffer = convertSiteHistoryToExcelBuffer(
        { site: siteData.site, latitude: siteData.latitude, longitude: siteData.longitude },
        history ?? []
      );
      res
        .header(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        .attachment(`site_${siteId}_report.xlsx`)
        .send(excelBuffer);
    } catch (err: any) {
      console.error("🔥 Error generating site report:", err);
      res.status(500).json({ error: "Failed to generate site report." });
    }
  }
);


app.get("/api/map-data", async (req: Request, res: Response) => {
  try {
    // Return real map markers: each marker is a site (lat/lng) with the latest
    // available HMPI + risk_level for that site.

    // 1) Get all sites with coordinates
    const { data: locations, error: locationsError } = await supabaseAdmin
      .from("locations")
      .select("id, site, latitude, longitude");

    if (locationsError) throw locationsError;
    if (!locations || locations.length === 0) return res.json([]);

    // 2) Get water samples + their pollution_indices, ordered newest first
    const { data: samples, error: samplesError } = await supabaseAdmin
      .from("water_samples")
      .select("location_id, sample_date, pollution_indices (hmpi, risk_level)")
      .order("sample_date", { ascending: false });

    if (samplesError) throw samplesError;

    // 3) Keep only the latest sample per location_id
    const latestByLocation = new Map<string, { hmpi: number; risk_level: string }>();

    for (const s of samples ?? []) {
      const locId = String((s as any).location_id ?? "");
      if (!locId || latestByLocation.has(locId)) continue;

      const pollution = (s as any).pollution_indices;
      const idx = Array.isArray(pollution) ? pollution[0] : pollution;
      if (!idx) continue;

      const hmpiRaw = idx.hmpi;
      const riskRaw = idx.risk_level;
      if (hmpiRaw == null || riskRaw == null) continue;

      latestByLocation.set(locId, {
        hmpi: Number(hmpiRaw),
        risk_level: String(riskRaw),
      });
    }

    // 4) Find the latest policymaker decision/alert per location
    // We use the existing `alerts` table for policymaker actions.
    const latestDecisionByLocation = new Map<
      string,
      {
        title: string;
        message: string | null;
        status: string | null;
        govt_body: string | null;
        is_urgent: boolean | null;
        created_at: string | null;
      }
    >();

    const { data: alerts, error: alertsError } = await supabaseAdmin
      .from("alerts")
      .select(
        "id, title, message, govt_body, is_urgent, status, created_at, water_samples ( location_id )"
      )
      .order("created_at", { ascending: false });

    if (alertsError) throw alertsError;

    for (const a of alerts ?? []) {
      const ws = (a as any).water_samples;
      const locId =
        (ws?.location_id != null && String(ws.location_id)) ||
        (Array.isArray(ws) &&
          ws[0]?.location_id != null &&
          String(ws[0].location_id)) ||
        "";

      const title = String((a as any).title ?? "");
      // Only include policymaker decisions in the public-facing map.
      if (!title.startsWith("Policymaker Decision:")) continue;

      if (!locId || latestDecisionByLocation.has(locId)) continue;

      latestDecisionByLocation.set(locId, {
        title: (a as any).title,
        message: (a as any).message ?? null,
        status: (a as any).status ?? null,
        govt_body: (a as any).govt_body ?? null,
        is_urgent: (a as any).is_urgent ?? null,
        created_at: (a as any).created_at ?? null,
      });
    }

    // 5) Build marker response expected by the frontend
    const mapData = locations
      .map((loc: any) => {
        const idx = latestByLocation.get(String(loc.id));
        if (!idx) return null;
        const decision = latestDecisionByLocation.get(String(loc.id));
        return {
          id: loc.id,
          site: loc.site,
          latitude: loc.latitude,
          longitude: loc.longitude,
          hmpi: idx.hmpi,
          risk_level: idx.risk_level,
          decision: decision
            ? {
                title: decision.title,
                message: decision.message,
                status: decision.status,
                govt_body: decision.govt_body,
                is_urgent: decision.is_urgent,
                created_at: decision.created_at,
              }
            : null,
        };
      })
      .filter(Boolean);

    res.json(mapData);
  } catch (err: any) {
    console.error("🔥 Error generating real map data:", err);
    res.status(500).json({ error: "Failed to generate map data." });
  }
});


app.get(
  "/api/dashboard/policymaker",
  authMiddleware,
  authorize(['policymaker', 'admin']), // Only policymakers and admins can access this
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 1. Get Key Statistics
      const { count: totalSites, error: sitesError } = await supabaseAdmin
        .from('locations')
        .select('*', { count: 'exact', head: true });

      if (sitesError) throw sitesError;

      const { count: highRiskSites, error: riskError } = await supabaseAdmin
        .from('pollution_indices')
        .select('*', { count: 'exact', head: true })
        .in('risk_level', ['high', 'critical']);
        // Note: This is a simplified count. A more advanced query would only count the latest sample for each site.

      if (riskError) throw riskError;

      const { count: activeAlerts, error: alertsCountError } = await supabaseAdmin
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending'); // Or whatever your active status is

      if (alertsCountError) throw alertsCountError;

      // 2. Get latest alerts (top 5)
      const { data: latestAlerts, error: alertsError } = await supabaseAdmin
        .from('alerts')
        .select(`
          id,
          title,
          created_at,
          water_samples ( locations ( site ) )
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (alertsError) throw alertsError;

      res.json({
        stats: {
          totalSites: totalSites ?? 0,
          highRiskSites: highRiskSites ?? 0,
          activeAlerts: activeAlerts ?? 0,
        },
        latestAlerts: latestAlerts,
      });

    } catch (err: any) {
      console.error("🔥 Error fetching policymaker dashboard data:", err);
      res.status(500).json({ error: "Failed to fetch dashboard data." });
    }
  }
);


// --- ✨ NEW: Route to handle community report submissions ---
app.post(
  "/api/community-reports",
  authMiddleware, // Ensure the user is logged in
  authorize(['public', 'researcher', 'policymaker', 'admin']), // Any logged-in user can report
  upload.single("photo"), // Use multer to handle a file upload with the key "photo"
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const { latitude, longitude, category, description } = req.body;
      const photoFile = req.file;

      if (!latitude || !longitude || !photoFile) {
        return res.status(400).json({ error: "Missing required fields: latitude, longitude, and photo are required." });
      }

      // 1. Upload the image to Supabase Storage
      const filePath = `reports/${user.id}/${Date.now()}_${photoFile.originalname}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from('community-reports')
        .upload(filePath, photoFile.buffer, {
          contentType: photoFile.mimetype,
        });

      if (uploadError) throw uploadError;

      // 2. Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('community-reports')
        .getPublicUrl(filePath);

      // 3. Save the report details to the database table
      const { data: report, error: reportError } = await supabaseAdmin
        .from('community_reports')
        .insert({
          reporter_id: user.id,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          category,
          description,
          image_url: publicUrl,
        })
        .select()
        .single();
      
      if (reportError) throw reportError;

      res.status(201).json(report);

    } catch (err: any) {
      console.error("🔥 Error creating community report:", err);
      res.status(500).json({ error: "Failed to create community report." });
    }
  }
);



// --- ✨ CORRECTED: Admin endpoint now uses a direct query ---
app.get(
  "/api/admin/users",
  authMiddleware,
  authorize(['admin']), // ✅ Only admins can access
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      // ✅ Call the secure SQL function instead of manual join
      const { data: users, error } = await supabaseAdmin.rpc('get_all_users_with_profiles');

      if (error) throw error;

      // ✅ Optional: format data (if needed)
      const formattedUsers = users.map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        role: u.role,
        email: u.email,
        created_at: u.created_at,
      }));

      res.status(200).json(formattedUsers);
    } catch (err: any) {
      console.error("🔥 Error fetching all users for admin:", err);
      res.status(500).json({ error: "Failed to fetch user list." });
    }
  }
);


// ---------------- 404 Handler ----------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found." });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

