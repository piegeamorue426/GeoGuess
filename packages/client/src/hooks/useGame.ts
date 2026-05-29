'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, GuessResult, GameMode, ModeRestrictions } from '@geoguess/shared';
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
  restrictions: ModeRestrictions;
  streak: number;
  isCountryStreak: boolean;
  isInfinite: boolean;
  timerExpired: boolean;
  startGame: (mode: GameMode) => Promise<void>;
  submitGuess: (lat: number, lng: number, timeSeconds: number) => Promise<void>;
  submitCountryGuess: (country: string, timeSeconds: number) => Promise<void>;
  goToNextRound: () => Promise<void>;
  quitGame: () => void;
}

const DEFAULT_RESTRICTIONS: ModeRestrictions = {
  noMove: false,
  noPan: false,
  timeLimit: null,
};

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<GamePhase>('loading');
  const [currentResult, setCurrentResult] = useState<GuessResult | null>(null);
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const restrictions = gameState?.restrictions || DEFAULT_RESTRICTIONS;
  const isCountryStreak = gameState?.game.mode === 'country_streak';
  const isInfinite = gameState?.game.mode === 'infinite';

  // Handle hardcore timer
  useEffect(() => {
    if (phase === 'playing' && restrictions.timeLimit !== null) {
      setTimerExpired(false);
      timerRef.current = setTimeout(() => {
        setTimerExpired(true);
      }, restrictions.timeLimit * 1000);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase, restrictions.timeLimit, gameState?.current_round]);

  const startGame = useCallback(async (mode: GameMode) => {
    try {
      setPhase('loading');
      setError(null);
      setRoundHistory([]);
      setTotalScore(0);
      setCurrentResult(null);
      setStreak(0);
      setTimerExpired(false);

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

        if (result.streak !== undefined) {
          setStreak(result.streak);
        }

        // Check if game is finished
        const updatedState = await api.getGameState(gameState.game.id);
        setGameState(updatedState);

        if (updatedState.game.status === 'completed') {
          setPhase('finished');
        } else if (gameState.current_round >= gameState.total_rounds && !isInfinite) {
          setPhase('finished');
        } else {
          setPhase('result');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to submit guess');
      }
    },
    [gameState, isInfinite]
  );

  const submitCountryGuess = useCallback(
    async (country: string, timeSeconds: number) => {
      if (!gameState) return;

      try {
        setError(null);
        const result = await api.submitCountryGuess(gameState.game.id, country, timeSeconds);
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

        if (result.streak !== undefined) {
          setStreak(result.streak);
        }

        // Check if game is finished
        const updatedState = await api.getGameState(gameState.game.id);
        setGameState(updatedState);

        if (updatedState.game.status === 'completed') {
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
      setTimerExpired(false);
      const state = await api.nextRound(gameState.game.id);
      setGameState(state);
      setCurrentResult(null);
      setPhase('playing');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to go to next round');
    }
  }, [gameState]);

  const quitGame = useCallback(() => {
    setPhase('finished');
  }, []);

  return {
    gameState,
    phase,
    currentResult,
    roundHistory,
    totalScore,
    error,
    restrictions,
    streak,
    isCountryStreak,
    isInfinite,
    timerExpired,
    startGame,
    submitGuess,
    submitCountryGuess,
    goToNextRound,
    quitGame,
  };
}
