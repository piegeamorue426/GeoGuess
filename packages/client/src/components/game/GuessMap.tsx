'use client';

import dynamic from 'next/dynamic';

const GuessMapInner = dynamic(() => import('./GuessMapInner').then((m) => m.GuessMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-surface rounded-lg">
      <div className="text-gray-500 animate-pulse">Loading map...</div>
    </div>
  ),
});

interface GuessMapProps {
  onConfirm: (lat: number, lng: number) => void;
  disabled?: boolean;
}

export function GuessMap({ onConfirm, disabled }: GuessMapProps) {
  return <GuessMapInner onConfirm={onConfirm} disabled={disabled} />;
}
