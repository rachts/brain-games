import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const gameType = request.nextUrl.searchParams.get("gameType")
    const limit = Number.parseInt(request.nextUrl.searchParams.get("limit") || "100")

    // Sort by totalPoints for now
    const users = await User.find({})
      .sort({ totalPoints: -1 })
      .limit(limit)
      .select("username totalPoints level currentStreak")
      .lean()

    const formattedData = users.map(user => ({
      user_id: user._id.toString(),
      total_points: user.totalPoints || 0,
      xp_level: user.level || 1,
      current_streak: user.currentStreak || 0,
      profiles: {
        display_name: user.username,
        username: user.username,
        avatar_url: null
      }
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Leaderboard GET Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const { gameType } = await request.json()

    // Mocking specific game leaderboard by fetching all for now,
    // since we might not have game-specific score totals rolled up yet.
    const users = await User.find({})
      .sort({ totalPoints: -1 })
      .limit(50)
      .select("username totalPoints level currentStreak")
      .lean()

    const formattedData = users.map(user => ({
      user_id: user._id.toString(),
      total_points: user.totalPoints || 0,
      xp_level: user.level || 1,
      current_streak: user.currentStreak || 0,
      profiles: {
        display_name: user.username,
        username: user.username,
        avatar_url: null
      }
    }))

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Leaderboard POST Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
