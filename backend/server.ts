// backend/server.ts
import express, { Request, Response } from "express";
import multer from "multer";
import csv from "csv-parser";
import stream from "stream";
import cors from "cors";

import {
  validateHeaders,
  calculateHMPI,
  convertResultsToCSV,
  convertResultsToExcelBuffer,
} from "./src/helpers/hmpiCalculator";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins (frontend ↔ backend communication)
app.use(cors());

// Multer setup for in-memory file storage
const upload = multer({ storage: multer.memoryStorage() });

// ---------------- Upload Route ----------------
app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
  try {
    console.log("📂 File upload started");

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded. Please upload a CSV file with key "file".',
      });
    }

    const csvBuffer = req.file.buffer;
    const rows: Record<string, string>[] = [];
    let headersValidated = false;

    const parseStream = stream.Readable.from(csvBuffer);

    // Parse CSV into rows[]
    await new Promise<void>((resolve, reject) => {
      parseStream
        .pipe(csv())
        .on("headers", (headers: string[]) => {
          const trimmedHeaders = headers.map((h) => h.trim());
          const valid = validateHeaders(trimmedHeaders);
          if (valid !== true) {
            reject({ status: 400, message: valid });
            return;
          }
          headersValidated = true;
        })
        .on("data", (data: Record<string, string>) => {
          rows.push(data);
        })
        .on("error", (err) => {
          console.error("❌ CSV parsing error:", err);
          reject({ status: 500, message: "Error parsing CSV file." });
        })
        .on("end", () => {
          if (!headersValidated) {
            reject({
              status: 400,
              message: "CSV file is empty or missing headers.",
            });
            return;
          }
          if (rows.length === 0) {
            reject({ status: 400, message: "CSV file is empty. No data to process." });
            return;
          }
          resolve();
        });
    });

    console.log("⚙️ Calculation started");
    const results = [];

    for (const row of rows) {
      try {
        const result = calculateHMPI(row);
        results.push(result);
      } catch (e: any) {
        return res.status(400).json({ error: e.message });
      }
    }
    console.log("✅ Calculation finished");

    // 🔹 CSV Export
    if (req.query.csv === "true") {
      const csvResults = convertResultsToCSV(results);
      res.header("Content-Type", "text/csv");
      res.header("Content-Disposition", 'attachment; filename="hmpi_results.csv"');
      return res.send(csvResults);
    }

    // 🔹 Excel Export
    if (req.query.excel === "true") {
      const excelBuffer = convertResultsToExcelBuffer(results);
      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.header("Content-Disposition", 'attachment; filename="hmpi_results.xlsx"');
      return res.send(excelBuffer);
    }

    // 🔹 Default → JSON Response
    return res.json(results);

  } catch (err: any) {
    if (err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error("🔥 Server error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ---------------- 404 Handler ----------------
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found." });
});

// ---------------- Start Server ----------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
