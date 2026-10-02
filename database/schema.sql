CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  city TEXT,
  college TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, sport)
);

CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  latitude NUMERIC(9, 6),
  longitude NUMERIC(9, 6),
  scheduled_at TIMESTAMPTZ NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')),
  max_players INTEGER NOT NULL CHECK (max_players >= 2),
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_members (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

CREATE TABLE IF NOT EXISTS game_waitlist (
  id SERIAL PRIMARY KEY,
  game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_scheduled_at ON games(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_game_members_game ON game_members(game_id);
CREATE INDEX IF NOT EXISTS idx_game_waitlist_pos ON game_waitlist(game_id, position);
