import { supabase } from '@/config/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";
// Helper function to get the auth header
const getAuthHeader = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error("Authentication error: Could not get user session.");
  }
  return { 'Authorization': `Bearer ${session.access_token}` };
};


// ---------------- Upload File (Updated with Auth) ----------------
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const authHeader = await getAuthHeader(); // ✨ Get the auth token

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: {
        ...authHeader // ✨ Add the token to the request
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      // Try to parse error JSON, fallback to text
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(`Upload failed: ${errorJson.error || res.statusText}`);
      } catch {
        throw new Error(`Upload failed: ${errorText || res.statusText}`);
      }
    }

    return (await res.json()) as any[]; // HMPI results
  } catch (err: any) {
    throw new Error(err.message || "Unexpected error during upload.");
  }
}

// ---------------- Download Results (Updated with Auth) ----------------
export async function downloadResults(file: File, format: "csv" | "excel") {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const authHeader = await getAuthHeader(); // ✨ Get the auth token

    const res = await fetch(`${API_BASE}/upload?${format}=true`, {
      method: "POST",
      headers: {
        ...authHeader // ✨ Add the token to the request
      },
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


// --- Function to get Analysis History ---
export const getAnalysisHistory = async (): Promise<any[]> => {
  try {
    const authHeader = await getAuthHeader(); // ✨ Get the auth token

    // Make the authenticated request to our backend API
    const response = await fetch(`${API_BASE}/api/analysis-history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader, // ✨ Add the token to the request
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch analysis history.');
    }

    return response.json();
  } catch (err: any) {
     throw new Error(err.message || "Unexpected error while fetching history.");
  }
};

// --- Function to CREATE a new alert ---
export const createAlert = async (alertData: {
  sample_id: number;
  title: string;
  message: string;
  govt_body: string;
  is_urgent: boolean;
  status: string;
}) => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: JSON.stringify(alertData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create alert.");
  }
  return response.json();
};

// --- Function to GET all alerts ---
export const getAlerts = async (): Promise<any[]> => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/alerts`, {
    headers: { ...authHeader },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch alerts.');
  }
  return response.json();
};

// --- Function to get a SINGLE analysis result by its ID ---
export const getAnalysisById = async (id: string): Promise<any> => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/results/${id}`, {
    headers: { ...authHeader },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch analysis with id ${id}.`);
  }
  return response.json();
};

// --- ✨ NEW: Function to get all data for the Researcher Dashboard ---
export const getResearcherDashboardData = async () => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/dashboard/researcher`, {
    headers: { ...authHeader },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch dashboard data.');
  }
  return response.json();
};


// --- ✨ NEW: Function to get all data for a single site by its ID ---
export const getSiteDetails = async (siteId: string): Promise<any> => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/sites/${siteId}`, {
    headers: { ...authHeader },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Failed to fetch details for site ${siteId}.`);
  }
  return response.json();
};


// --- ✨ NEW: Function to get map data ---
export const getMapData = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE}/api/map-data`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch map data.');
  }
  return response.json();
};

// --- ✨ NEW: Function to get all data for the Policymaker Dashboard ---
export const getPolicymakerDashboardData = async () => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/dashboard/policymaker`, {
    headers: { ...authHeader },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch policymaker dashboard data.');
  }
  return response.json();
};


// --- ✨ NEW: Function to submit a new community report ---
export const createCommunityReport = async (reportData: {
  latitude: number;
  longitude: number;
  category: string;
  description: string;
  photo: File;
}) => {
  const authHeader = await getAuthHeader();

  // We use FormData because we are sending a file (the photo)
  const formData = new FormData();
  formData.append('latitude', String(reportData.latitude));
  formData.append('longitude', String(reportData.longitude));
  formData.append('category', reportData.category);
  formData.append('description', reportData.description);
  formData.append('photo', reportData.photo);

  const response = await fetch(`${API_BASE}/api/community-reports`, {
    method: 'POST',
    headers: {
      // Note: We don't set 'Content-Type' here; the browser does it for FormData
      ...authHeader,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit report.");
  }
  return response.json();
};

//--------------------------- here the end of community report 


// --- ✨ NEW: Admin-specific API functions ---

/**
 * Fetches a list of all users from the backend. (Admin only)
 */
export const getAllUsers = async (): Promise<any[]> => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/admin/users`, {
    headers: { ...authHeader },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch users.');
  }
  return response.json();
};

/**
 * Updates a specific user's role. (Admin only)
 * @param userId The ID of the user to update.
 * @param role The new role to assign ('public', 'researcher', etc.).
 */
export const updateUserRole = async (userId: string, role: string): Promise<any> => {
  const authHeader = await getAuthHeader();
  const response = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update user role.');
  }
  return response.json();
};

