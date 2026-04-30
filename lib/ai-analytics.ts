"use server"

import connectDB from "@/lib/mongodb"
import Score from "@/lib/models/Score"

export interface AIInsight {
  id: string
  insight_text: string
  insight_type: string
  generated_at: string
}

export async function generateInsights(): Promise<AIInsight | null> {
  // Client-side can call the API route, but if this is used from a server component:
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/insights`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/ai/insights`)

    if (!response.ok) throw new Error("Failed to fetch insights")

    return await response.json()
  } catch (error) {
    console.error("Error fetching insights:", error)
    return []
  }
}

export async function getGameRecommendations(userId: string): Promise<string[]> {
  await connectDB()

  const scores = await Score.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  if (!scores || scores.length === 0) return ["memory", "speed", "logic", "attention"]

  // Calculate average score by game type
  const gameStats: Record<string, { total: number; count: number }> = {}
  scores.forEach((score) => {
    if (!gameStats[score.gameId]) {
      gameStats[score.gameId] = { total: 0, count: 0 }
    }
    gameStats[score.gameId].total += score.score
    gameStats[score.gameId].count++
  })

  // Find weakest games
  const gameAverages = Object.entries(gameStats).map(([game, stats]) => ({
    game,
    average: stats.total / stats.count,
  }))

  gameAverages.sort((a, b) => a.average - b.average)

  return gameAverages.slice(0, 2).map((g) => g.game)
}
