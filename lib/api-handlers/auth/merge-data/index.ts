import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"
import { calculateMergedStats } from "@/lib/data-sync"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { guestData, strategy } = await request.json()

    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const mergedStats = calculateMergedStats(
      {
        xp: user.xp,
        level: user.level,
        bestStreak: user.bestStreak,
        totalPoints: user.totalPoints,
        totalGamesPlayed: user.totalGamesPlayed,
        achievements: [],
      },
      guestData,
      strategy,
    )

    // Save merged scores to database
    if (guestData.scores && guestData.scores.length > 0) {
      const scoreDocs = guestData.scores.map((score: any) => ({
        userId: user._id,
        gameId: score.gameId,
        score: score.score,
        difficulty: score.difficulty,
        timeSpent: score.timeSpent,
        accuracy: score.accuracy,
        createdAt: new Date(score.createdAt),
      }))

      await Score.insertMany(scoreDocs)
    }

    // Update user stats
    user.xp = mergedStats.xp
    user.level = mergedStats.level
    user.bestStreak = mergedStats.bestStreak
    user.totalPoints = mergedStats.totalPoints
    user.totalGamesPlayed = mergedStats.totalGamesPlayed
    user.currentStreak = 0

    await user.save()

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Merge data error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
