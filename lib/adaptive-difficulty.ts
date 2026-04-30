"use server"

import connectDB from "@/lib/mongodb"
import AdaptiveDifficulty from "@/lib/models/AdaptiveDifficulty"
import PerformanceHistory from "@/lib/models/PerformanceHistory"

interface DifficultyMetrics {
  currentDifficulty: number
  performanceScore: number
  streakCorrect: number
  streakIncorrect: number
  avgResponseTime: number
}

interface PerformanceData {
  score: number
  correctAnswers: number
  totalQuestions: number
  responseTime: number
}

export async function getAdaptiveDifficulty(userId: string, gameId: string): Promise<DifficultyMetrics> {
  await connectDB()

  const data = await AdaptiveDifficulty.findOne({ userId, gameId }).lean()

  if (!data) {
    return {
      currentDifficulty: 1,
      performanceScore: 0.5,
      streakCorrect: 0,
      streakIncorrect: 0,
      avgResponseTime: 0,
    }
  }

  return {
    currentDifficulty: data.currentDifficulty,
    performanceScore: data.performanceScore,
    streakCorrect: data.streakCorrect,
    streakIncorrect: data.streakIncorrect,
    avgResponseTime: data.avgResponseTime,
  }
}

export async function updateAdaptiveDifficulty(
  userId: string,
  gameId: string,
  performanceData: PerformanceData,
): Promise<void> {
  await connectDB()

  // Get current metrics
  const current = await getAdaptiveDifficulty(userId, gameId)

  // Calculate new metrics
  const accuracy =
    performanceData.totalQuestions > 0 ? performanceData.correctAnswers / performanceData.totalQuestions : 0
  const newPerformanceScore = current.performanceScore * 0.7 + accuracy * 0.3
  const newStreakCorrect = accuracy > 0.7 ? current.streakCorrect + 1 : 0
  const newStreakIncorrect = accuracy < 0.5 ? current.streakIncorrect + 1 : 0
  const newAvgResponseTime = current.avgResponseTime * 0.6 + performanceData.responseTime * 0.4

  // Determine new difficulty
  let newDifficulty = current.currentDifficulty
  if (newStreakCorrect >= 3 && newPerformanceScore > 0.75) {
    newDifficulty = Math.min(5, current.currentDifficulty + 1)
  } else if (newStreakIncorrect >= 2 && newPerformanceScore < 0.4) {
    newDifficulty = Math.max(1, current.currentDifficulty - 1)
  }

  // Update adaptive difficulty
  await AdaptiveDifficulty.findOneAndUpdate(
    { userId, gameId },
    {
      currentDifficulty: newDifficulty,
      performanceScore: newPerformanceScore,
      streakCorrect: newStreakCorrect,
      streakIncorrect: newStreakIncorrect,
      avgResponseTime: newAvgResponseTime,
    },
    { upsert: true, new: true }
  )

  // Store performance history
  await PerformanceHistory.create({
    userId,
    gameId,
    score: performanceData.score,
    difficultyLevel: current.currentDifficulty,
    responseTime: performanceData.responseTime,
    correctAnswers: performanceData.correctAnswers,
    totalQuestions: performanceData.totalQuestions,
  })
}

export function calculateDifficultyMultiplier(difficulty: number): number {
  const multipliers: Record<number, number> = {
    1: 1.0,
    2: 1.3,
    3: 1.6,
    4: 2.0,
    5: 2.5,
  }
  return multipliers[difficulty] || 1.0
}
