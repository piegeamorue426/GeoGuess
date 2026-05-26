'use client';

import { clsx } from 'clsx';
import { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary/20 text-primary border-primary/30',
  secondary: 'bg-secondary/20 text-purple-300 border-secondary/30',
  danger: 'bg-danger/20 text-red-300 border-danger/30',
  warning: 'bg-warning/20 text-yellow-300 border-warning/30',
  neutral: 'bg-white/10 text-gray-300 border-white/20',
};

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
