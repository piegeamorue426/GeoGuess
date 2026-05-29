import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { calculateDistance, calculateScore, calculateXP, calculateLevel, calculateCountryStreakScore } from './scoring';
import { pickRandomLocation, getUsedLocationIds } from './locationPicker';
import { Game, GameMode, GameState, GuessResult, Location, ModeRestrictions, Round, Score } from '@geoguess/shared';

interface ModeConfig {
  maxRounds: number | null;
  timeLimit: number | null;
  noMove: boolean;
  noPan: boolean;
  comboThreshold: number;
}

function getModeConfig(mode: GameMode): ModeConfig {
  switch (mode) {
    case 'classic':
      return { maxRounds: 5, timeLimit: null, noMove: false, noPan: false, comboThreshold: 500 };
    case 'infinite':
      return { maxRounds: null, timeLimit: null, noMove: false, noPan: false, comboThreshold: 500 };
    case 'hardcore':
      return { maxRounds: 5, timeLimit: 30, noMove: true, noPan: true, comboThreshold: 500 };
    case 'no_move':
      return { maxRounds: 5, timeLimit: null, noMove: true, noPan: false, comboThreshold: 500 };
    case 'no_pan':
      return { maxRounds: 5, timeLimit: null, noMove: false, noPan: true, comboThreshold: 500 };
    case 'country_streak':
      return { maxRounds: null, timeLimit: null, noMove: false, noPan: false, comboThreshold: 500 };
    default:
      return { maxRounds: 5, timeLimit: null, noMove: false, noPan: false, comboThreshold: 500 };
  }
}

function getModeRestrictions(mode: GameMode): ModeRestrictions {
  const config = getModeConfig(mode);
  return {
    noMove: config.noMove,
    noPan: config.noPan,
    timeLimit: config.timeLimit,
  };
}

export function createGame(userId: string, mode: GameMode): Game {
  const db = getDatabase();
  const id = uuidv4();

  // Ensure user exists (create guest if needed)
  const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!existingUser) {
    db.prepare(
      'INSERT INTO users (id, username, email) VALUES (?, ?, ?)'
    ).run(userId, `player_${userId}`, `${userId}@guest.local`);

    db.prepare(
      'INSERT INTO stats (id, user_id) VALUES (?, ?)'
    ).run(uuidv4(), userId);
  }

  db.prepare(
    'INSERT INTO games (id, user_id, mode, status, total_score) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, mode, 'active', 0);

  const config = getModeConfig(mode);

  // For modes with max rounds, pre-select locations
  // For infinite/country_streak, just pick the first one
  const roundCount = config.maxRounds || 1;
  const locations = getLocationsForGame(roundCount, mode);

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

  const config = getModeConfig(game.mode);

  // Find current round (first round without a score)
  const currentRoundIndex = rounds.findIndex((r) => r.score === null);
  const currentRound = currentRoundIndex === -1 ? rounds.length : currentRoundIndex + 1;

  let currentLocation: Location | null = null;
  if (currentRoundIndex !== -1) {
    currentLocation = db.prepare(
      'SELECT * FROM locations WHERE id = ?'
    ).get(rounds[currentRoundIndex].location_id) as Location | undefined || null;
  }

  const totalRounds = config.maxRounds || rounds.length;

  // Calculate streak for country_streak mode
  let streak = 0;
  if (game.mode === 'country_streak') {
    for (let i = rounds.length - 1; i >= 0; i--) {
      if (rounds[i].score !== null && rounds[i].score! > 0) {
        streak++;
      } else if (rounds[i].score !== null) {
        break;
      }
    }
  }

  return {
    game,
    rounds,
    current_round: currentRound,
    current_location: currentLocation,
    total_rounds: totalRounds,
    restrictions: getModeRestrictions(game.mode),
    streak: game.mode === 'country_streak' ? streak : undefined,
    xp_earned: game.status === 'completed' ? calculateXP(game.total_score) : undefined,
  };
}

export function submitGuess(
  gameId: string,
  guessLat: number,
  guessLng: number,
  timeSeconds: number,
  guessCountry?: string
): GuessResult | null {
  const db = getDatabase();

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as Game | undefined;
  if (!game || game.status !== 'active') return null;

  const config = getModeConfig(game.mode);

  // Hardcore mode: reject guesses after 30 seconds
  if (config.timeLimit !== null && timeSeconds > config.timeLimit) {
    // Auto-penalize: max distance score
    timeSeconds = config.timeLimit;
  }

  const rounds = db.prepare(
    'SELECT * FROM rounds WHERE game_id = ? ORDER BY round_number'
  ).all(gameId) as Round[];

  const currentRound = rounds.find((r) => r.score === null);
  if (!currentRound) return null;

  const location = db.prepare(
    'SELECT * FROM locations WHERE id = ?'
  ).get(currentRound.location_id) as Location | undefined;
  if (!location) return null;

  let scoreTotal: number;
  let distance: number;
  let scoreObj: Score;
  let correctCountry: boolean | undefined;
  let streak: number | undefined;

  if (game.mode === 'country_streak') {
    // Country streak mode: compare country names
    const guessedCountry = (guessCountry || '').trim().toLowerCase();
    const actualCountry = location.country.trim().toLowerCase();
    correctCountry = guessedCountry === actualCountry;

    // Calculate current streak before this guess
    let currentStreak = 0;
    for (let i = rounds.length - 1; i >= 0; i--) {
      if (rounds[i].score !== null && rounds[i].score! > 0) {
        currentStreak++;
      } else if (rounds[i].score !== null) {
        break;
      }
    }

    scoreTotal = calculateCountryStreakScore(correctCountry, currentStreak);
    distance = 0;
    streak = correctCountry ? currentStreak + 1 : 0;

    scoreObj = {
      base_points: scoreTotal,
      distance_penalty: 0,
      time_bonus: 0,
      combo_multiplier: 1,
      total: scoreTotal,
    };

    // Update round with country guess (no coordinates for country streak)
    db.prepare(
      'UPDATE rounds SET guess_lat = ?, guess_lng = ?, guess_country = ?, distance_km = ?, score = ?, time_seconds = ? WHERE id = ?'
    ).run(null, null, guessCountry || '', null, scoreTotal, timeSeconds, currentRound.id);
  } else {
    distance = calculateDistance(guessLat, guessLng, location.lat, location.lng);

    // Calculate combo (consecutive guesses under threshold)
    const previousRounds = rounds.filter((r) => r.score !== null && r.round_number < currentRound.round_number);
    let comboCount = 0;
    for (let i = previousRounds.length - 1; i >= 0; i--) {
      if (previousRounds[i].distance_km !== null && previousRounds[i].distance_km! < config.comboThreshold) {
        comboCount++;
      } else {
        break;
      }
    }

    scoreObj = calculateScore(distance, timeSeconds, comboCount);
    scoreTotal = scoreObj.total;

    db.prepare(
      'UPDATE rounds SET guess_lat = ?, guess_lng = ?, distance_km = ?, score = ?, time_seconds = ? WHERE id = ?'
    ).run(guessLat, guessLng, Math.round(distance * 100) / 100, scoreTotal, timeSeconds, currentRound.id);
  }

  // Update game total score
  db.prepare(
    'UPDATE games SET total_score = total_score + ? WHERE id = ?'
  ).run(scoreTotal, gameId);

  // Check if game is complete
  const shouldComplete = checkGameCompletion(game, rounds, currentRound, config, correctCountry);

  if (shouldComplete) {
    db.prepare(
      "UPDATE games SET status = 'completed', completed_at = datetime('now') WHERE id = ?"
    ).run(gameId);

    // Update user XP
    const updatedGame = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as Game;
    updateUserXP(updatedGame.user_id, updatedGame.total_score);
    updateStats(updatedGame.user_id);
  }

  return {
    round: {
      ...currentRound,
      guess_lat: guessLat,
      guess_lng: guessLng,
      guess_country: guessCountry || null,
      distance_km: Math.round(distance * 100) / 100,
      score: scoreTotal,
      time_seconds: timeSeconds,
    },
    score: scoreObj,
    actual_location: location,
    distance_km: Math.round(distance * 100) / 100,
    streak,
    correct_country: correctCountry,
  };
}

export function advanceToNextRound(gameId: string): GameState | null {
  const db = getDatabase();

  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId) as Game | undefined;
  if (!game || game.status !== 'active') return null;

  const config = getModeConfig(game.mode);

  // For infinite/country_streak modes, create a new round dynamically
  if (config.maxRounds === null) {
    const usedIds = getUsedLocationIds(gameId);
    const location = pickRandomLocation(game.mode, undefined, usedIds);
    const roundNumber = usedIds.length + 1;
    const roundId = uuidv4();
    db.prepare(
      'INSERT INTO rounds (id, game_id, location_id, round_number) VALUES (?, ?, ?, ?)'
    ).run(roundId, gameId, location.id, roundNumber);
  }

  return getGameState(gameId);
}

function checkGameCompletion(
  game: Game,
  rounds: Round[],
  currentRound: Round,
  config: ModeConfig,
  correctCountry?: boolean
): boolean {
  // Country streak ends when guess is wrong
  if (game.mode === 'country_streak' && correctCountry === false) {
    return true;
  }

  // For modes with max rounds, check if all rounds are done
  if (config.maxRounds !== null) {
    const remaining = rounds.filter((r) => r.score === null && r.id !== currentRound.id);
    if (remaining.length === 0) {
      return true;
    }
  }

  return false;
}

function getLocationsForGame(count: number, mode: GameMode): Location[] {
  const locations: Location[] = [];
  const usedIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const loc = pickRandomLocation(mode, undefined, usedIds);
    locations.push(loc);
    usedIds.push(loc.id);
  }

  if (locations.length < count) {
    throw new Error(
      `Not enough locations available: found ${locations.length} but need ${count}`
    );
  }

  return locations;
}

function updateUserXP(userId: string, gameScore: number): void {
  const db = getDatabase();
  const xpEarned = calculateXP(gameScore);

  const user = db.prepare('SELECT xp FROM users WHERE id = ?').get(userId) as { xp: number } | undefined;
  if (!user) return;

  const newXP = user.xp + xpEarned;
  const newLevel = calculateLevel(newXP);

  db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP, newLevel, userId);
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
