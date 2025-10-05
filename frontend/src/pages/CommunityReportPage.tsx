import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCommunityReport } from '@/service/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, Send } from 'lucide-react';

const CommunityReportPage = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form State
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [location, setLocation] = useState<{ lat: number, lon: number } | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const reportMutation = useMutation({
        mutationFn: createCommunityReport,
        onSuccess: () => {
            toast({ title: "Report Submitted!", description: "Thank you for your contribution to community safety." });
            queryClient.invalidateQueries({ queryKey: ['communityReports'] }); // Invalidate for a future feed page
            navigate('/'); // Redirect to the main dashboard after submission
        },
        onError: (err: Error) => {
            toast({ variant: "destructive", title: "Submission Failed", description: err.message });
        },
    });

    const handleGetLocation = () => {
        setIsGettingLocation(true);
        if (!navigator.geolocation) {
            toast({ variant: "destructive", title: "Geolocation Error", description: "Geolocation is not supported by your browser." });
            setIsGettingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setIsGettingLocation(false);
                toast({ title: "Location Captured", description: "Your current coordinates have been recorded." });
            },
            (error) => {
                toast({ variant: "destructive", title: "Location Error", description: "Unable to retrieve your location. Please ensure location services are enabled." });
                setIsGettingLocation(false);
            }
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!location || !photo || !category) {
            toast({ variant: "destructive", title: "Missing Information", description: "Please provide a location, photo, and category." });
            return;
        }
        reportMutation.mutate({
            latitude: location.lat,
            longitude: location.lon,
            category,
            description,
            photo,
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Report a Community Issue</CardTitle>
                    <CardDescription>Spotted a potential pollution source? Let us know. Your report helps keep our water safe.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <div className="flex gap-2 items-center">
                                <Button type="button" variant="outline" onClick={handleGetLocation} disabled={isGettingLocation}>
                                    {isGettingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                    Get Current Location
                                </Button>
                                {location && <p className="text-sm text-green-600 font-medium">Location Captured!</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="photo">Photo Evidence</Label>
                            <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Issue Category</Label>
                            <Select onValueChange={setCategory} value={category} required>
                                <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Discolored Water">Discolored Water</SelectItem>
                                    <SelectItem value="Strange Smell">Strange Smell</SelectItem>
                                    <SelectItem value="Industrial Runoff">Industrial Runoff</SelectItem>
                                    <SelectItem value="Dead Fish / Wildlife">Dead Fish / Wildlife</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" placeholder="Provide any additional details..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        </div>

                        <Button type="submit" className="w-full" disabled={reportMutation.isPending}>
                            {reportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Submit Report
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CommunityReportPage;

