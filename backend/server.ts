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


app.get("/api/map-data", (req: Request, res: Response) => {
  try {
    // This function generates a set of realistic mock data points.
    // We can easily replace this with a real database query later.
    const mockMapData = [
      { id: 1, site: "Mula River - Aundh Bridge", latitude: 18.558, longitude: 73.806, risk_level: "High" },
      { id: 2, site: "Pawana River - Pimpri", latitude: 18.62, longitude: 73.79, risk_level: "Critical" },
      { id: 3, site: "Indrayani River - Dehu", latitude: 18.72, longitude: 73.76, risk_level: "Moderate" },
      { id: 4, site: "Bhima River - Koregaon", latitude: 18.42, longitude: 74.05, risk_level: "Safe" },
      { id: 5, site: "Mutha River - Deccan", latitude: 18.51, longitude: 73.83, risk_level: "High" },
    ];
    res.json(mockMapData);
  } catch (err: any) {
    console.error("🔥 Error generating mock map data:", err);
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

// ---------------- 404 Handler ----------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found." });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

