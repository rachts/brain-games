import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

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
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const { data, error } = await supabase
    .from("adaptive_difficulty")
    .select("*")
    .eq("user_id", userId)
    .eq("game_id", gameId)
    .single()

  if (error || !data) {
    return {
      currentDifficulty: 1,
      performanceScore: 0.5,
      streakCorrect: 0,
      streakIncorrect: 0,
      avgResponseTime: 0,
    }
  }

  return {
    currentDifficulty: data.current_difficulty,
    performanceScore: data.performance_score,
    streakCorrect: data.streak_correct,
    streakIncorrect: data.streak_incorrect,
    avgResponseTime: data.avg_response_time,
  }
}

export async function updateAdaptiveDifficulty(
  userId: string,
  gameId: string,
  performanceData: PerformanceData,
): Promise<void> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

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
  await supabase
    .from("adaptive_difficulty")
    .upsert({
      user_id: userId,
      game_id: gameId,
      current_difficulty: newDifficulty,
      performance_score: newPerformanceScore,
      streak_correct: newStreakCorrect,
      streak_incorrect: newStreakIncorrect,
      avg_response_time: newAvgResponseTime,
      last_updated: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("game_id", gameId)

  // Store performance history
  await supabase.from("performance_history").insert({
    user_id: userId,
    game_id: gameId,
    score: performanceData.score,
    difficulty_level: current.currentDifficulty,
    response_time: performanceData.responseTime,
    correct_answers: performanceData.correctAnswers,
    total_questions: performanceData.totalQuestions,
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
