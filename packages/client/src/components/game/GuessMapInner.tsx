'use client';

import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '../ui/Button';

// Fix for default marker icon in Leaflet + webpack
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface GuessMapInnerProps {
  onConfirm: (lat: number, lng: number) => void;
  disabled?: boolean;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function GuessMapInner({ onConfirm, disabled = false }: GuessMapInnerProps) {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  const handleClick = useCallback(
    (lat: number, lng: number) => {
      if (!disabled) {
        setMarkerPos([lat, lng]);
      }
    },
    [disabled]
  );

  const handleConfirm = () => {
    if (markerPos) {
      onConfirm(markerPos[0], markerPos[1]);
    }
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={18}
        className="w-full h-full rounded-lg"
        zoomControl={true}
        style={{ background: '#0a0a1a' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onClick={handleClick} />
        {markerPos && (
          <Marker
            position={markerPos}
            icon={defaultIcon}
            draggable={!disabled}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                setMarkerPos([pos.lat, pos.lng]);
              },
            }}
          />
        )}
      </MapContainer>

      {/* Confirm button */}
      {markerPos && !disabled && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
          <Button variant="primary" size="lg" onClick={handleConfirm}>
            Confirm Guess
          </Button>
        </div>
      )}
    </div>
  );
}
