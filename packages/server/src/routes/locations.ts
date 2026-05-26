import { Router, Request, Response } from 'express';
import { getDatabase } from '../db/database';
import { Location } from '@geoguess/shared';

export const locationsRouter = Router();

// GET /api/locations/random - Get a random location with optional filtering
locationsRouter.get('/random', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { mode, difficulty } = req.query;

    let query = 'SELECT * FROM locations';
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (difficulty) {
      const diff = parseInt(difficulty as string, 10);
      if (diff >= 1 && diff <= 5) {
        conditions.push('difficulty = ?');
        params.push(diff);
      }
    }

    if (mode === 'challenge') {
      conditions.push('difficulty >= 4');
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    const location = db.prepare(query).get(...params) as Location | undefined;

    if (!location) {
      res.status(404).json({ error: 'No locations found matching criteria' });
      return;
    }

    res.json(location);
  } catch (error) {
    console.error('Error getting random location:', error);
    res.status(500).json({ error: 'Failed to get random location' });
  }
});
