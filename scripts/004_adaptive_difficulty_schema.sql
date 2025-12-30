-- Create adaptive difficulty tracking table
CREATE TABLE IF NOT EXISTS adaptive_difficulty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  current_difficulty INT DEFAULT 1,
  performance_score FLOAT DEFAULT 0.5,
  last_updated TIMESTAMP DEFAULT NOW(),
  streak_correct INT DEFAULT 0,
  streak_incorrect INT DEFAULT 0,
  avg_response_time FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Create generated questions table for AI-generated content
CREATE TABLE IF NOT EXISTS generated_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id TEXT NOT NULL,
  difficulty_level INT NOT NULL,
  question_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days'
);

-- Create performance history for trend analysis
CREATE TABLE IF NOT EXISTS performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  score INT NOT NULL,
  difficulty_level INT NOT NULL,
  response_time FLOAT NOT NULL,
  correct_answers INT NOT NULL,
  total_questions INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE adaptive_difficulty ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own adaptive difficulty"
  ON adaptive_difficulty FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own adaptive difficulty"
  ON adaptive_difficulty FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own adaptive difficulty"
  ON adaptive_difficulty FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view generated questions"
  ON generated_questions FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own performance history"
  ON performance_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance history"
  ON performance_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);
