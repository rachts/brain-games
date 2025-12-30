import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
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

    const user = await User.findById(decoded.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      displayName: user.username,
      xp: user.xp,
      level: user.level,
      currentStreak: user.currentStreak,
      bestStreak: user.bestStreak,
      totalGamesPlayed: user.totalGamesPlayed,
      totalPoints: user.totalPoints,
      subscriptionTier: user.subscriptionTier,
    }

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
