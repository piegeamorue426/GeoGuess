'use client';

import { motion } from 'framer-motion';
import { MapPin, Clock, Target } from 'lucide-react';
import { GuessResult } from '@geoguess/shared';
import { Button } from '../ui/Button';
import { ResultMap } from './ResultMap';
import { formatDistance } from '@/lib/scoring';

interface RoundResultProps {
  result: GuessResult;
  timeSeconds: number;
  onNext: () => void;
  isFinalRound?: boolean;
}

export function RoundResult({ result, timeSeconds, onNext, isFinalRound }: RoundResultProps) {
  const { actual_location, distance_km, score, round } = result;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col"
    >
      {/* Map section */}
      <div className="flex-1 relative">
        {round.guess_lat !== null && round.guess_lng !== null && (
          <ResultMap
            guessLat={round.guess_lat}
            guessLng={round.guess_lng}
            actualLat={actual_location.lat}
            actualLng={actual_location.lng}
          />
        )}
      </div>

      {/* Result info panel */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-surface border-t border-white/10 p-6"
      >
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-6">
          {/* Distance */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-danger/20">
              <MapPin className="w-5 h-5 text-danger" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Distance</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-bold text-white"
              >
                {formatDistance(distance_km)}
              </motion.p>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Score</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-xl font-bold text-primary"
              >
                {score.total.toLocaleString()}
              </motion.p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/20">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Time</p>
              <p className="text-xl font-bold text-white">{timeSeconds}s</p>
            </div>
          </div>

          {/* Location name */}
          <div>
            <p className="text-sm text-gray-400">Location</p>
            <p className="text-lg font-medium text-white">
              {actual_location.city}, {actual_location.country}
            </p>
          </div>

          {/* Next button */}
          <Button variant="primary" size="lg" onClick={onNext}>
            {isFinalRound ? 'See Results' : 'Next Round'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
