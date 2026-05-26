'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Globe,
  Infinity,
  Zap,
  Lock,
  Eye,
  Flag,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const gameModes = [
  {
    id: 'classic',
    name: 'Classic',
    description: '5 rounds, no time limit. Explore and guess at your own pace.',
    icon: Globe,
    badge: 'Popular',
    badgeVariant: 'primary' as const,
  },
  {
    id: 'classic',
    name: 'Infinite',
    description: 'Keep playing until you want to stop. No round limit.',
    icon: Infinity,
    badge: 'Casual',
    badgeVariant: 'neutral' as const,
  },
  {
    id: 'timed',
    name: 'Hardcore',
    description: '30 seconds per round. Quick thinking required!',
    icon: Zap,
    badge: 'Hard',
    badgeVariant: 'danger' as const,
  },
  {
    id: 'challenge',
    name: 'No Move',
    description: 'Cannot move from spawn point. Pure observation skills.',
    icon: Lock,
    badge: 'Challenge',
    badgeVariant: 'warning' as const,
  },
  {
    id: 'challenge',
    name: 'No Pan',
    description: 'Cannot rotate the camera. Use what you can see.',
    icon: Eye,
    badge: 'Challenge',
    badgeVariant: 'warning' as const,
  },
  {
    id: 'streak',
    name: 'Country Streak',
    description: 'Guess the country correctly. How long can you streak?',
    icon: Flag,
    badge: 'Streak',
    badgeVariant: 'secondary' as const,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-3 drop-shadow-[0_0_30px_rgba(0,255,136,0.3)]">
          <span className="text-primary">Geo</span>Guess
        </h1>
        <p className="text-lg text-gray-400 max-w-md mx-auto">
          Explore the world, one guess at a time. Test your geography knowledge
          across multiple game modes.
        </p>
      </motion.div>

      {/* Game mode grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {gameModes.map((mode, index) => (
          <motion.div key={index} variants={item}>
            <Link href={`/game/${mode.id}`}>
              <Card hover className="h-full">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3">
                    <mode.icon className="w-8 h-8 text-primary" />
                    <Badge variant={mode.badgeVariant}>{mode.badge}</Badge>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{mode.name}</h3>
                  <p className="text-sm text-gray-400 flex-1">{mode.description}</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12"
      >
        <Link
          href="/stats"
          className="text-gray-400 hover:text-primary transition-colors text-sm"
        >
          View Statistics
        </Link>
      </motion.div>
    </main>
  );
}
