import { GameState, GuessResult, Stats, LeaderboardEntry, GameMode, Location } from '@geoguess/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function createGame(userId: string, mode: GameMode): Promise<GameState> {
  return fetchApi<GameState>('/games', {
    method: 'POST',
    body: JSON.stringify({ userId, mode }),
  });
}

export async function getGameState(gameId: string): Promise<GameState> {
  return fetchApi<GameState>(`/games/${gameId}`);
}

export async function submitGuess(
  gameId: string,
  lat: number,
  lng: number,
  timeSeconds: number
): Promise<GuessResult> {
  return fetchApi<GuessResult>(`/games/${gameId}/guess`, {
    method: 'POST',
    body: JSON.stringify({ lat, lng, timeSeconds }),
  });
}

export async function submitCountryGuess(
  gameId: string,
  country: string,
  timeSeconds: number
): Promise<GuessResult> {
  return fetchApi<GuessResult>(`/games/${gameId}/guess`, {
    method: 'POST',
    body: JSON.stringify({ country, timeSeconds }),
  });
}

export async function nextRound(gameId: string): Promise<GameState> {
  return fetchApi<GameState>(`/games/${gameId}/next`, {
    method: 'POST',
  });
}

export async function getGameResults(gameId: string): Promise<{
  game: GameState['game'];
  rounds: GameState['rounds'];
  total_score: number;
}> {
  return fetchApi(`/games/${gameId}/results`);
}

export async function getRandomLocation(mode?: GameMode, difficulty?: number): Promise<Location> {
  const params = new URLSearchParams();
  if (mode) params.set('mode', mode);
  if (difficulty) params.set('difficulty', String(difficulty));
  const query = params.toString();
  return fetchApi<Location>(`/locations/random${query ? '?' + query : ''}`);
}

export async function getPlayerStats(userId: string): Promise<Stats> {
  return fetchApi<Stats>(`/stats/${userId}`);
}

export async function getLeaderboard(limit?: number): Promise<LeaderboardEntry[]> {
  const query = limit ? `?limit=${limit}` : '';
  return fetchApi<LeaderboardEntry[]>(`/stats${query}`);
}

export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return fetchApi('/health');
}
