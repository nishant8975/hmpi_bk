import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Calculator, Sparkles } from 'lucide-react';
import MapView from '@/pages/map view/MapView';

// --- Calculation Logic (Adapted for Frontend) ---

// WHO standards based on your request
const WHO_STANDARDS: Record<string, number> = {
  As: 0.01,
  Pb: 0.01,
  Hg: 0.006, // Mercury
  Cd: 0.003,
  Cr: 0.05,
  Ni: 0.07,
  Cu: 2.0,
  Zn: 5.0,
};

const metals = Object.keys(WHO_STANDARDS);

const classifyRisk = (hmpi: number): "safe" | "moderate" | "high" | "critical" => {
  if (hmpi <= 100) return "safe";
  if (hmpi <= 200) return "moderate";
  if (hmpi <= 300) return "high";
  return "critical";
};

const getRiskBadgeVariant = (risk?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (risk?.toLowerCase()) {
    case 'safe': return 'default';
    case 'moderate': return 'secondary';
    case 'high': return 'outline';
    case 'critical': return 'destructive';
    default: return 'default';
  }
};

const ManualCalculator = () => {
  const [concentrations, setConcentrations] = useState<Record<string, string>>(
    Object.fromEntries(metals.map(m => [m, '']))
  );
  const [result, setResult] = useState<{ hmpi: number; risk: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (metal: string, value: string) => {
    setConcentrations(prev => ({ ...prev, [metal]: value }));
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    try {
      let numerator = 0;
      let denominator = 0;

      for (const metal of metals) {
        const Mi = parseFloat(concentrations[metal]);
        if (isNaN(Mi)) {
          throw new Error(`Please enter a valid number for ${metal}.`);
        }
        const Si = WHO_STANDARDS[metal];
        const Qi = (Mi / Si) * 100;
        const Wi = 1 / Si;

        numerator += (Qi * Wi);
        denominator += Wi;
      }
      
      const hmpiValue = numerator / denominator;
      setResult({
        hmpi: parseFloat(hmpiValue.toFixed(2)),
        risk: classifyRisk(hmpiValue),
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Manual HMPI Calculator
        </CardTitle>
        <CardDescription>
          Enter heavy metal concentrations to get an instant HMPI value and risk assessment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metals.map(metal => (
            <div key={metal} className="space-y-2">
              <Label htmlFor={metal}>{metal} (mg/L)</Label>
              <Input
                id={metal}
                type="number"
                step="0.001"
                placeholder={`e.g., ${WHO_STANDARDS[metal]}`}
                value={concentrations[metal]}
                onChange={(e) => handleInputChange(metal, e.target.value)}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={handleCalculate}>Calculate HMPI</Button>
          {error && (
            <Alert variant="destructive" className="w-full max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Calculation Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {result && (
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Calculated HMPI Value</p>
              <p className="text-4xl font-bold my-2">{result.hmpi}</p>
              <Badge variant={getRiskBadgeVariant(result.risk)} className="text-base">
                {result.risk.charAt(0).toUpperCase() + result.risk.slice(1)} Risk
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PublicDashboard = () => {
  return (
    <div className="space-y-8">
      <MapView />
      <ManualCalculator />
    </div>
  );
};

export default PublicDashboard;

