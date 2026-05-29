'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02, borderColor: 'rgba(0,255,136,0.3)' } : undefined}
      onClick={onClick}
      className={clsx(
        'rounded-xl border border-white/10 bg-surface/80 backdrop-blur-md p-6',
        hover && 'cursor-pointer transition-shadow hover:shadow-[0_0_20px_rgba(0,255,136,0.1)]',
        className
      )}
    >
      {children}
    </motion.div>
  );
}
