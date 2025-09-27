// frontend/src/services/api.ts

const API_BASE = "http://localhost:5000";

// ---------------- Upload File ----------------
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${errorText || res.statusText}`);
    }

    return (await res.json()) as any[]; // HMPI results
  } catch (err: any) {
    throw new Error(err.message || "Unexpected error during upload.");
  }
}

// ---------------- Download Results ----------------
export async function downloadResults(file: File, format: "csv" | "excel") {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/upload?${format}=true`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Download failed: ${errorText || res.statusText}`);
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = format === "csv" ? "hmpi_results.csv" : "hmpi_results.xlsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  } catch (err: any) {
    throw new Error(err.message || "Unexpected error during download.");
  }
}
