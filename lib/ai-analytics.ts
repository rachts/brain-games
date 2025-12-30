import { createClient } from "@/lib/supabase/client"

export interface AIInsight {
  id: string
  insight_text: string
  insight_type: string
  generated_at: string
}

export async function generateInsights(): Promise<AIInsight | null> {
  try {
    const response = await fetch("/api/ai/insights", {
      method: "POST",
    })

    if (!response.ok) throw new Error("Failed to generate insights")

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error generating insights:", error)
    return null
  }
}

export async function getInsights(): Promise<AIInsight[]> {
  try {
    const response = await fetch("/api/ai/insights")

    if (!response.ok) throw new Error("Failed to fetch insights")

    return await response.json()
  } catch (error) {
    console.error("Error fetching insights:", error)
    return []
  }
}

export async function getGameRecommendations(userId: string): Promise<string[]> {
  const supabase = createClient()

  const { data: scores } = await supabase
    .from("game_scores")
    .select("game_type, score")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (!scores || scores.length === 0) return ["memory", "speed", "logic", "attention"]

  // Calculate average score by game type
  const gameStats: Record<string, { total: number; count: number }> = {}
  scores.forEach((score) => {
    if (!gameStats[score.game_type]) {
      gameStats[score.game_type] = { total: 0, count: 0 }
    }
    gameStats[score.game_type].total += score.score
    gameStats[score.game_type].count++
  })

  // Find weakest games
  const gameAverages = Object.entries(gameStats).map(([game, stats]) => ({
    game,
    average: stats.total / stats.count,
  }))

  gameAverages.sort((a, b) => a.average - b.average)

  return gameAverages.slice(0, 2).map((g) => g.game)
}
