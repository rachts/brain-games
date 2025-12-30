import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: insights, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json(insights)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user stats and recent scores
    const { data: stats } = await supabase.from("user_stats").select("*").eq("user_id", user.id).single()

    const { data: recentScores } = await supabase
      .from("game_scores")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)

    if (!stats || !recentScores) {
      return NextResponse.json({ error: "No data available" }, { status: 400 })
    }

    // Calculate game-specific stats
    const gameStats: Record<string, { scores: number[]; count: number }> = {}
    recentScores.forEach((score) => {
      if (!gameStats[score.game_type]) {
        gameStats[score.game_type] = { scores: [], count: 0 }
      }
      gameStats[score.game_type].scores.push(score.score)
      gameStats[score.game_type].count++
    })

    // Calculate improvements
    const improvements: Record<string, number> = {}
    Object.entries(gameStats).forEach(([game, data]) => {
      if (data.scores.length >= 2) {
        const recent = data.scores.slice(0, 5)
        const older = data.scores.slice(5, 10)
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
        const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg

        if (olderAvg > 0) {
          improvements[game] = Math.round(((recentAvg - olderAvg) / olderAvg) * 100)
        }
      }
    })

    // Generate AI insights
    const prompt = `Based on this brain training data, provide 2-3 personalized insights and recommendations:
    
    - Total games played: ${stats.total_games_played}
    - Current level: ${stats.xp_level}
    - Current streak: ${stats.current_streak} days
    - Best streak: ${stats.best_streak} days
    - Total points: ${stats.total_points}
    
    Game performance:
    ${Object.entries(gameStats)
      .map(([game, data]) => {
        const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        const improvement = improvements[game] || 0
        return `- ${game}: ${data.count} games, avg score ${avg}, ${improvement > 0 ? `+${improvement}%` : `${improvement}%`} improvement`
      })
      .join("\n")}
    
    Provide encouraging, specific, and actionable insights. Keep it concise (2-3 sentences).`

    const { text: insight } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
    })

    // Determine insight type
    let insightType = "general"
    if (improvements.memory && improvements.memory > 10) insightType = "memory_improvement"
    else if (improvements.speed && improvements.speed > 10) insightType = "speed_improvement"
    else if (stats.current_streak > stats.best_streak * 0.8) insightType = "streak_momentum"
    else if (stats.xp_level % 10 === 0) insightType = "level_milestone"

    // Save insight to database
    const { data: savedInsight, error: saveError } = await supabase.from("ai_insights").insert({
      user_id: user.id,
      insight_text: insight,
      insight_type: insightType,
    })

    if (saveError) throw saveError

    return NextResponse.json({
      insight,
      type: insightType,
      improvements,
    })
  } catch (error) {
    console.error("AI insights error:", error)
    return NextResponse.json({ error: "Failed to generate insights" }, { status: 500 })
  }
}
