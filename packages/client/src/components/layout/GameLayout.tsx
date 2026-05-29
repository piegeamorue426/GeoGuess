'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GameLayoutProps {
  children: ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-background overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-surface opacity-50" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </motion.div>
  );
}
