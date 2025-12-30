-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_type TEXT DEFAULT 'free', -- free, pro, elite
  status TEXT DEFAULT 'active', -- active, canceled, past_due
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create subscription features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_value TEXT,
  UNIQUE(plan_type, feature_name)
);

-- Create premium game access logs
CREATE TABLE IF NOT EXISTS premium_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE premium_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view subscription features"
  ON subscription_features FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own access logs"
  ON premium_access_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own access logs"
  ON premium_access_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert subscription features
INSERT INTO subscription_features (plan_type, feature_name, feature_value) VALUES
('free', 'games_per_day', '5'),
('free', 'max_difficulty', '3'),
('free', 'analytics', 'basic'),
('free', 'leaderboard_access', 'true'),
('pro', 'games_per_day', 'unlimited'),
('pro', 'max_difficulty', '5'),
('pro', 'analytics', 'advanced'),
('pro', 'ai_coaching', 'true'),
('pro', 'exclusive_games', '3'),
('pro', 'price_monthly', '9.99'),
('elite', 'games_per_day', 'unlimited'),
('elite', 'max_difficulty', '5'),
('elite', 'analytics', 'advanced'),
('elite', 'ai_coaching', 'true'),
('elite', 'exclusive_games', 'all'),
('elite', 'tournaments', 'true'),
('elite', 'price_monthly', '19.99');
