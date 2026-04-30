"use server"

import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import WeeklyChallengeModel from "@/lib/models/WeeklyChallenge"
import UserAchievement from "@/lib/models/Achievement"

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

export async function createWeeklyChallenges(userId: string) {
  await connectDB()
  const { start, end } = getWeekDates()

  const challenges = [
    { type: "memory", target: 5000 },
    { type: "speed", target: 4000 },
    { type: "logic", target: 6000 },
    { type: "attention", target: 5500 },
  ]

  for (const challenge of challenges) {
    const existing = await WeeklyChallengeModel.findOne({
      userId,
      challengeType: challenge.type,
      weekStart: start,
    })

    if (!existing) {
      await WeeklyChallengeModel.create({
        userId,
        challengeType: challenge.type,
        targetScore: challenge.target,
        weekStart: start,
        weekEnd: end,
      })
    }
  }
}

export async function updateChallengeProgress(userId: string, gameType: string, score: number) {
  await connectDB()
  const { start } = getWeekDates()

  const challenge = await WeeklyChallengeModel.findOne({
    userId,
    challengeType: gameType,
    weekStart: start,
  })

  if (challenge) {
    const newProgress = challenge.currentProgress + score
    const completed = newProgress >= challenge.targetScore

    challenge.currentProgress = newProgress
    challenge.completed = completed
    await challenge.save()

    if (completed && !challenge.completed) {
      const user = await User.findById(userId)

      if (user) {
        const bonusXP = 500
        const newXP = (user.xp || 0) + bonusXP
        const newLevel = Math.floor(newXP / 100) + 1

        user.xp = newXP
        user.level = newLevel
        await user.save()
      }
    }
  }
}

export async function getWeeklyChallenges(userId: string): Promise<WeeklyChallenge[]> {
  await connectDB()
  const { start } = getWeekDates()

  const data = await WeeklyChallengeModel.find({
    userId,
    weekStart: start,
  }).lean()

  return data.map(d => ({
    id: d._id.toString(),
    user_id: d.userId.toString(),
    challenge_type: d.challengeType,
    target_score: d.targetScore,
    current_progress: d.currentProgress,
    completed: d.completed,
    week_start: d.weekStart,
    week_end: d.weekEnd
  }))
}

export async function checkAndUnlockAchievements(userId: string) {
  await connectDB()

  const stats = await User.findById(userId)

  if (!stats) return

  const unlockedAchievements = await UserAchievement.find({ userId }).lean()
  const unlockedTypes = new Set(unlockedAchievements.map((a) => a.achievementId))

  const achievementsToUnlock = []

  if ((stats.totalGamesPlayed || 0) >= 1 && !unlockedTypes.has("first_game")) {
    achievementsToUnlock.push("first_game")
  }
  if ((stats.totalGamesPlayed || 0) >= 10 && !unlockedTypes.has("ten_games")) {
    achievementsToUnlock.push("ten_games")
  }
  if ((stats.totalGamesPlayed || 0) >= 100 && !unlockedTypes.has("hundred_games")) {
    achievementsToUnlock.push("hundred_games")
  }
  if ((stats.totalGamesPlayed || 0) >= 1000 && !unlockedTypes.has("thousand_games")) {
    achievementsToUnlock.push("thousand_games")
  }
  if ((stats.currentStreak || 0) >= 7 && !unlockedTypes.has("seven_day_streak")) {
    achievementsToUnlock.push("seven_day_streak")
  }
  if ((stats.currentStreak || 0) >= 30 && !unlockedTypes.has("thirty_day_streak")) {
    achievementsToUnlock.push("thirty_day_streak")
  }
  if ((stats.level || 1) >= 10 && !unlockedTypes.has("level_10")) {
    achievementsToUnlock.push("level_10")
  }
  if ((stats.level || 1) >= 50 && !unlockedTypes.has("level_50")) {
    achievementsToUnlock.push("level_50")
  }

  for (const achievementType of achievementsToUnlock) {
    await UserAchievement.create({
      userId,
      achievementId: achievementType,
    })
  }

  return achievementsToUnlock
}

export function getAchievementDetails(type: string): Achievement | undefined {
  return ACHIEVEMENTS[type]
}

export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS)
}
