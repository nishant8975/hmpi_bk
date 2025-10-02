import { useState, useCallback } from "react";
import { supabase } from "@/config/supabaseClient"; // For authentication
import { useToast } from "@/components/ui/use-toast"; // For notifications

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload as UploadIcon, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Info,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// We are removing the api service import to handle fetch directly here for auth
// import { uploadFile, downloadResults } from "../service/api";

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // drag handling - no changes needed
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // upload handler - UPDATED WITH AUTHENTICATION LOGIC
  const handleFiles = async (files: FileList) => {
    const f = files[0];
    if (!f) return;
    setFile(f);

    setIsUploading(true);
    setError(null);
    setUploadComplete(false);
    setUploadProgress(0);

    try {
      // 1. Get the user's session token from Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error("Authentication error: Could not get user session.");
      }

      // Start a fake progress animation for better UX
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      // 2. Prepare the file for upload
      const formData = new FormData();
      formData.append("file", f);

      // 3. Perform the authenticated fetch request to the backend
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      clearInterval(interval); // Stop the fake progress
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed from server.");
      }

      setResults(data);
      setUploadProgress(100);
      setUploadComplete(true);
      toast({ title: "Upload Successful", description: "Your file has been processed." });
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Upload Failed", description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const proceedToAnalysis = () => {
    navigate("/results", { state: { results } });
  };

  const handleDownload = (format: "csv" | "excel") => {
    // TODO: Implement download logic, potentially using the file state
    console.log(`Download results as ${format}`);
    toast({ title: "Download initiated." });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Dataset</h1>
        <p className="text-muted-foreground">Upload your water quality data for HMPI analysis</p>
      </div>

      {/* Instructions */}
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-foreground">
          <strong>Required columns:</strong> Location, Latitude, Longitude, Heavy Metal Concentrations (As, Cd, Cr, Cu, Fe, Mn, Ni, Pb, Zn), Units, Sample Date
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Area */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="w-5 h-5 text-primary" />
              Upload Data File
            </CardTitle>
            <CardDescription>
              Drag and drop your CSV or Excel file, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!uploadComplete ? (
              <div
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                  ${dragActive 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput")?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />

                {!isUploading ? (
                  <>
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Drop your data file here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports CSV and Excel formats (up to 50MB)
                    </p>
                    <Button variant="outline">Choose File</Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <UploadIcon className="w-6 h-6 text-primary animate-pulse-subtle" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-foreground mb-2">
                        Uploading dataset...
                      </p>
                      <Progress value={uploadProgress} className="w-full" />
                      <p className="text-sm text-muted-foreground mt-2">
                        {uploadProgress}% complete
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-8">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Upload Complete!
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your dataset has been successfully uploaded and validated
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={proceedToAnalysis}>
                    Proceed to Analysis
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload("csv")}>
                    Download CSV
                  </Button>
                  <Button variant="outline" onClick={() => handleDownload("excel")}>
                    Download Excel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar (Sample, Requirements, Info) */}
        <div className="space-y-6">
          {/* Sample Data */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                Sample Template
              </CardTitle>
              <CardDescription>
                Download our sample template to ensure proper data format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Sample CSV
              </Button>
            </CardContent>
          </Card>

          {/* Data Requirements */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Data Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Location Data</p>
                  <p className="text-xs text-muted-foreground">Site names with GPS coordinates</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Heavy Metals</p>
                  <p className="text-xs text-muted-foreground">As, Cd, Cr, Cu, Fe, Mn, Ni, Pb, Zn concentrations</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Units & Standards</p>
                  <p className="text-xs text-muted-foreground">Consistent measurement units (mg/L or μg/L)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processing Info */}
          <Card className="shadow-card border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <AlertCircle className="w-5 h-5" />
                Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-foreground">• Small datasets (&lt;100 samples): ~30 seconds</p>
                <p className="text-foreground">• Medium datasets (100-1000): ~2 minutes</p>
                <p className="text-foreground">• Large datasets (&gt;1000): ~5-10 minutes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Upload;

