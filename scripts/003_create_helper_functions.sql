-- Function to get game leaderboard
CREATE OR REPLACE FUNCTION get_game_leaderboard(p_game_type TEXT, p_limit INT DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  username TEXT,
  avatar_url TEXT,
  best_score INT,
  average_score NUMERIC,
  times_played INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.user_id,
    p.display_name,
    p.username,
    p.avatar_url,
    MAX(gs.score)::INT as best_score,
    ROUND(AVG(gs.score)::NUMERIC, 2) as average_score,
    COUNT(*)::INT as times_played
  FROM game_scores gs
  JOIN profiles p ON gs.user_id = p.id
  WHERE gs.game_type = p_game_type
  GROUP BY gs.user_id, p.display_name, p.username, p.avatar_url
  ORDER BY best_score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's best scores by game
CREATE OR REPLACE FUNCTION get_user_best_scores(p_user_id UUID)
RETURNS TABLE (
  game_type TEXT,
  best_score INT,
  average_score NUMERIC,
  times_played INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gs.game_type,
    MAX(gs.score)::INT as best_score,
    ROUND(AVG(gs.score)::NUMERIC, 2) as average_score,
    COUNT(*)::INT as times_played
  FROM game_scores gs
  WHERE gs.user_id = p_user_id
  GROUP BY gs.game_type
  ORDER BY best_score DESC;
END;
$$ LANGUAGE plpgsql;
