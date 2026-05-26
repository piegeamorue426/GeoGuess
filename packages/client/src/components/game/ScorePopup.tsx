'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ScorePopupProps {
  score: number | null;
  show: boolean;
}

export function ScorePopup({ score, show }: ScorePopupProps) {
  return (
    <AnimatePresence>
      {show && score !== null && (
        <motion.div
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -60, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="text-4xl font-bold text-primary drop-shadow-[0_0_15px_rgba(0,255,136,0.6)]">
            +{score}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
