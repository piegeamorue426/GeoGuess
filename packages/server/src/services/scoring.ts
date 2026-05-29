import { Score } from '@geoguess/shared';

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
  // Base score: linear decay from 5000 at 0km to 0 at 20000km
  const basePoints = Math.round(5000 * Math.max(0, 1 - distanceKm / 20000));

  // Time bonus: up to 500 points, loses 5 per second
  const timeBonus = Math.max(0, Math.round(500 - timeSeconds * 5));

  // Combo multiplier: consecutive guesses under 500km add 10% each
  const comboMultiplier = 1 + comboCount * 0.1;

  const total = Math.round((basePoints + timeBonus) * comboMultiplier);

  // distance_penalty is for display purposes
  const distancePenalty = 5000 - basePoints;

  return {
    base_points: basePoints,
    distance_penalty: distancePenalty,
    time_bonus: timeBonus,
    combo_multiplier: comboMultiplier,
    total: Math.max(0, total),
  };
}

export function calculateXP(totalGameScore: number): number {
  return Math.round(totalGameScore / 10);
}

export function calculateLevel(totalXP: number): number {
  return Math.floor(totalXP / 1000) + 1;
}

export function calculateCountryStreakScore(correct: boolean, streak: number): number {
  if (!correct) return 0;
  return Math.round(1000 * (1 + streak * 0.1));
}
