'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Globe, Ban, Lock } from 'lucide-react';
import { Location, ModeRestrictions } from '@geoguess/shared';

interface PanoramaViewerProps {
  location: Location | null;
  restrictions?: ModeRestrictions;
}

export function PanoramaViewer({ location, restrictions }: PanoramaViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const noMove = restrictions?.noMove ?? false;
  const noPan = restrictions?.noPan ?? false;

  if (!location) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-surface">
        <div className="animate-pulse text-gray-500">Loading location...</div>
      </div>
    );
  }

  const hasPanorama = location.panorama_url && location.panorama_url.trim() !== '';

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <motion.div
      layout
      className={`relative ${
        isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-full'
      } bg-surface rounded-lg overflow-hidden`}
    >
      {hasPanorama ? (
        <div className="relative w-full h-full">
          <iframe
            src={`https://www.mapillary.com/embed?image_key=${location.panorama_url}`}
            className="w-full h-full border-0"
            title="Street View"
            allow="fullscreen"
            style={{
              pointerEvents: noMove ? 'none' : 'auto',
            }}
          />
          {noMove && (
            <div className="absolute inset-0 cursor-not-allowed" />
          )}
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-light">
          <Globe className="w-24 h-24 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">Panorama not available</p>
          <p className="text-gray-500 text-sm mt-2">
            Use the map to make your best guess!
          </p>
        </div>
      )}

      {/* Mode restriction banners */}
      {noMove && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-sm font-medium z-10">
          <Ban size={14} />
          No Movement Allowed
        </div>
      )}
      {noPan && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/90 text-white text-sm font-medium z-10">
          <Lock size={14} />
          No Panning Allowed
        </div>
      )}

      {/* Fullscreen toggle */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 p-2 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-colors z-10"
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </motion.div>
  );
}
