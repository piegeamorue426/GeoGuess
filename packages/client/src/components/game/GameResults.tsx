'use client';

import { motion } from 'framer-motion';
import { Trophy, MapPin, Clock, Star, Home, RotateCcw } from 'lucide-react';
import { GuessResult } from '@geoguess/shared';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatDistance } from '@/lib/scoring';
import Link from 'next/link';

interface RoundSummary {
  roundNumber: number;
  guessResult: GuessResult;
  timeSeconds: number;
}

interface GameResultsProps {
  totalScore: number;
  maxPossibleScore: number;
  rounds: RoundSummary[];
  mode: string;
}

export function GameResults({ totalScore, maxPossibleScore, rounds, mode }: GameResultsProps) {
  // Estimate XP earned: 1 XP per 10 points
  const xpEarned = Math.round(totalScore / 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-30 bg-background overflow-y-auto"
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header with score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center mb-8"
        >
          <Trophy className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-white mb-2">Game Complete!</h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl font-bold text-primary drop-shadow-[0_0_20px_rgba(0,255,136,0.4)]"
          >
            {totalScore.toLocaleString()}
          </motion.div>
          <p className="text-gray-400 mt-2">
            out of {maxPossibleScore.toLocaleString()} possible points
          </p>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-warning" />
              <span className="text-lg font-medium text-white">+{xpEarned} XP Earned</span>
            </div>
            <ProgressBar value={totalScore} max={maxPossibleScore} />
          </Card>
        </motion.div>

        {/* Round breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Round Breakdown</h2>
          <div className="space-y-3">
            {rounds.map((round, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <Card className="!p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center text-sm font-bold text-gray-300">
                        {round.roundNumber}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {round.guessResult.actual_location.city},{' '}
                          {round.guessResult.actual_location.country}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {formatDistance(round.guessResult.distance_km)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {round.timeSeconds}s
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {round.guessResult.score.total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="flex items-center justify-center gap-4"
        >
          <Link href={`/game/${mode}`}>
            <Button variant="primary" size="lg">
              <RotateCcw size={18} />
              Play Again
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="lg">
              <Home size={18} />
              Home
            </Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
