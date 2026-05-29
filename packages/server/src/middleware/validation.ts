import { Request, Response, NextFunction } from 'express';
import { GameMode } from '@geoguess/shared';

const VALID_MODES: GameMode[] = ['classic', 'infinite', 'hardcore', 'no_move', 'no_pan', 'country_streak'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateCreateGame(req: Request, res: Response, next: NextFunction): void {
  const { mode } = req.body;

  if (mode && !VALID_MODES.includes(mode)) {
    res.status(400).json({ error: `Invalid mode. Must be one of: ${VALID_MODES.join(', ')}` });
    return;
  }

  next();
}

export function validateGuess(req: Request, res: Response, next: NextFunction): void {
  const { lat, lng, country } = req.body;

  // For country_streak mode, country is accepted instead of lat/lng
  if (country !== undefined) {
    if (typeof country !== 'string' || country.trim().length === 0) {
      res.status(400).json({ error: 'country must be a non-empty string' });
      return;
    }
    next();
    return;
  }

  if (lat === undefined || lng === undefined) {
    res.status(400).json({ error: 'lat and lng are required' });
    return;
  }

  if (typeof lat !== 'number' || lat < -90 || lat > 90) {
    res.status(400).json({ error: 'lat must be a number between -90 and 90' });
    return;
  }

  if (typeof lng !== 'number' || lng < -180 || lng > 180) {
    res.status(400).json({ error: 'lng must be a number between -180 and 180' });
    return;
  }

  next();
}

export function validateGameId(req: Request, res: Response, next: NextFunction): void {
  const { id } = req.params;

  if (!id || !UUID_REGEX.test(id)) {
    res.status(400).json({ error: 'Invalid game ID format' });
    return;
  }

  next();
}
