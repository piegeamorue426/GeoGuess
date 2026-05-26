import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { calculateDistance, calculateScore } from './scoring';
import { Game, GameMode, GameState, GuessResult, Location, Round } from '@geoguess/shared';

const ROUNDS_PER_GAME = 5;

export function createGame(userId: string, mode: GameMode): Game {
  const db = getDatabase();
  const id = uuidv4();

  // Ensure user exists (create guest if needed)
  const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!existingUser) {
    db.prepare(
      'INSERT INTO users (id, username, email) VALUES (?, ?, ?)'
    ).run(userId, `player_${userId.slice(0, 8)}`, `${userId.slice(0, 8)}@guest.local`);

    db.prepare(
      'INSERT INTO stats (id, user_id) VALUES (?, ?)'
    ).run(uuidv4(), userId);
  }

  db.prepare(
    'INSERT INTO games (id, user_id, mode, status, total_score) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, mode, 'active', 0);

  // Pre-select locations for this game
  const locations = getRandomLocations(ROUNDS_PER_GAME, mode);
  for (let i = 0; i < locations.length; i++) {
    const roundId = uuidv4();
    db.prepare(
      'INSERT INTO rounds (id, game_id, location_id, round_number) VALUES (?, ?, ?, ?)'
    ).run(roundId, id, locations[i].id, i + 1);
  }

  return {
    id,
    user_id: userId,
    mode,
    status: 'active',
    total_score: 0,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
}

export function getGameState(gameId: string): GameState | null {
  const db = getDatabase();

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as Game | undefined;
  if (!game) return null;

  const rounds = db.prepare(
    'SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number'
  ).all(gameId) as Round[];

  // Find current round (first round without a guess)
  const currentRoundIndex = rounds.findIndex((r) => r.score === null);
  const currentRound = currentRoundIndex === -1 ? rounds.length : currentRoundIndex + 1;

  let currentLocation: Location | null = null;
  if (currentRoundIndex !== -1) {
    currentLocation = db.prepare(
      'SELECT * FROM locations WHERE id = ?'
    ).get(rounds[currentRoundIndex].location_id) as Location | undefined || null;
  }

  return {
    game,
    rounds,
    current_round: currentRound,
    current_location: currentLocation,
    total_rounds: ROUNDS_PER_GAME,
  };
}

export function submitGuess(
  gameId: string,
  guessLat: number,
  guessLng: number,
  timeSeconds: number
): GuessResult | null {
  const db = getDatabase();

  const rounds = db.prepare(
    'SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number'
  ).all(gameId) as Round[];

  const currentRound = rounds.find((r) => r.score === null);
  if (!currentRound) return null;

  const location = db.prepare(
    'SELECT * FROM locations WHERE id = ?'
  ).get(currentRound.location_id) as Location | undefined;
  if (!location) return null;

  const distance = calculateDistance(guessLat, guessLng, location.lat, location.lng);

  // Calculate combo (consecutive guesses under 1000km)
  const previousRounds = rounds.filter((r) => r.score !== null && r.round_number < currentRound.round_number);
  let comboCount = 0;
  for (let i = previousRounds.length - 1; i >= 0; i--) {
    if (previousRounds[i].distance_km !== null && previousRounds[i].distance_km! < 1000) {
      comboCount++;
    } else {
      break;
    }
  }

  const score = calculateScore(distance, timeSeconds, comboCount);

  db.prepare(
    'UPDATE rounds SET guess_lat = ?, guess_lng = ?, distance_km = ?, score = ?, time_seconds = ? WHERE id = ?'
  ).run(guessLat, guessLng, Math.round(distance * 100) / 100, score.total, timeSeconds, currentRound.id);

  // Update game total score
  db.prepare(
    'UPDATE games SET total_score = total_score + ? WHERE id = ?'
  ).run(score.total, gameId);

  // Check if game is complete
  const remaining = rounds.filter((r) => r.score === null && r.id !== currentRound.id);
  if (remaining.length === 0) {
    db.prepare(
      "UPDATE games SET status = 'completed', completed_at = datetime('now') WHERE id = ?"
    ).run(gameId);

    // Update user stats
    const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as Game;
    updateStats(game.user_id);
  }

  return {
    round: {
      ...currentRound,
      guess_lat: guessLat,
      guess_lng: guessLng,
      distance_km: Math.round(distance * 100) / 100,
      score: score.total,
      time_seconds: timeSeconds,
    },
    score,
    actual_location: location,
    distance_km: Math.round(distance * 100) / 100,
  };
}

function getRandomLocations(count: number, mode: GameMode): Location[] {
  const db = getDatabase();

  let query = 'SELECT * FROM locations';
  const params: number[] = [];

  if (mode === 'challenge') {
    query += ' WHERE difficulty >= ?';
    params.push(4);
  }

  query += ' ORDER BY RANDOM() LIMIT ?';
  params.push(count);

  return db.prepare(query).all(...params) as Location[];
}

function updateStats(userId: string): void {
  const db = getDatabase();

  const stats = db.prepare(`
    SELECT 
      COUNT(*) as games_played,
      COALESCE(SUM(total_score), 0) as total_score,
      COALESCE(AVG(r.distance_km), 0) as avg_distance,
      COALESCE(MAX(total_score), 0) as best_score
    FROM games g
    LEFT JOIN rounds r ON r.game_id = g.id
    WHERE g.user_id = ? AND g.status = 'completed'
  `).get(userId) as { games_played: number; total_score: number; avg_distance: number; best_score: number };

  db.prepare(`
    UPDATE stats SET 
      games_played = ?,
      total_score = ?,
      avg_distance = ?,
      best_score = ?,
      updated_at = datetime('now')
    WHERE user_id = ?
  `).run(stats.games_played, stats.total_score, Math.round(stats.avg_distance * 100) / 100, stats.best_score, userId);
}
