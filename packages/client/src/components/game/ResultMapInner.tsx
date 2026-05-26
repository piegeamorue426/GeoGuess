'use client';

import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';

const guessIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const actualIcon = L.divIcon({
  html: '<div style="width:16px;height:16px;background:#00ff88;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(0,255,136,0.6)"></div>',
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

interface ResultMapInnerProps {
  guessLat: number;
  guessLng: number;
  actualLat: number;
  actualLng: number;
}

export function ResultMapInner({ guessLat, guessLng, actualLat, actualLng }: ResultMapInnerProps) {
  const bounds = L.latLngBounds(
    [guessLat, guessLng],
    [actualLat, actualLng]
  );

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [50, 50] }}
      className="w-full h-full rounded-lg"
      zoomControl={true}
      style={{ background: '#0a0a1a' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[guessLat, guessLng]} icon={guessIcon} />
      <Marker position={[actualLat, actualLng]} icon={actualIcon} />
      <Polyline
        positions={[
          [guessLat, guessLng],
          [actualLat, actualLng],
        ]}
        pathOptions={{ color: '#ef4444', weight: 2, dashArray: '8, 8' }}
      />
    </MapContainer>
  );
}
