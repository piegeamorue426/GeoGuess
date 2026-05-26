'use client';

import { motion } from 'framer-motion';
import { Timer } from './Timer';
import { Badge } from '../ui/Badge';
import { GameMode } from '@geoguess/shared';

interface GameHUDProps {
  round: number;
  totalRounds: number;
  timerFormatted: string;
  timerIsLow?: boolean;
  totalScore: number;
  mode: GameMode;
}

const modeLabels: Record<GameMode, string> = {
  classic: 'Classic',
  timed: 'Hardcore',
  streak: 'Streak',
  challenge: 'Challenge',
};

export function GameHUD({
  round,
  totalRounds,
  timerFormatted,
  timerIsLow = false,
  totalScore,
  mode,
}: GameHUDProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
    >
      <div className="flex items-center justify-between p-4 pointer-events-auto">
        {/* Left: Round info */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <span className="text-sm text-gray-400">Round</span>
          <span className="text-lg font-bold text-white">
            {round}/{totalRounds}
          </span>
        </div>

        {/* Center: Timer */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <Timer formatted={timerFormatted} isLow={timerIsLow} />
        </div>

        {/* Right: Score and mode */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-lg px-4 py-2">
          <Badge variant={mode === 'timed' ? 'danger' : 'primary'}>
            {modeLabels[mode]}
          </Badge>
          <div className="text-lg font-bold text-primary">{totalScore.toLocaleString()}</div>
        </div>
      </div>
    </motion.div>
  );
}
