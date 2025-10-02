import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query'; // ✨ 1. Import useQuery
import { getAnalysisHistory } from '../service/api'; // Corrected import path
import { useToast } from '../components/ui/use-toast'; // Corrected import path
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader2, MoreHorizontal, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Analysis = {
  id: number;
  sample_date: string;
  locations: {
    site: string;
  };
  pollution_indices: {
    hmpi: number;
    risk_level: 'safe' | 'moderate' | 'high' | 'critical';
  }[];
};

const getRiskBadgeVariant = (riskLevel?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (riskLevel?.toLowerCase()) {
    case 'safe': return 'default';
    case 'moderate': return 'secondary';
    case 'high': return 'outline';
    case 'critical': return 'destructive';
    default: return 'default';
  }
};

const AnalysisHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // ✨ 2. Replace useEffect and useState with useQuery for data fetching and caching
  const { 
    data: analyses = [], // Provide a default empty array
    isLoading, 
    error 
  } = useQuery<Analysis[], Error>({
    queryKey: ['analysisHistory'], // A unique key for this query
    queryFn: getAnalysisHistory,   // The function that fetches the data
    staleTime: 1000 * 60 * 5,      // Cache data for 5 minutes before re-fetching
  });

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(analysis => 
      analysis.locations.site.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analyses, searchTerm]);

  const handleIssueAlert = (analysis: Analysis) => {
    const riskLevel = analysis.pollution_indices[0]?.risk_level;
    const isHighRisk = riskLevel === 'high' || riskLevel === 'critical';

    navigate('/alerts', {
      state: {
        sampleId: analysis.id,
        title: `Pollution Alert for ${analysis.locations.site}`,
        riskLevel: riskLevel,
        isUrgent: isHighRisk,
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading analysis history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading History</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Analysis History</h1>
          <p className="text-muted-foreground">A record of all your uploaded and processed datasets.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by site name..."
            className="pl-8 sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>Sample Date</TableHead>
              <TableHead className="text-right">HMPI</TableHead>
              <TableHead className="text-center">Risk Level</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnalyses.length > 0 ? filteredAnalyses.map((analysis) => (
              <TableRow key={analysis.id}>
                <TableCell className="font-medium">{analysis.locations.site}</TableCell>
                <TableCell>{new Date(analysis.sample_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">{analysis.pollution_indices[0]?.hmpi.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                   <Badge variant={getRiskBadgeVariant(analysis.pollution_indices[0]?.risk_level)}>
                      {analysis.pollution_indices[0]?.risk_level}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate(`/results/${analysis.id}`)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled>Generate Report</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleIssueAlert(analysis)} className="text-destructive focus:text-destructive">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        <span>Issue Alert</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  {analyses.length === 0 ? "You have not uploaded any analyses yet." : "No results found for your search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AnalysisHistory;

