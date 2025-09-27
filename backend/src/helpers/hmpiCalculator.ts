import * as XLSX from "xlsx";
import * as math from "mathjs";

const requiredHeaders = [
  "Site",
  "Latitude",
  "Longitude",
  "As",
  "Cd",
  "Cr",
  "Cu",
  "Fe",
  "Mn",
  "Ni",
  "Pb",
  "Zn",
];

const WHO_STANDARDS: Record<string, number> = {
  As: 0.01,
  Cd: 0.003,
  Cr: 0.05,
  Cu: 2.0,
  Fe: 0.3,
  Mn: 0.4,
  Ni: 0.07,
  Pb: 0.01,
  Zn: 5.0,
};

// ---------------- Header Validation ----------------
export function validateHeaders(headers: string[]): true | string {
  const missing = requiredHeaders.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return `Missing required headers: ${missing.join(", ")}`;
  }
  return true;
}

// ---------------- Risk Classification ----------------
export function classifyRisk(hmpi: number): "safe" | "moderate" | "high" | "critical" {
  if (hmpi <= 100) return "safe";
  if (hmpi <= 200) return "moderate";
  if (hmpi <= 300) return "high";
  return "critical";
}

// ---------------- HMPI Calculation ----------------
export function calculateHMPI(row: Record<string, string | number>) {
  if (!row.Site || String(row.Site).trim().length === 0) {
    throw new Error("Missing Location (Site) value in one or more rows.");
  }

  const lat = parseFloat(String(row.Latitude));
  const lon = parseFloat(String(row.Longitude));
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error(
      `Invalid coordinates for site "${row.Site}". Latitude and Longitude must be valid numbers.`
    );
  }

  const metals = Object.keys(WHO_STANDARDS);
  const concentrations: Record<string, number> = {};

  for (const metal of metals) {
    const valRaw = row[metal];
    if (valRaw === undefined || valRaw === null || valRaw === "") {
      throw new Error(`Missing value for metal ${metal} in site "${row.Site}".`);
    }
    const val = parseFloat(String(valRaw));
    if (Number.isNaN(val) || val < 0) {
      throw new Error(
        `Invalid numeric value for metal ${metal} in site "${row.Site}". Must be non-negative number.`
      );
    }
    concentrations[metal] = val;
  }

  let numerator = 0;
  let denominator = 0;
  const keyContaminants: string[] = [];

  for (const metal of metals) {
    const Mi = concentrations[metal];
    const Si = WHO_STANDARDS[metal];
    const Qi = (Mi / Si) * 100;
    const Wi = 1 / Si;

    numerator = math.add(numerator, math.multiply(Qi, Wi)) as number;
    denominator = math.add(denominator, Wi) as number;

    if (Mi > Si) keyContaminants.push(metal);
  }

  const hmpiValue = numerator / denominator;
  const riskLevel = classifyRisk(hmpiValue);

  // ✅ Match frontend expected fields
  return {
    Location: String(row.Site).trim(),
    Latitude: lat,
    Longitude: lon,
    HMPI: Number(hmpiValue.toFixed(2)),
    RiskLevel: riskLevel,
    KeyContaminants: keyContaminants,
  };
}

// ---------------- CSV Export ----------------
export function convertResultsToCSV(results: ReturnType<typeof calculateHMPI>[]) {
  const header = ["Location", "Latitude", "Longitude", "HMPI", "RiskLevel", "KeyContaminants"];
  const lines = [header.join(",")];

  for (const res of results) {
    const line = [
      `"${escapeCsvField(res.Location)}"`,
      res.Latitude,
      res.Longitude,
      res.HMPI,
      `"${escapeCsvField(res.RiskLevel)}"`,
      `"${escapeCsvField(res.KeyContaminants.join(";"))}"`,
    ];
    lines.push(line.join(","));
  }
  return lines.join("\n");
}

function escapeCsvField(field: unknown) {
  if (typeof field !== "string") return field;
  const escaped = field.replace(/"/g, '""');
  if (/[,\"\n]/.test(field)) {
    return `"${escaped}"`;
  }
  return escaped;
}

// ---------------- Excel Export ----------------
export function convertResultsToExcelBuffer(
  results: ReturnType<typeof calculateHMPI>[]
): Buffer {
  const data = results.map((res) => ({
    Location: res.Location,
    Latitude: res.Latitude,
    Longitude: res.Longitude,
    HMPI: res.HMPI,
    RiskLevel: res.RiskLevel,
    KeyContaminants: res.KeyContaminants.join(";"),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 30 },
  ];

  worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "HMPI Results");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
