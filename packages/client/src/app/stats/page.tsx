'use client';

import { motion } from 'framer-motion';
import { BarChart3, Target, MapPin, Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const statItems = [
  {
    label: 'Games Played',
    value: '0',
    icon: BarChart3,
    color: 'text-accent',
    bg: 'bg-accent/20',
  },
  {
    label: 'Best Score',
    value: '0',
    icon: Trophy,
    color: 'text-primary',
    bg: 'bg-primary/20',
  },
  {
    label: 'Avg Distance',
    value: '- km',
    icon: MapPin,
    color: 'text-danger',
    bg: 'bg-danger/20',
  },
  {
    label: 'Total XP',
    value: '0',
    icon: Target,
    color: 'text-warning',
    bg: 'bg-warning/20',
  },
];

export default function StatsPage() {
  return (
    <main className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft size={16} />
            Back
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-white">Statistics</h1>
        <p className="text-gray-400 mt-2">Track your geography knowledge progress</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mb-12"
      >
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent games section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Recent Games</h2>
        <Card>
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No games played yet</p>
            <p className="text-sm text-gray-500 mt-1">Start a game to see your history here</p>
            <Link href="/" className="inline-block mt-4">
              <Button variant="primary" size="sm">
                Play Now
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </main>
  );
}
