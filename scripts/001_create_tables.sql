-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create game_scores table
CREATE TABLE IF NOT EXISTS public.game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  time_taken INTEGER,
  accuracy DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_stats table for tracking progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_games_played INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  xp_level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_type)
);

-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_type TEXT NOT NULL,
  target_score INTEGER NOT NULL,
  current_progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create friend_challenges table
CREATE TABLE IF NOT EXISTS public.friend_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  challenger_score INTEGER,
  opponent_score INTEGER,
  status TEXT DEFAULT 'pending',
  share_token TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_text TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_select_public" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Game Scores RLS Policies
CREATE POLICY "game_scores_select_own" ON public.game_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "game_scores_select_public" ON public.game_scores FOR SELECT USING (TRUE);
CREATE POLICY "game_scores_insert_own" ON public.game_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Stats RLS Policies
CREATE POLICY "user_stats_select_own" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_stats_select_public" ON public.user_stats FOR SELECT USING (TRUE);
CREATE POLICY "user_stats_insert_own" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update_own" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- Achievements RLS Policies
CREATE POLICY "achievements_select_own" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_select_public" ON public.achievements FOR SELECT USING (TRUE);
CREATE POLICY "achievements_insert_own" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Weekly Challenges RLS Policies
CREATE POLICY "weekly_challenges_select_own" ON public.weekly_challenges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "weekly_challenges_insert_own" ON public.weekly_challenges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weekly_challenges_update_own" ON public.weekly_challenges FOR UPDATE USING (auth.uid() = user_id);

-- Friend Challenges RLS Policies
CREATE POLICY "friend_challenges_select_own" ON public.friend_challenges FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "friend_challenges_insert_own" ON public.friend_challenges FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "friend_challenges_update_own" ON public.friend_challenges FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- AI Insights RLS Policies
CREATE POLICY "ai_insights_select_own" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ai_insights_insert_own" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscriptions RLS Policies
CREATE POLICY "subscriptions_select_own" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_insert_own" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "subscriptions_update_own" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_game_scores_user_id ON public.game_scores(user_id);
CREATE INDEX idx_game_scores_created_at ON public.game_scores(created_at);
CREATE INDEX idx_user_stats_user_id ON public.user_stats(user_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_weekly_challenges_user_id ON public.weekly_challenges(user_id);
CREATE INDEX idx_friend_challenges_challenger_id ON public.friend_challenges(challenger_id);
CREATE INDEX idx_friend_challenges_opponent_id ON public.friend_challenges(opponent_id);
