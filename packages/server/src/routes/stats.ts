import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { Stats, LeaderboardEntry } from '@geoguess/shared';

export const statsRouter = Router();

// GET /api/stats/:userId - Get player stats
statsRouter.get('/:userId', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const stats = db.prepare(
      'SELECT * FROM stats WHERE user_id = ?'
    ).get(req.params.userId) as Stats | undefined;

    if (!stats) {
      res.status(404).json({ error: 'Stats not found for this user' });
      return;
    }

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// GET /api/leaderboard - Get top scores
statsRouter.get('/', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const limit = Math.min(parseInt(req.query.limit as string, 10) || 10, 100);

    const leaderboard = db.prepare(`
      SELECT 
        u.username,
        s.total_score,
        s.games_played,
        s.avg_distance
      FROM stats s
      JOIN users u ON u.id = s.user_id
      WHERE s.games_played > 0
      ORDER BY s.best_score DESC
      LIMIT ?
    `).all(limit) as LeaderboardEntry[];

    res.json(leaderboard);
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});
