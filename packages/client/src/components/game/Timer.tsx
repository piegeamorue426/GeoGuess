'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface TimerProps {
  formatted: string;
  isLow?: boolean; // below 10s in timed modes
}

export function Timer({ formatted, isLow = false }: TimerProps) {
  const [minutes, seconds] = formatted.split(':');

  return (
    <div
      className={clsx(
        'font-mono text-2xl font-bold tracking-wider flex items-center gap-0.5',
        isLow ? 'text-danger' : 'text-white'
      )}
    >
      <AnimatePresence mode="popLayout">
        <motion.span
          key={minutes}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {minutes}
        </motion.span>
      </AnimatePresence>
      <span className={clsx(isLow && 'animate-pulse')}>:</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={seconds}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {seconds}
        </motion.span>
      </AnimatePresence>
      {isLow && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-danger ml-2"
        />
      )}
    </div>
  );
}
