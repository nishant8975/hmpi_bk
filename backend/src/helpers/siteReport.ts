import * as XLSX from "xlsx";

const METALS = ["As", "Cd", "Cr", "Cu", "Fe", "Mn", "Ni", "Pb", "Zn"] as const;

function normalizeKeyContaminants(value: unknown): string {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export function convertSiteHistoryToCSV(
  site: { site: string; latitude: number; longitude: number },
  history: any[]
) {
  const header = [
    "site",
    "latitude",
    "longitude",
    "sample_date",
    "hmpi",
    "risk_level",
    "key_contaminants",
    ...METALS,
  ];

  const lines: string[] = [header.join(",")];

  for (const s of history ?? []) {
    const idx = Array.isArray(s.pollution_indices)
      ? s.pollution_indices[0]
      : s.pollution_indices;

    const row = [
      `"${String(site.site ?? "").replace(/"/g, '""')}"`,
      site.latitude,
      site.longitude,
      `"${new Date(s.sample_date).toLocaleDateString()}"`,
      idx?.hmpi ?? "",
      `"${idx?.risk_level ?? ""}"`,
      `"${normalizeKeyContaminants(idx?.key_contaminants).replace(/"/g, '""')}"`,
      ...METALS.map((m) => s[m] ?? ""),
    ];

    lines.push(row.join(","));
  }

  return lines.join("\n");
}

export function convertSiteHistoryToExcelBuffer(
  site: { site: string; latitude: number; longitude: number },
  history: any[]
): Buffer {
  const rows = (history ?? []).map((s) => {
    const idx = Array.isArray(s.pollution_indices)
      ? s.pollution_indices[0]
      : s.pollution_indices;

    return {
      site: site.site,
      latitude: site.latitude,
      longitude: site.longitude,
      sample_date: s.sample_date,
      hmpi: idx?.hmpi ?? null,
      risk_level: idx?.risk_level ?? null,
      key_contaminants: normalizeKeyContaminants(idx?.key_contaminants),
      ...METALS.reduce((acc: any, m) => {
        acc[m] = s[m] ?? null;
        return acc;
      }, {}),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 26 }, // site
    { wch: 12 }, // lat
    { wch: 12 }, // long
    { wch: 14 }, // sample_date
    { wch: 10 }, // hmpi
    { wch: 12 }, // risk_level
    { wch: 30 }, // key_contaminants
    { wch: 10 }, // As
    { wch: 10 }, // Cd
    { wch: 10 }, // Cr
    { wch: 10 }, // Cu
    { wch: 10 }, // Fe
    { wch: 10 }, // Mn
    { wch: 10 }, // Ni
    { wch: 10 }, // Pb
    { wch: 10 }, // Zn
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Site Report");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

