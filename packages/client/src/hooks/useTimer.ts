'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTimerOptions {
  countdown?: boolean;
  initialTime?: number; // seconds for countdown
  onTimeUp?: () => void;
}

interface UseTimerReturn {
  time: number; // elapsed seconds (or remaining in countdown mode)
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  formatted: string;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { countdown = false, initialTime = 30, onTimeUp } = options;
  const [time, setTime] = useState(countdown ? initialTime : 0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTime((prev) => {
        if (countdown) {
          const next = prev - 1;
          if (next <= 0) {
            setIsRunning(false);
            onTimeUpRef.current?.();
            return 0;
          }
          return next;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, countdown]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(countdown ? initialTime : 0);
  }, [countdown, initialTime]);

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { time, isRunning, start, stop, reset, formatted };
}
