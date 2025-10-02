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
  authorize(['researcher', 'admin']),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const { sample_id, title, message, govt_body, is_urgent, status } = req.body;

      if (!sample_id || !title || !govt_body) {
        return res.status(400).json({ error: "Missing required fields for alert (sample_id, title, govt_body)." });
      }

      const { data, error } = await supabaseAdmin
        .from('alerts')
        .insert({
          sample_id,
          researcher_id: user.id,
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

// ---------------- 404 Handler ----------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found." });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

