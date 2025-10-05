import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getMapData } from '@/service/api';
import { Loader2 } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const getMarkerColor = (risk: string) => {
    switch(risk?.toLowerCase()) {
        case 'critical': return 'red';
        case 'high': return 'orange';
        case 'moderate': return 'yellow';
        case 'safe': return 'green';
        default: return 'blue';
    }
}

const createIcon = (color: string) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const MapView = () => {
    const { data: mapData, isLoading, error } = useQuery({
        queryKey: ['mapData'],
        queryFn: getMapData,
    });

    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-200px)]"><Loader2 className="h-10 w-10 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-center text-destructive">Error: {error.message}</div>;
    }

    return (
        <div className="space-y-4">
             <div>
                <h1 className="text-3xl font-bold">Contamination Map</h1>
                <p className="text-muted-foreground">An overview of water quality at monitored sites.</p>
            </div>
            <MapContainer center={[18.5204, 73.8567]} zoom={11} scrollWheelZoom={false} style={{ height: '600px', width: '100%', borderRadius: '10px' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapData?.map(point => (
                    <Marker key={point.id} position={[point.latitude, point.longitude]} icon={createIcon(getMarkerColor(point.risk_level))}>
                        <Popup>
                           <strong>{point.site}</strong><br/>
                           Risk Level: {point.risk_level}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default MapView;

