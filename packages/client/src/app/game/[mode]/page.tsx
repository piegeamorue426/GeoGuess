'use client';

import { useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GameMode } from '@geoguess/shared';
import { GameLayout } from '@/components/layout/GameLayout';
import { PanoramaViewer } from '@/components/game/PanoramaViewer';
import { GuessMap } from '@/components/game/GuessMap';
import { GameHUD } from '@/components/game/GameHUD';
import { RoundResult } from '@/components/game/RoundResult';
import { GameResults } from '@/components/game/GameResults';
import { ScorePopup } from '@/components/game/ScorePopup';
import { useGame } from '@/hooks/useGame';
import { useTimer } from '@/hooks/useTimer';

export default function GamePage() {
  const params = useParams();
  const mode = (params.mode as GameMode) || 'classic';
  const isTimedMode = mode === 'timed';

  const {
    gameState,
    phase,
    currentResult,
    roundHistory,
    totalScore,
    error,
    startGame,
    submitGuess,
    goToNextRound,
  } = useGame();

  const timer = useTimer({
    countdown: isTimedMode,
    initialTime: 30,
    onTimeUp: () => {
      // Auto-submit a guess at center of map if time runs out
      if (phase === 'playing') {
        submitGuess(0, 0, 30);
      }
    },
  });

  // Start game on mount
  useEffect(() => {
    startGame(mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start timer when playing
  useEffect(() => {
    if (phase === 'playing') {
      timer.reset();
      timer.start();
    } else {
      timer.stop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleConfirmGuess = useCallback(
    (lat: number, lng: number) => {
      const timeSeconds = isTimedMode ? 30 - timer.time : timer.time;
      submitGuess(lat, lng, timeSeconds);
    },
    [isTimedMode, timer.time, submitGuess]
  );

  const handleNextRound = useCallback(() => {
    if (phase === 'finished') {
      // Already showing final results
      return;
    }
    goToNextRound();
  }, [phase, goToNextRound]);

  // Loading state
  if (phase === 'loading' && !error) {
    return (
      <GameLayout>
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full"
          />
        </div>
      </GameLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <GameLayout>
        <div className="w-full h-full flex flex-col items-center justify-center gap-4">
          <p className="text-danger text-lg">{error}</p>
          <button
            onClick={() => startGame(mode)}
            className="px-6 py-2 bg-primary text-background rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </GameLayout>
    );
  }

  // Final results
  if (phase === 'finished' && currentResult) {
    return (
      <GameResults
        totalScore={totalScore}
        maxPossibleScore={(gameState?.total_rounds || 5) * 5500}
        rounds={roundHistory}
        mode={mode}
      />
    );
  }

  return (
    <GameLayout>
      {/* HUD */}
      {gameState && (
        <GameHUD
          round={gameState.current_round}
          totalRounds={gameState.total_rounds}
          timerFormatted={timer.formatted}
          timerIsLow={isTimedMode && timer.time <= 10}
          totalScore={totalScore}
          mode={mode}
        />
      )}

      {/* Main game area */}
      <div className="w-full h-full flex flex-col lg:flex-row">
        {/* Panorama viewer */}
        <div className="flex-1 h-1/2 lg:h-full relative">
          <PanoramaViewer location={gameState?.current_location || null} />
        </div>

        {/* Guess map - bottom on mobile, right panel on desktop */}
        <div className="h-1/2 lg:h-full lg:w-[400px] xl:w-[500px] relative border-t lg:border-t-0 lg:border-l border-white/10">
          <GuessMap onConfirm={handleConfirmGuess} disabled={phase !== 'playing'} />
        </div>
      </div>

      {/* Score popup */}
      <ScorePopup score={currentResult?.score.total || null} show={phase === 'result'} />

      {/* Round result overlay */}
      {phase === 'result' && currentResult && (
        <RoundResult
          result={currentResult}
          timeSeconds={roundHistory[roundHistory.length - 1]?.timeSeconds || 0}
          onNext={handleNextRound}
        />
      )}
    </GameLayout>
  );
}
