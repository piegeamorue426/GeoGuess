import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(__dirname, '../../test-data/test-picker.db');

beforeAll(() => {
  const dir = path.dirname(TEST_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
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

describe('locationPicker', () => {
  let pickRandomLocation: typeof import('../services/locationPicker').pickRandomLocation;
  let getDatabase: typeof import('../db/database').getDatabase;

  beforeAll(() => {
    getDatabase = require('../db/database').getDatabase;
    const locationPicker = require('../services/locationPicker');
    pickRandomLocation = locationPicker.pickRandomLocation;

    // Seed test locations
    const db = getDatabase();
    const locations = [
      { id: 'picker-loc-1', lat: 48.8566, lng: 2.3522, country: 'France', city: 'Paris', difficulty: 2 },
      { id: 'picker-loc-2', lat: 40.7128, lng: -74.006, country: 'United States', city: 'New York', difficulty: 1 },
      { id: 'picker-loc-3', lat: 35.6762, lng: 139.6503, country: 'Japan', city: 'Tokyo', difficulty: 3 },
      { id: 'picker-loc-4', lat: -33.8688, lng: 151.2093, country: 'Australia', city: 'Sydney', difficulty: 4 },
      { id: 'picker-loc-5', lat: 51.5074, lng: -0.1278, country: 'United Kingdom', city: 'London', difficulty: 5 },
    ];

    for (const loc of locations) {
      db.prepare(
        'INSERT OR IGNORE INTO locations (id, lat, lng, country, city, region, difficulty, description, panorama_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).run(loc.id, loc.lat, loc.lng, loc.country, loc.city, '', loc.difficulty, '', '');
    }
  });

  it('returns a valid location object with required fields', () => {
    const location = pickRandomLocation('classic');
    expect(location).toBeDefined();
    expect(location.id).toBeDefined();
    expect(location.lat).toBeDefined();
    expect(location.lng).toBeDefined();
    expect(location.country).toBeDefined();
    expect(typeof location.lat).toBe('number');
    expect(typeof location.lng).toBe('number');
  });

  it('excludes specified IDs', () => {
    const excludeIds = ['picker-loc-1', 'picker-loc-2', 'picker-loc-3', 'picker-loc-4'];
    const location = pickRandomLocation('classic', undefined, excludeIds);
    expect(location).toBeDefined();
    expect(excludeIds).not.toContain(location.id);
  });

  it('handles edge case when all locations are excluded (returns any location)', () => {
    const allIds = ['picker-loc-1', 'picker-loc-2', 'picker-loc-3', 'picker-loc-4', 'picker-loc-5'];
    const location = pickRandomLocation('classic', undefined, allIds);
    // Should still return something (fallback behavior)
    expect(location).toBeDefined();
    expect(location.id).toBeDefined();
  });

  it('filters by difficulty when specified', () => {
    const location = pickRandomLocation('classic', 3);
    expect(location).toBeDefined();
    expect(location.difficulty).toBe(3);
  });

  it('returns different locations on multiple calls (randomness)', () => {
    const results = new Set<string>();
    // Call multiple times to verify randomness
    for (let i = 0; i < 20; i++) {
      const loc = pickRandomLocation('classic');
      results.add(loc.id);
    }
    // With 5 locations, after 20 attempts we should get more than 1 unique
    expect(results.size).toBeGreaterThan(1);
  });
});
