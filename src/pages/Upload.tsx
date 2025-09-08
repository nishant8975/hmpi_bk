import { useState, useCallback } from "react";
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

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const navigate = useNavigate();

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

  const handleFiles = (files: FileList) => {
    if (files.length > 0) {
      simulateUpload();
    }
  };

  const simulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const proceedToAnalysis = () => {
    navigate('/results');
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
                onClick={() => document.getElementById('fileInput')?.click()}
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
                    <Button variant="outline">
                      Choose File
                    </Button>
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
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-risk-safe" />
                <p className="text-lg font-medium text-foreground mb-2">
                  Upload Complete!
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your dataset has been successfully uploaded and validated
                </p>
                <Button onClick={proceedToAnalysis} className="shadow-elegant">
                  Proceed to Analysis
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sample Data & Guidelines */}
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
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-risk-safe mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location Data</p>
                    <p className="text-xs text-muted-foreground">Site names with GPS coordinates</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-risk-safe mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Heavy Metals</p>
                    <p className="text-xs text-muted-foreground">As, Cd, Cr, Cu, Fe, Mn, Ni, Pb, Zn concentrations</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-risk-safe mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Units & Standards</p>
                    <p className="text-xs text-muted-foreground">Consistent measurement units (mg/L or μg/L)</p>
                  </div>
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
    </div>
  );
};

export default Upload;