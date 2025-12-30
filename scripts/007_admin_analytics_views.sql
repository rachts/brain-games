-- Create materialized views for analytics
CREATE MATERIALIZED VIEW daily_active_users AS
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM game_scores
GROUP BY DATE(created_at)
ORDER BY date DESC;

CREATE MATERIALIZED VIEW game_popularity AS
SELECT 
  game_id,
  COUNT(*) as total_plays,
  AVG(score) as avg_score,
  COUNT(DISTINCT user_id) as unique_players
FROM game_scores
GROUP BY game_id
ORDER BY total_plays DESC;

CREATE MATERIALIZED VIEW subscription_metrics AS
SELECT 
  plan_type,
  COUNT(*) as subscriber_count,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions
FROM subscriptions
GROUP BY plan_type;

CREATE MATERIALIZED VIEW retention_metrics AS
SELECT 
  DATE_TRUNC('week', created_at)::DATE as week,
  COUNT(DISTINCT user_id) as new_users,
  COUNT(DISTINCT CASE WHEN DATE(last_sign_in_at) >= DATE_TRUNC('week', created_at)::DATE + INTERVAL '7 days' THEN user_id END) as week_1_retention,
  COUNT(DISTINCT CASE WHEN DATE(last_sign_in_at) >= DATE_TRUNC('week', created_at)::DATE + INTERVAL '14 days' THEN user_id END) as week_2_retention
FROM auth.users
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

CREATE MATERIALIZED VIEW challenge_completion_metrics AS
SELECT 
  game_id,
  difficulty_level,
  COUNT(*) as total_attempts,
  COUNT(CASE WHEN correct_answers = total_questions THEN 1 END) as completed,
  ROUND(100.0 * COUNT(CASE WHEN correct_answers = total_questions THEN 1 END) / COUNT(*), 2) as completion_rate
FROM performance_history
GROUP BY game_id, difficulty_level
ORDER BY game_id, difficulty_level;

-- Create indexes for performance
CREATE INDEX idx_game_scores_created_at ON game_scores(created_at);
CREATE INDEX idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX idx_performance_history_created_at ON performance_history(created_at);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
