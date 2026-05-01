import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const users = await User.find({})
      .sort({ totalPoints: -1 })
      .limit(100)
      .select("username totalPoints totalGamesPlayed")
      .lean()

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username || "Anonymous",
      totalPoints: user.totalPoints || 0,
      gamesPlayed: user.totalGamesPlayed || 0,
      avgScore: user.totalGamesPlayed ? Math.round((user.totalPoints || 0) / user.totalGamesPlayed) : 0,
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("[v0] Error fetching community leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
  }
}
