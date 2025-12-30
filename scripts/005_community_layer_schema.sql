-- Create battle rooms table
CREATE TABLE IF NOT EXISTS battle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  difficulty_level INT DEFAULT 1,
  max_players INT DEFAULT 2,
  status TEXT DEFAULT 'waiting', -- waiting, in_progress, completed
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  room_code TEXT UNIQUE NOT NULL
);

-- Create battle room participants
CREATE TABLE IF NOT EXISTS battle_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES battle_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  total_questions INT DEFAULT 0,
  response_time FLOAT DEFAULT 0,
  finished_at TIMESTAMP,
  rank INT,
  UNIQUE(room_id, user_id)
);

-- Create community discussions table
CREATE TABLE IF NOT EXISTS community_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  game_id TEXT,
  likes INT DEFAULT 0,
  replies_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create discussion replies
CREATE TABLE IF NOT EXISTS discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id UUID NOT NULL REFERENCES community_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create public leaderboard view
CREATE TABLE IF NOT EXISTS public_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  total_points INT DEFAULT 0,
  games_played INT DEFAULT 0,
  avg_score FLOAT DEFAULT 0,
  rank INT,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_leaderboard ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view battle rooms"
  ON battle_rooms FOR SELECT
  USING (true);

CREATE POLICY "Users can create battle rooms"
  ON battle_rooms FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own battle rooms"
  ON battle_rooms FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Anyone can view battle participants"
  ON battle_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can insert battle participants"
  ON battle_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view discussions"
  ON community_discussions FOR SELECT
  USING (true);

CREATE POLICY "Users can create discussions"
  ON community_discussions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
  ON community_discussions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view discussion replies"
  ON discussion_replies FOR SELECT
  USING (true);

CREATE POLICY "Users can create replies"
  ON discussion_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public leaderboard"
  ON public_leaderboard FOR SELECT
  USING (true);
