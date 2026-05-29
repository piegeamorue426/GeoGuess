export interface User {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  created_at: string;
}

export interface Location {
  id: string;
  lat: number;
  lng: number;
  country: string;
  city: string;
  region: string;
  difficulty: number;
  description: string;
  panorama_url: string;
}

export type GameMode = 'classic' | 'infinite' | 'hardcore' | 'no_move' | 'no_pan' | 'country_streak';

export type GameStatus = 'active' | 'completed' | 'abandoned';

export interface ModeRestrictions {
  noMove: boolean;
  noPan: boolean;
  timeLimit: number | null;
}

export interface Game {
  id: string;
  user_id: string;
  mode: GameMode;
  status: GameStatus;
  total_score: number;
  created_at: string;
  completed_at: string | null;
}

export interface Round {
  id: string;
  game_id: string;
  location_id: string;
  round_number: number;
  guess_lat: number | null;
  guess_lng: number | null;
  guess_country: string | null;
  distance_km: number | null;
  score: number | null;
  time_seconds: number | null;
  created_at: string;
}

export interface Score {
  base_points: number;
  distance_penalty: number;
  time_bonus: number;
  combo_multiplier: number;
  total: number;
}

export interface GameState {
  game: Game;
  rounds: Round[];
  current_round: number;
  current_location: Location | null;
  total_rounds: number;
  restrictions: ModeRestrictions;
  streak?: number;
  xp_earned?: number;
}

export interface GuessResult {
  round: Round;
  score: Score;
  actual_location: Location;
  distance_km: number;
  streak?: number;
  correct_country?: boolean;
}

export interface Achievement {
  id: string;
  user_id: string;
  type: string;
  unlocked_at: string;
}

export interface Stats {
  id: string;
  user_id: string;
  games_played: number;
  total_score: number;
  avg_distance: number;
  best_score: number;
  country_streaks: number;
  updated_at: string;
}

export interface LeaderboardEntry {
  username: string;
  total_score: number;
  games_played: number;
  avg_distance: number;
}
