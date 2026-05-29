CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  difficulty INTEGER NOT NULL DEFAULT 3,
  description TEXT NOT NULL DEFAULT '',
  panorama_url TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'classic',
  status TEXT NOT NULL DEFAULT 'active',
  total_score INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS rounds (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  location_id TEXT NOT NULL,
  round_number INTEGER NOT NULL,
  guess_lat REAL,
  guess_lng REAL,
  guess_country TEXT,
  distance_km REAL,
  score INTEGER,
  time_seconds INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (location_id) REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  games_played INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  avg_distance REAL NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  country_streaks INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
