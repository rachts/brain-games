import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { generateToken } from "@/lib/jwt"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password } = await request.json()

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken(user._id.toString())

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

    return NextResponse.json({ user: userData, token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
