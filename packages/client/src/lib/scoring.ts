import { haversineDistance } from './distance';

const MAX_SCORE = 5000;
const MAX_DISTANCE_KM = 20000;

/**
 * Calculate score for a guess (mirrors server logic).
 * Score = 5000 * (1 - distance/20000), with time bonus.
 */
export function calculateScore(
  guessLat: number,
  guessLng: number,
  actualLat: number,
  actualLng: number,
  timeSeconds?: number
): { base: number; timeBonus: number; total: number; distance: number } {
  const distance = haversineDistance(guessLat, guessLng, actualLat, actualLng);

  const base = Math.max(0, Math.round(MAX_SCORE * (1 - distance / MAX_DISTANCE_KM)));

  // Time bonus: up to 500 extra points if guessed within 10 seconds
  let timeBonus = 0;
  if (timeSeconds !== undefined && timeSeconds <= 30) {
    timeBonus = Math.round(500 * Math.max(0, (30 - timeSeconds) / 30));
  }

  const total = base + timeBonus;

  return { base, timeBonus, total, distance };
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km < 100) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km).toLocaleString()} km`;
}
