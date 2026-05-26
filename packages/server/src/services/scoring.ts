import { Score } from '@geoguess/shared';

const MAX_SCORE = 5000;
const EARTH_RADIUS_KM = 6371;

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

export function calculateScore(
  distanceKm: number,
  timeSeconds: number,
  comboCount: number
): Score {
  // Distance penalty: exponential decay based on distance
  // At 0 km: 0 penalty, at 1000 km: ~3500 penalty, at 5000+ km: ~4900 penalty
  const distancePenalty = Math.round(
    MAX_SCORE * (1 - Math.exp(-distanceKm / 1000))
  );

  const basePoints = MAX_SCORE - distancePenalty;

  // Time bonus: up to 500 points for fast guesses (under 10 seconds)
  let timeBonus = 0;
  if (timeSeconds < 10) {
    timeBonus = Math.round(500 * (1 - timeSeconds / 10));
  } else if (timeSeconds < 30) {
    timeBonus = Math.round(200 * (1 - (timeSeconds - 10) / 20));
  }

  // Combo multiplier: 1x base, increases by 0.1 for each consecutive good guess
  const comboMultiplier = 1 + Math.min(comboCount * 0.1, 0.5);

  const total = Math.round((basePoints + timeBonus) * comboMultiplier);

  return {
    base_points: basePoints,
    distance_penalty: distancePenalty,
    time_bonus: timeBonus,
    combo_multiplier: comboMultiplier,
    total: Math.max(0, total),
  };
}
