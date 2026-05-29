import { calculateScore, calculateXP, calculateLevel, calculateCountryStreakScore, calculateDistance } from '../services/scoring';

describe('calculateScore', () => {
  it('returns 5000 + time_bonus for 0 distance', () => {
    const result = calculateScore(0, 0, 0);
    // base = 5000, time_bonus = 500 - 0 = 500, combo = 1
    expect(result.base_points).toBe(5000);
    expect(result.time_bonus).toBe(500);
    expect(result.total).toBe(5500);
  });

  it('returns approximately 0 for 20000km distance', () => {
    const result = calculateScore(20000, 100, 0);
    // base = 5000 * max(0, 1 - 20000/20000) = 0
    expect(result.base_points).toBe(0);
    expect(result.total).toBe(0);
  });

  it('returns 0 time_bonus when time >= 100 seconds', () => {
    const result = calculateScore(0, 100, 0);
    // time_bonus = max(0, 500 - 100*5) = max(0, 0) = 0
    expect(result.time_bonus).toBe(0);
  });

  it('returns 0 time_bonus when time > 100 seconds', () => {
    const result = calculateScore(0, 150, 0);
    expect(result.time_bonus).toBe(0);
  });

  it('calculates time_bonus correctly for fast guesses', () => {
    const result = calculateScore(0, 10, 0);
    // time_bonus = max(0, 500 - 10*5) = 450
    expect(result.time_bonus).toBe(450);
  });

  it('applies combo multiplier correctly', () => {
    const noCombo = calculateScore(0, 50, 0);
    const withCombo = calculateScore(0, 50, 2);
    // combo = 2 means multiplier = 1.2
    expect(withCombo.combo_multiplier).toBe(1.2);
    expect(withCombo.total).toBe(Math.round(noCombo.total * 1.2));
  });

  it('increases score by 10% per combo', () => {
    const combo1 = calculateScore(1000, 30, 1);
    const combo2 = calculateScore(1000, 30, 2);
    expect(combo1.combo_multiplier).toBe(1.1);
    expect(combo2.combo_multiplier).toBe(1.2);
  });

  it('caps combo multiplier at 2.0', () => {
    const result = calculateScore(0, 50, 15); // 15 combo would be 2.5 without cap
    expect(result.combo_multiplier).toBe(2.0);
  });

  it('returns half score at 10000km', () => {
    const result = calculateScore(10000, 100, 0);
    // base = 5000 * (1 - 10000/20000) = 5000 * 0.5 = 2500
    expect(result.base_points).toBe(2500);
  });

  it('never returns negative total', () => {
    const result = calculateScore(30000, 200, 0);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });
});

describe('calculateXP', () => {
  it('returns score divided by 10', () => {
    expect(calculateXP(5000)).toBe(500);
    expect(calculateXP(10000)).toBe(1000);
    expect(calculateXP(0)).toBe(0);
  });

  it('rounds the result', () => {
    expect(calculateXP(33)).toBe(3);
    expect(calculateXP(55)).toBe(6);
  });
});

describe('calculateLevel', () => {
  it('returns level 1 at 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns level 1 at 999 XP', () => {
    expect(calculateLevel(999)).toBe(1);
  });

  it('returns level 2 at 1000 XP', () => {
    expect(calculateLevel(1000)).toBe(2);
  });

  it('returns level 3 at 2000 XP', () => {
    expect(calculateLevel(2000)).toBe(3);
  });

  it('returns level 11 at 10000 XP', () => {
    expect(calculateLevel(10000)).toBe(11);
  });
});

describe('calculateCountryStreakScore', () => {
  it('returns 1000 for first correct guess (streak 0)', () => {
    const score = calculateCountryStreakScore(true, 0);
    expect(score).toBe(1000);
  });

  it('returns 0 for incorrect guess', () => {
    const score = calculateCountryStreakScore(false, 5);
    expect(score).toBe(0);
  });

  it('increases by 10% per streak level', () => {
    const streak1 = calculateCountryStreakScore(true, 1);
    expect(streak1).toBe(1100);

    const streak2 = calculateCountryStreakScore(true, 2);
    expect(streak2).toBe(1200);

    const streak5 = calculateCountryStreakScore(true, 5);
    expect(streak5).toBe(1500);
  });
});

describe('calculateDistance', () => {
  it('returns 0 for same point', () => {
    expect(calculateDistance(0, 0, 0, 0)).toBe(0);
  });

  it('calculates approximately correct distance', () => {
    // New York to London is approximately 5570 km
    const dist = calculateDistance(40.7128, -74.006, 51.5074, -0.1278);
    expect(dist).toBeGreaterThan(5500);
    expect(dist).toBeLessThan(5700);
  });
});
