import { createClient } from "@/lib/supabase/client"

export interface WeeklyChallenge {
  id: string
  user_id: string
  challenge_type: string
  target_score: number
  current_progress: number
  completed: boolean
  week_start: string
  week_end: string
}

export interface Achievement {
  id: string
  type: string
  name: string
  description: string
  icon: string
  requirement: number
}

const ACHIEVEMENTS: Record<string, Achievement> = {
  first_game: {
    id: "first_game",
    type: "milestone",
    name: "First Steps",
    description: "Play your first game",
    icon: "🎮",
    requirement: 1,
  },
  ten_games: {
    id: "ten_games",
    type: "milestone",
    name: "Getting Started",
    description: "Play 10 games",
    icon: "🚀",
    requirement: 10,
  },
  hundred_games: {
    id: "hundred_games",
    type: "milestone",
    name: "Dedicated Player",
    description: "Play 100 games",
    icon: "⭐",
    requirement: 100,
  },
  thousand_games: {
    id: "thousand_games",
    type: "milestone",
    name: "Brain Master",
    description: "Play 1000 games",
    icon: "👑",
    requirement: 1000,
  },
  perfect_score: {
    id: "perfect_score",
    type: "skill",
    name: "Perfect Score",
    description: "Achieve 100% accuracy in a game",
    icon: "💯",
    requirement: 100,
  },
  speed_demon: {
    id: "speed_demon",
    type: "skill",
    name: "Speed Demon",
    description: "Complete a game in under 10 seconds",
    icon: "⚡",
    requirement: 10,
  },
  seven_day_streak: {
    id: "seven_day_streak",
    type: "streak",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    requirement: 7,
  },
  thirty_day_streak: {
    id: "thirty_day_streak",
    type: "streak",
    name: "Unstoppable",
    description: "Maintain a 30-day streak",
    icon: "🌟",
    requirement: 30,
  },
  level_10: {
    id: "level_10",
    type: "level",
    name: "Level 10",
    description: "Reach level 10",
    icon: "📈",
    requirement: 10,
  },
  level_50: {
    id: "level_50",
    type: "level",
    name: "Level 50",
    description: "Reach level 50",
    icon: "🏆",
    requirement: 50,
  },
}

// Get current week dates
function getWeekDates() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)

  const weekStart = new Date(now.setDate(diff))
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return {
    start: weekStart.toISOString().split("T")[0],
    end: weekEnd.toISOString().split("T")[0],
  }
}

// Create weekly challenges for user
export async function createWeeklyChallenges(userId: string) {
  const supabase = createClient()
  const { start, end } = getWeekDates()

  const challenges = [
    { type: "memory", target: 5000 },
    { type: "speed", target: 4000 },
    { type: "logic", target: 6000 },
    { type: "attention", target: 5500 },
  ]

  for (const challenge of challenges) {
    const { data: existing } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_type", challenge.type)
      .eq("week_start", start)
      .single()

    if (!existing) {
      await supabase.from("weekly_challenges").insert({
        user_id: userId,
        challenge_type: challenge.type,
        target_score: challenge.target,
        week_start: start,
        week_end: end,
      })
    }
  }
}

// Update weekly challenge progress
export async function updateChallengeProgress(userId: string, gameType: string, score: number) {
  const supabase = createClient()
  const { start } = getWeekDates()

  const { data: challenge } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_type", gameType)
    .eq("week_start", start)
    .single()

  if (challenge) {
    const newProgress = challenge.current_progress + score
    const completed = newProgress >= challenge.target_score

    await supabase
      .from("weekly_challenges")
      .update({
        current_progress: newProgress,
        completed,
      })
      .eq("id", challenge.id)

    if (completed && !challenge.completed) {
      // Award bonus XP for completing challenge
      const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

      if (stats) {
        const bonusXP = 500
        const newXP = stats.total_xp + bonusXP
        const newLevel = Math.floor(newXP / 100) + 1

        await supabase
          .from("user_stats")
          .update({
            total_xp: newXP,
            xp_level: newLevel,
          })
          .eq("user_id", userId)
      }
    }
  }
}

// Get user's weekly challenges
export async function getWeeklyChallenges(userId: string): Promise<WeeklyChallenge[]> {
  const supabase = createClient()
  const { start } = getWeekDates()

  const { data, error } = await supabase
    .from("weekly_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("week_start", start)

  if (error) return []
  return data || []
}

// Check and unlock achievements
export async function checkAndUnlockAchievements(userId: string) {
  const supabase = createClient()

  const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", userId).single()

  if (!stats) return

  const { data: unlockedAchievements } = await supabase
    .from("achievements")
    .select("achievement_type")
    .eq("user_id", userId)

  const unlockedTypes = new Set(unlockedAchievements?.map((a) => a.achievement_type) || [])

  const achievementsToUnlock = []

  if (stats.total_games_played >= 1 && !unlockedTypes.has("first_game")) {
    achievementsToUnlock.push("first_game")
  }
  if (stats.total_games_played >= 10 && !unlockedTypes.has("ten_games")) {
    achievementsToUnlock.push("ten_games")
  }
  if (stats.total_games_played >= 100 && !unlockedTypes.has("hundred_games")) {
    achievementsToUnlock.push("hundred_games")
  }
  if (stats.total_games_played >= 1000 && !unlockedTypes.has("thousand_games")) {
    achievementsToUnlock.push("thousand_games")
  }
  if (stats.current_streak >= 7 && !unlockedTypes.has("seven_day_streak")) {
    achievementsToUnlock.push("seven_day_streak")
  }
  if (stats.current_streak >= 30 && !unlockedTypes.has("thirty_day_streak")) {
    achievementsToUnlock.push("thirty_day_streak")
  }
  if (stats.xp_level >= 10 && !unlockedTypes.has("level_10")) {
    achievementsToUnlock.push("level_10")
  }
  if (stats.xp_level >= 50 && !unlockedTypes.has("level_50")) {
    achievementsToUnlock.push("level_50")
  }

  for (const achievementType of achievementsToUnlock) {
    await supabase.from("achievements").insert({
      user_id: userId,
      achievement_type: achievementType,
    })
  }

  return achievementsToUnlock
}

// Get achievement details
export function getAchievementDetails(type: string): Achievement | undefined {
  return ACHIEVEMENTS[type]
}

// Get all achievements
export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS)
}
