import { getDatabase } from '../db/database';
import { GameMode, Location } from '@geoguess/shared';

export function pickRandomLocation(
  mode: GameMode,
  difficulty?: number,
  excludeIds: string[] = []
): Location {
  const db = getDatabase();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (difficulty !== undefined) {
    conditions.push('difficulty = ?');
    params.push(difficulty);
  }

  if (excludeIds.length > 0) {
    const placeholders = excludeIds.map(() => '?').join(',');
    conditions.push(`id NOT IN (${placeholders})`);
    params.push(...excludeIds);
  }

  let query = 'SELECT * FROM locations';
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  query += ' ORDER BY RANDOM() LIMIT 1';

  const location = db.prepare(query).get(...params) as Location | undefined;

  if (!location) {
    // Fallback: if all locations are excluded, return any random location
    const fallback = db.prepare('SELECT * FROM locations ORDER BY RANDOM() LIMIT 1').get() as Location | undefined;
    if (!fallback) {
      throw new Error('No locations found in database. Please seed the database first.');
    }
    return fallback;
  }

  return location;
}

export function getUsedLocationIds(gameId: string): string[] {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT location_id FROM rounds WHERE game_id = ?'
  ).all(gameId) as { location_id: string }[];
  return rows.map((r) => r.location_id);
}
