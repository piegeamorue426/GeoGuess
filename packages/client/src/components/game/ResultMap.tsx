'use client';

import dynamic from 'next/dynamic';

const ResultMapInner = dynamic(() => import('./ResultMapInner').then((m) => m.ResultMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface rounded-lg">
      <div className="text-gray-500 animate-pulse">Loading map...</div>
    </div>
  ),
});

interface ResultMapProps {
  guessLat: number;
  guessLng: number;
  actualLat: number;
  actualLng: number;
}

export function ResultMap(props: ResultMapProps) {
  return <ResultMapInner {...props} />;
}
