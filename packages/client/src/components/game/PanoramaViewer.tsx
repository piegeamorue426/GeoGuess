'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Minimize2, Globe } from 'lucide-react';
import { Location } from '@geoguess/shared';

interface PanoramaViewerProps {
  location: Location | null;
}

export function PanoramaViewer({ location }: PanoramaViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        <iframe
          src={`https://www.mapillary.com/embed?image_key=${location.panorama_url}`}
          className="w-full h-full border-0"
          title="Street View"
          allow="fullscreen"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface to-surface-light">
          <Globe className="w-24 h-24 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg font-medium">Panorama not available</p>
          <p className="text-gray-500 text-sm mt-2">
            Use the map to make your best guess!
          </p>
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
