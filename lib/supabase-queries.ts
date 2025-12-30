import { createClient } from "@/lib/supabase/client"

export interface GameScore {
  id: string
  user_id: string
  game_type: string
  score: number
  difficulty: string
  time_taken?: number
  accuracy?: number
  created_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_games_played: number
  total_points: number
  current_streak: number
  best_streak: number
  xp_level: number
  total_xp: number
  last_played_at?: string
}

// Save game score
export async function saveGameScore(
  gameType: string,
  score: number,
  difficulty: string,
  timeTaken?: number,
  accuracy?: number,
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase.from("game_scores").insert({
    user_id: user.id,
    game_type: gameType,
    score,
    difficulty,
    time_taken: timeTaken,
    accuracy,
  })

  if (error) throw error

  // Update user stats
  await updateUserStats(user.id, score)

  return data
}

// Update user stats after game
async function updateUserStats(userId: string, points: number) {
  const supabase = createClient()

  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (stats) {
    const newStreak = stats.current_streak + 1
    const bestStreak = Math.max(stats.best_streak, newStreak)
    const newXP = stats.total_xp + Math.floor(points / 10)
    const newLevel = Math.floor(newXP / 100) + 1

    await supabase
      .from("user_stats")
      .update({
        total_games_played: stats.total_games_played + 1,
        total_points: stats.total_points + points,
        current_streak: newStreak,
        best_streak: bestStreak,
        xp_level: newLevel,
        total_xp: newXP,
        last_played_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
  }
}

// Get user stats
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (error) return null
  return data
}

// Get game scores for user
export async function getUserGameScores(userId: string, limit = 50): Promise<GameScore[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("game_scores")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

// Get leaderboard
export async function getLeaderboard(limit = 100) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("user_stats")
    .select("user_id, total_points, xp_level, profiles(display_name, username, avatar_url)")
    .order("total_points", { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

// Get game-specific leaderboard
export async function getGameLeaderboard(gameType: string, limit = 50) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_game_leaderboard", {
    p_game_type: gameType,
    p_limit: limit,
  })

  if (error) return []
  return data || []
}

// Get user's best scores by game
export async function getUserBestScores(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_user_best_scores", {
    p_user_id: userId,
  })

  if (error) return {}
  return data || {}
}
