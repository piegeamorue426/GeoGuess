import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Set up test database before importing modules that use it
const TEST_DB_PATH = path.join(__dirname, '../../test-data/test.db');

beforeAll(() => {
  const dir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // Remove old test db if it exists
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
  process.env.DATABASE_PATH = TEST_DB_PATH;
});

afterAll(() => {
  const { closeDatabase } = require('../db/database');
  closeDatabase();
  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }
});

describe('gameManager', () => {
  let createGame: typeof import('../services/gameManager').createGame;
  let getGameState: typeof import('../services/gameManager').getGameState;
  let submitGuess: typeof import('../services/gameManager').submitGuess;
  let advanceToNextRound: typeof import('../services/gameManager').advanceToNextRound;
  let getDatabase: typeof import('../db/database').getDatabase;

  beforeAll(() => {
    // Require after env is set
    const gameManager = require('../services/gameManager');
    createGame = gameManager.createGame;
    getGameState = gameManager.getGameState;
    submitGuess = gameManager.submitGuess;
    advanceToNextRound = gameManager.advanceToNextRound;
    getDatabase = require('../db/database').getDatabase;

    // Seed some test locations
    const db = getDatabase();
    const locations = [
      { id: 'loc-1', lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris', region: 'Ile-de-France', difficulty: 2 },
      { id: 'loc-2', lat: 40.7128, lng: -74.006, country: 'United States', city: 'New York', region: 'New York', difficulty: 1 },
      { id: 'loc-3', lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo', region: 'Kanto', difficulty: 3 },
      { id: 'loc-4', lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney', region: 'NSW', difficulty: 2 },
      { id: 'loc-5', lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London', region: 'England', difficulty: 1 },
      { id: 'loc-6', lat: 55.7558, lng: 37.6173, country: 'Russia', city: 'Moscow', region: 'Moscow', difficulty: 3 },
      { id: 'loc-7', lat: -22.9068, lng: -43.1729, country: 'Brazil', city: 'Rio de Janeiro', region: 'Rio de Janeiro', difficulty: 2 },
    ];

    for (const loc of locations) {
      db.prepare(
        'INSERT OR IGNORE INTO locations (id, lat, lng, country, city, region, difficulty, description, panorama_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(loc.id, loc.lat, loc.lng, loc.country, loc.city, loc.region, loc.difficulty, '', '');
    }
  });

  describe('createGame', () => {
    it('creates a classic game with correct mode and active status', () => {
      const game = createGame('test-user-1', 'classic');
      expect(game.mode).toBe('classic');
      expect(game.status).toBe('active');
      expect(game.total_score).toBe(0);
      expect(game.user_id).toBe('test-user-1');
    });

    it('creates an infinite game', () => {
      const game = createGame('test-user-2', 'infinite');
      expect(game.mode).toBe('infinite');
      expect(game.status).toBe('active');
    });

    it('creates a hardcore game', () => {
      const game = createGame('test-user-3', 'hardcore');
      expect(game.mode).toBe('hardcore');
    });

    it('creates a country_streak game', () => {
      const game = createGame('test-user-4', 'country_streak');
      expect(game.mode).toBe('country_streak');
    });
  });

  describe('getGameState', () => {
    it('returns null for non-existent game', () => {
      const state = getGameState('non-existent-id');
      expect(state).toBeNull();
    });

    it('returns correct state for classic game', () => {
      const game = createGame('test-user-state', 'classic');
      const state = getGameState(game.id);
      expect(state).not.toBeNull();
      expect(state!.game.id).toBe(game.id);
      expect(state!.total_rounds).toBe(5);
      expect(state!.current_round).toBe(1);
      expect(state!.current_location).not.toBeNull();
      expect(state!.restrictions.noMove).toBe(false);
      expect(state!.restrictions.noPan).toBe(false);
      expect(state!.restrictions.timeLimit).toBeNull();
    });

    it('returns correct restrictions for hardcore mode', () => {
      const game = createGame('test-user-hardcore', 'hardcore');
      const state = getGameState(game.id);
      expect(state!.restrictions.noMove).toBe(true);
      expect(state!.restrictions.noPan).toBe(true);
      expect(state!.restrictions.timeLimit).toBe(30);
    });

    it('returns correct restrictions for no_move mode', () => {
      const game = createGame('test-user-nomove', 'no_move');
      const state = getGameState(game.id);
      expect(state!.restrictions.noMove).toBe(true);
      expect(state!.restrictions.noPan).toBe(false);
    });

    it('returns correct restrictions for no_pan mode', () => {
      const game = createGame('test-user-nopan', 'no_pan');
      const state = getGameState(game.id);
      expect(state!.restrictions.noMove).toBe(false);
      expect(state!.restrictions.noPan).toBe(true);
    });
  });

  describe('round progression', () => {
    it('increments round_number after submitting a guess', () => {
      const game = createGame('test-user-progress', 'classic');
      const state1 = getGameState(game.id);
      expect(state1!.current_round).toBe(1);

      // Submit guess for round 1
      submitGuess(game.id, 48.0, 2.0, 10);
      const state2 = getGameState(game.id);
      expect(state2!.current_round).toBe(2);
    });

    it('classic mode limits to 5 rounds', () => {
      const game = createGame('test-user-limit', 'classic');
      const state = getGameState(game.id);
      expect(state!.total_rounds).toBe(5);
      expect(state!.rounds.length).toBe(5);
    });

    it('infinite mode has no fixed round limit', () => {
      const game = createGame('test-user-infinite', 'infinite');
      const state = getGameState(game.id);
      // Infinite starts with 1 round, total_rounds equals current count
      expect(state!.game.mode).toBe('infinite');
      // Submit guess and advance
      submitGuess(game.id, 40.0, -74.0, 5);
      const advanced = advanceToNextRound(game.id);
      expect(advanced).not.toBeNull();
      expect(advanced!.rounds.length).toBe(2);
    });

    it('game completion updates status to completed', () => {
      const game = createGame('test-user-complete', 'classic');
      // Submit all 5 rounds
      for (let i = 0; i < 5; i++) {
        submitGuess(game.id, 48.0, 2.0, 10);
      }
      const state = getGameState(game.id);
      expect(state!.game.status).toBe('completed');
    });
  });

  describe('country_streak mode', () => {
    it('ends game on incorrect country guess', () => {
      const game = createGame('test-user-streak-end', 'country_streak');
      const state = getGameState(game.id);
      const location = state!.current_location!;

      // Submit wrong country
      const result = submitGuess(game.id, 0, 0, 5, 'WrongCountry');
      expect(result).not.toBeNull();
      expect(result!.correct_country).toBe(false);

      const endState = getGameState(game.id);
      expect(endState!.game.status).toBe('completed');
    });

    it('continues game on correct country guess', () => {
      const game = createGame('test-user-streak-correct', 'country_streak');
      const state = getGameState(game.id);
      const location = state!.current_location!;

      // Submit correct country
      const result = submitGuess(game.id, 0, 0, 5, location.country);
      expect(result).not.toBeNull();
      expect(result!.correct_country).toBe(true);
      expect(result!.streak).toBe(1);

      const nextState = getGameState(game.id);
      expect(nextState!.game.status).toBe('active');
    });
  });
});
