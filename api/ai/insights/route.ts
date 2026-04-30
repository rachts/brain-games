import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AiInsight from "@/lib/models/AiInsight"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"
import { generateText } from "ai"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const insights = await AiInsight.find({ userId: decoded.userId })
      .sort({ generatedAt: -1 })
      .limit(10)
      .lean()

    const formattedData = insights.map(insight => ({
      id: insight._id.toString(),
      user_id: insight.userId.toString(),
      insight_text: insight.insightText,
      insight_type: insight.insightType,
      generated_at: insight.generatedAt,
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await User.findById(decoded.userId).lean()
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const recentScores = await Score.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()

    if (recentScores.length === 0) {
      return NextResponse.json({ error: "No data available" }, { status: 400 })
    }

    const gameStats: Record<string, { scores: number[]; count: number }> = {}
    recentScores.forEach((score) => {
      if (!gameStats[score.gameId]) {
        gameStats[score.gameId] = { scores: [], count: 0 }
      }
      gameStats[score.gameId].scores.push(score.score)
      gameStats[score.gameId].count++
    })

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

    const prompt = `Based on this brain training data, provide 2-3 personalized insights and recommendations:
    
    - Total games played: ${user.totalGamesPlayed || 0}
    - Current level: ${user.level || 1}
    - Current streak: ${user.currentStreak || 0} days
    - Best streak: ${user.bestStreak || 0} days
    - Total points: ${user.totalPoints || 0}
    
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
      model: "openai/gpt-4o-mini", // Assuming we still have openai installed via `ai` package
      prompt,
    })

    let insightType = "general"
    if (improvements.memory && improvements.memory > 10) insightType = "memory_improvement"
    else if (improvements.speed && improvements.speed > 10) insightType = "speed_improvement"
    else if ((user.currentStreak || 0) > (user.bestStreak || 0) * 0.8) insightType = "streak_momentum"
    else if ((user.level || 1) % 10 === 0) insightType = "level_milestone"

    const newInsight = new AiInsight({
      userId: decoded.userId,
      insightText: insight,
      insightType: insightType,
    })
    
    await newInsight.save()

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
