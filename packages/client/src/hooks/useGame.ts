'use client';

import { useState, useCallback } from 'react';
import { GameState, GuessResult, GameMode } from '@geoguess/shared';
import * as api from '@/lib/api';

export type GamePhase = 'loading' | 'playing' | 'result' | 'finished';

interface RoundHistory {
  roundNumber: number;
  guessResult: GuessResult;
  timeSeconds: number;
}

interface UseGameReturn {
  gameState: GameState | null;
  phase: GamePhase;
  currentResult: GuessResult | null;
  roundHistory: RoundHistory[];
  totalScore: number;
  error: string | null;
  startGame: (mode: GameMode) => Promise<void>;
  submitGuess: (lat: number, lng: number, timeSeconds: number) => Promise<void>;
  goToNextRound: () => Promise<void>;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [currentResult, setCurrentResult] = useState<GuessResult | null>(null);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startGame = useCallback(async (mode: GameMode) => {
    try {
      setPhase('loading');
      setError(null);
      setRoundHistory([]);
      setTotalScore(0);
      setCurrentResult(null);

      // Use a simple anonymous user id for now
      const userId = 'anonymous';
      const state = await api.createGame(userId, mode);
      setGameState(state);
      setPhase('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setPhase('loading');
    }
  }, []);

  const submitGuess = useCallback(
    async (lat: number, lng: number, timeSeconds: number) => {
      if (!gameState) return;

      try {
        setError(null);
        const result = await api.submitGuess(gameState.game.id, lat, lng, timeSeconds);
        setCurrentResult(result);
        setTotalScore((prev) => prev + result.score.total);
        setRoundHistory((prev) => [
          ...prev,
          {
            roundNumber: gameState.current_round,
            guessResult: result,
            timeSeconds,
          },
        ]);

        // Check if this was the last round
        if (gameState.current_round >= gameState.total_rounds) {
          setPhase('finished');
        } else {
          setPhase('result');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit guess');
      }
    },
    [gameState]
  );

  const goToNextRound = useCallback(async () => {
    if (!gameState) return;

    try {
      setError(null);
      const state = await api.nextRound(gameState.game.id);
      setGameState(state);
      setCurrentResult(null);
      setPhase('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go to next round');
    }
  }, [gameState]);

  return {
    gameState,
    phase,
    currentResult,
    roundHistory,
    totalScore,
    error,
    startGame,
    submitGuess,
    goToNextRound,
  };
}
