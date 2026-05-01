import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import Score from "@/lib/models/Score"
import User from "@/lib/models/User"
import { getTokenFromRequest, verifyToken } from "@/lib/jwt"

export async function GET(request: NextRequest) {
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

    const gameId = request.nextUrl.searchParams.get("gameId")

    let query = Score.find({ userId: decoded.userId })

    if (gameId) {
      query = query.where("gameId").equals(gameId)
    }

    const scores = await query.sort({ createdAt: -1 }).limit(100)

    return NextResponse.json(scores)
  } catch (error) {
    console.error("Get scores error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { gameId, score, difficulty, timeSpent, accuracy } = await request.json()

    const newScore = new Score({
      userId: decoded.userId,
      gameId,
      score,
      difficulty,
      timeSpent,
      accuracy,
    })

    await newScore.save()

    const user = await User.findById(decoded.userId)

    if (user) {
      user.totalGamesPlayed += 1
      user.totalPoints += score
      user.xp += score * 10
      user.level = Math.floor(user.xp / 1000) + 1
      user.currentStreak += 1

      if (user.currentStreak > user.bestStreak) {
        user.bestStreak = user.currentStreak
      }

      user.lastPlayedAt = new Date()
      await user.save()
    }

    return NextResponse.json(newScore)
  } catch (error) {
    console.error("Post score error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
