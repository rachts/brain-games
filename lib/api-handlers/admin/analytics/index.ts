import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import Score from "@/lib/models/Score"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Mocking analytics data with real counts where possible
    const totalUsers = await User.countDocuments()
    const totalGamesPlayed = await Score.countDocuments()
    
    // We mock the rest of the analytics since they don't map directly to simple models 
    // without complex aggregations which we don't have historical data for yet.
    return NextResponse.json({
      dailyActiveUsers: [],
      gamePopularity: [],
      subscriptionMetrics: [],
      retentionMetrics: [],
      challengeCompletion: [],
      totalUsers: totalUsers,
      totalGamesPlayed: totalGamesPlayed,
      activeSubscriptions: 0,
      userGrowth: 12.5,
      gamesPlayedChange: 8.3,
      subscriptionChange: 15.2,
      avgSessionDuration: 24,
      sessionDurationChange: 5.1,
      retentionRate: 68,
      retentionChange: 3.2,
    })
  } catch (error) {
    console.error("[v0] Error fetching analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
